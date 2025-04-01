
// Follow Deno deployment approach for Supabase Edge Functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ELASTICSEARCH_URL = Deno.env.get("ELASTICSEARCH_URL") || "";
const ELASTICSEARCH_USERNAME = Deno.env.get("ELASTICSEARCH_USERNAME") || "";
const ELASTICSEARCH_PASSWORD = Deno.env.get("ELASTICSEARCH_PASSWORD") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LogLevel = 'info' | 'warning' | 'error' | 'debug';
type LogSource = 'frontend' | 'api' | 'routing';

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  metadata?: Record<string, any>;
  provider?: 'aws' | 'azure' | 'gcp';
}

// Function to send logs to Elasticsearch
async function sendToElasticsearch(logs: LogEntry[], source: string, userAgent: string) {
  if (!ELASTICSEARCH_URL) {
    console.error("Elasticsearch URL not configured");
    return { success: false, message: "Elasticsearch not configured" };
  }

  // Format logs for bulk insertion to Elasticsearch
  const bulkBody = logs.flatMap(log => {
    // Each log entry needs an action and source
    return [
      // Action
      { index: { _index: "smart-api-router-logs" } },
      // Source document
      {
        ...log,
        "@timestamp": new Date(log.timestamp).toISOString(),
        source,
        userAgent,
        environment: Deno.env.get("ENVIRONMENT") || "development"
      }
    ];
  });

  try {
    const credentials = btoa(`${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD}`);
    const response = await fetch(`${ELASTICSEARCH_URL}/_bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Authorization': `Basic ${credentials}`
      },
      body: bulkBody.map(item => JSON.stringify(item)).join('\n') + '\n'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Elasticsearch error:", errorText);
      return { success: false, message: `Elasticsearch error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send logs to Elasticsearch:", error);
    return { success: false, message: String(error) };
  }
}

// Function to handle the incoming request
async function handleRequest(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logs, source, userAgent } = await req.json();

    if (!logs || !Array.isArray(logs)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid logs format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Forward logs to Elasticsearch
    const result = await sendToElasticsearch(logs, source, userAgent);

    // Store logs in Supabase as a backup if needed
    // This could be implemented if desired

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing logs:", error);
    
    return new Response(
      JSON.stringify({ success: false, message: String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Start the server
serve(handleRequest);
