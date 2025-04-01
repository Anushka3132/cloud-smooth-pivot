
import { CloudProviderState, CloudProvider } from '../types/cloudProviderTypes';
import { toast } from "@/hooks/use-toast";
import { log } from '../loggingService';

// Threshold for triggering alerts (99th percentile)
const ERROR_RATE_THRESHOLD = 0.05; // 5% error rate as the 99th percentile threshold

/**
 * Check if any provider's error rate exceeds the threshold and trigger alerts
 */
export const checkErrorRateAlerts = (providers: CloudProviderState): void => {
  const exceedingProviders: CloudProvider[] = [];
  
  // Check AWS
  if (providers.aws.errorRate >= ERROR_RATE_THRESHOLD) {
    exceedingProviders.push('aws');
  }
  
  // Check Azure
  if (providers.azure.errorRate >= ERROR_RATE_THRESHOLD) {
    exceedingProviders.push('azure');
  }
  
  // Check GCP
  if (providers.gcp.errorRate >= ERROR_RATE_THRESHOLD) {
    exceedingProviders.push('gcp');
  }
  
  // Trigger alerts for providers exceeding the threshold
  exceedingProviders.forEach(provider => {
    const errorRate = providers[provider].errorRate;
    const formattedErrorRate = (errorRate * 100).toFixed(2);
    
    // Log the high error rate event
    log.error(
      `${provider.toUpperCase()} error rate exceeds 99th percentile: ${formattedErrorRate}%`, 
      'api', 
      { errorRate, threshold: ERROR_RATE_THRESHOLD },
      provider
    );
    
    // Show a toast alert
    toast({
      title: `High Error Rate Alert: ${provider.toUpperCase()}`,
      description: `Error rate (${formattedErrorRate}%) exceeds the 99th percentile threshold. Traffic is being rerouted.`,
      variant: "destructive",
    });
  });
};

/**
 * Create a reusable Alert component that can be used throughout the application
 */
export const createErrorRateAlert = (provider: CloudProvider, errorRate: number): {
  title: string;
  description: string;
  variant: "default" | "destructive";
} => {
  const formattedErrorRate = (errorRate * 100).toFixed(2);
  
  return {
    title: `High Error Rate Alert: ${provider.toUpperCase()}`,
    description: `Error rate (${formattedErrorRate}%) exceeds the 99th percentile threshold. Traffic is being rerouted.`,
    variant: "destructive" as const,
  };
};
