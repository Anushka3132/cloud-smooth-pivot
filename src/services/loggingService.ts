
import { supabase } from "@/integrations/supabase/client";

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';
export type LogSource = 'frontend' | 'api' | 'routing';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata?: Record<string, any>;
  provider?: 'aws' | 'azure' | 'gcp';
}

// Buffer logs to reduce the number of API calls
const logBuffer: LogEntry[] = [];
const BUFFER_TIMEOUT_MS = 2000; // Send logs every 2 seconds
const MAX_BUFFER_SIZE = 10; // Or send when we have 10 logs
let bufferTimeout: number | null = null;

/**
 * Sends the logs to the edge function that will forward to ELK
 */
const flushLogs = async (): Promise<void> => {
  if (logBuffer.length === 0) return;

  const logsToSend = [...logBuffer];
  logBuffer.length = 0; // Clear the buffer

  try {
    const { data, error } = await supabase.functions.invoke('log-collector', {
      body: {
        logs: logsToSend,
        source: window.location.hostname,
        userAgent: navigator.userAgent
      }
    });

    if (error) {
      console.error('Failed to send logs to ELK:', error);
    }
  } catch (error) {
    console.error('Error sending logs:', error);
  }
};

/**
 * Schedules the buffer to be flushed
 */
const scheduleFlush = (): void => {
  if (bufferTimeout) {
    return; // Already scheduled
  }

  bufferTimeout = window.setTimeout(() => {
    flushLogs();
    bufferTimeout = null;
  }, BUFFER_TIMEOUT_MS);
};

/**
 * Adds a log entry to the buffer and flushes if needed
 */
export const addLogEntry = (
  level: LogLevel,
  message: string,
  source: LogSource = 'frontend',
  metadata?: Record<string, any>,
  provider?: 'aws' | 'azure' | 'gcp'
): void => {
  const logEntry: LogEntry = {
    timestamp: Date.now(),
    level,
    source,
    message,
    metadata,
    provider
  };

  logBuffer.push(logEntry);

  // Flush immediately if buffer reaches max size
  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    flushLogs();
  } else {
    scheduleFlush();
  }
};

export const log = {
  info: (message: string, source?: LogSource, metadata?: Record<string, any>, provider?: 'aws' | 'azure' | 'gcp') => 
    addLogEntry('info', message, source, metadata, provider),
  warning: (message: string, source?: LogSource, metadata?: Record<string, any>, provider?: 'aws' | 'azure' | 'gcp') => 
    addLogEntry('warning', message, source, metadata, provider),
  error: (message: string, source?: LogSource, metadata?: Record<string, any>, provider?: 'aws' | 'azure' | 'gcp') => 
    addLogEntry('error', message, source, metadata, provider),
  debug: (message: string, source?: LogSource, metadata?: Record<string, any>, provider?: 'aws' | 'azure' | 'gcp') => 
    addLogEntry('debug', message, source, metadata, provider),
};

// Ensure logs are sent before the page unloads
window.addEventListener('beforeunload', () => {
  flushLogs();
});
