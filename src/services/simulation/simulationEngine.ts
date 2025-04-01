
import { CloudProviderState } from '../types/cloudProviderTypes';
import { determineStatus, calculateTrafficDistribution } from '../utils/cloudProviderUtils';
import { checkErrorRateAlerts } from '../utils/alertUtils';
import { log } from '../loggingService';

// Generate random fluctuations in metrics
export const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;

// Update metrics with random changes
export const simulateMetricsChanges = (providers: CloudProviderState): CloudProviderState => {
  // Updated metrics with randomness
  const newAws = {
    ...providers.aws,
    responseTime: Math.max(20, providers.aws.responseTime + randomChange(-5, 5)),
    errorRate: Math.max(0.001, Math.min(0.1, providers.aws.errorRate + randomChange(-0.002, 0.002))),
    availabilityPercent: Math.min(100, Math.max(95, providers.aws.availabilityPercent + randomChange(-0.05, 0.05))),
  };
  
  const newAzure = {
    ...providers.azure,
    responseTime: Math.max(20, providers.azure.responseTime + randomChange(-5, 5)),
    errorRate: Math.max(0.001, Math.min(0.1, providers.azure.errorRate + randomChange(-0.002, 0.002))),
    availabilityPercent: Math.min(100, Math.max(95, providers.azure.availabilityPercent + randomChange(-0.05, 0.05))),
  };
  
  // GCP with improved error rate - reduce the base error rate and the random fluctuation range
  const newGcp = {
    ...providers.gcp,
    responseTime: Math.max(20, providers.gcp.responseTime + randomChange(-5, 5)),
    // Reduced error rate fluctuation and base value for GCP
    errorRate: Math.max(0.0005, Math.min(0.05, providers.gcp.errorRate * 0.92 + randomChange(-0.001, 0.001))),
    availabilityPercent: Math.min(100, Math.max(96, providers.gcp.availabilityPercent + randomChange(-0.03, 0.07))),
  };
  
  // Update status based on new response times
  newAws.status = determineStatus(newAws.responseTime);
  newAzure.status = determineStatus(newAzure.responseTime);
  newGcp.status = determineStatus(newGcp.responseTime);
  
  return {
    ...providers,
    aws: newAws,
    azure: newAzure,
    gcp: newGcp,
  };
};

// Update traffic distribution and requests
export const updateTrafficAndRequests = (providers: CloudProviderState): CloudProviderState => {
  // AI traffic routing calculation
  const trafficDistribution = calculateTrafficDistribution(providers);
  
  // Create a copy of the providers with updated traffic distribution
  const updatedProviders = {
    ...providers,
    aws: { ...providers.aws, trafficPercentage: trafficDistribution.aws },
    azure: { ...providers.azure, trafficPercentage: trafficDistribution.azure },
    gcp: { ...providers.gcp, trafficPercentage: trafficDistribution.gcp },
  };
  
  // Update request counts
  const newRequests = Math.floor(Math.random() * 100) + 50; // 50-150 new requests
  const totalRequests = providers.totalRequests + newRequests;
  
  updatedProviders.aws.requestCount = providers.aws.requestCount + 
    Math.floor(newRequests * (updatedProviders.aws.trafficPercentage / 100));
  updatedProviders.azure.requestCount = providers.azure.requestCount + 
    Math.floor(newRequests * (updatedProviders.azure.trafficPercentage / 100));
  updatedProviders.gcp.requestCount = providers.gcp.requestCount + 
    Math.floor(newRequests * (updatedProviders.gcp.trafficPercentage / 100));
  
  // Check for error rate alerts
  checkErrorRateAlerts(updatedProviders);
  
  return {
    ...updatedProviders,
    totalRequests,
    timestamp: Date.now(),
  };
};

// Log important provider changes
export const logProviderChanges = (
  oldProviders: CloudProviderState, 
  newProviders: CloudProviderState
): void => {
  // Log status changes
  if (newProviders.aws.status !== oldProviders.aws.status) {
    log.info(
      `AWS status changed from ${oldProviders.aws.status} to ${newProviders.aws.status}`, 
      'api', 
      { 
        responseTime: newProviders.aws.responseTime,
        errorRate: newProviders.aws.errorRate,
        trafficPercentage: newProviders.aws.trafficPercentage
      },
      'aws'
    );
  }
  
  if (newProviders.azure.status !== oldProviders.azure.status) {
    log.info(
      `Azure status changed from ${oldProviders.azure.status} to ${newProviders.azure.status}`, 
      'api', 
      { 
        responseTime: newProviders.azure.responseTime,
        errorRate: newProviders.azure.errorRate, 
        trafficPercentage: newProviders.azure.trafficPercentage
      },
      'azure'
    );
  }
  
  if (newProviders.gcp.status !== oldProviders.gcp.status) {
    log.info(
      `GCP status changed from ${oldProviders.gcp.status} to ${newProviders.gcp.status}`, 
      'api', 
      {
        responseTime: newProviders.gcp.responseTime,
        errorRate: newProviders.gcp.errorRate,
        trafficPercentage: newProviders.gcp.trafficPercentage
      },
      'gcp'
    );
  }
  
  // Log significant traffic shifts (more than 10%)
  const trafficShift = {
    aws: Math.abs(newProviders.aws.trafficPercentage - oldProviders.aws.trafficPercentage),
    azure: Math.abs(newProviders.azure.trafficPercentage - oldProviders.azure.trafficPercentage),
    gcp: Math.abs(newProviders.gcp.trafficPercentage - oldProviders.gcp.trafficPercentage),
  };
  
  if (Object.values(trafficShift).some(shift => shift > 10)) {
    log.info(
      'Significant traffic redistribution detected', 
      'routing', 
      {
        previous: {
          aws: oldProviders.aws.trafficPercentage,
          azure: oldProviders.azure.trafficPercentage,
          gcp: oldProviders.gcp.trafficPercentage
        },
        current: {
          aws: newProviders.aws.trafficPercentage,
          azure: newProviders.azure.trafficPercentage,
          gcp: newProviders.gcp.trafficPercentage
        }
      }
    );
  }
};
