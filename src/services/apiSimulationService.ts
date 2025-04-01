import { create } from 'zustand';
import { log } from './loggingService';

// Cloud provider types and interfaces
export type CloudProvider = 'aws' | 'azure' | 'gcp';
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface ProviderMetrics {
  responseTime: number;
  availabilityPercent: number;
  costPerRequest: number;
  errorRate: number;
  trafficPercentage: number;
  status: HealthStatus;
  requestCount: number;
}

export interface CloudProviderState {
  aws: ProviderMetrics;
  azure: ProviderMetrics;
  gcp: ProviderMetrics;
  totalRequests: number;
  timestamp: number;
}

// History to store past metrics
export interface MetricsHistory {
  timestamps: number[];
  aws: {
    responseTime: number[];
    trafficPercentage: number[];
  };
  azure: {
    responseTime: number[];
    trafficPercentage: number[];
  };
  gcp: {
    responseTime: number[];
    trafficPercentage: number[];
  };
}

interface ApiSimulationState {
  providers: CloudProviderState;
  history: MetricsHistory;
  isSimulationRunning: boolean;
  selectedProvider: CloudProvider | null;
  degradeProvider: (provider: CloudProvider) => void;
  improveProvider: (provider: CloudProvider) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSelectedProvider: (provider: CloudProvider | null) => void;
}

// Helper function to determine status based on metrics
const determineStatus = (responseTime: number): HealthStatus => {
  if (responseTime < 100) return 'healthy';
  if (responseTime < 300) return 'warning';
  return 'critical';
};

// Calculate traffic distribution using a simplified AI routing algorithm
const calculateTrafficDistribution = (providers: CloudProviderState): Record<CloudProvider, number> => {
  const { aws, azure, gcp } = providers;
  
  // Calculate a score for each provider (lower is better)
  // Formula: response time * error rate * (cost per request + 0.1)
  const awsScore = aws.responseTime * (aws.errorRate + 0.5) * (aws.costPerRequest + 0.1);
  const azureScore = azure.responseTime * (azure.errorRate + 0.5) * (azure.costPerRequest + 0.1);
  const gcpScore = gcp.responseTime * (gcp.errorRate + 0.5) * (gcp.costPerRequest + 0.1);
  
  // Inverse of score (higher is better now)
  const awsInverseScore = 1 / awsScore;
  const azureInverseScore = 1 / azureScore;
  const gcpInverseScore = 1 / gcpScore;
  
  // Total inverse score
  const totalInverseScore = awsInverseScore + azureInverseScore + gcpInverseScore;
  
  // Calculate percentages based on inverse scores
  return {
    aws: Math.round((awsInverseScore / totalInverseScore) * 100),
    azure: Math.round((azureInverseScore / totalInverseScore) * 100),
    gcp: Math.round((gcpInverseScore / totalInverseScore) * 100),
  };
};

const initializeHistory = (): MetricsHistory => {
  return {
    timestamps: [],
    aws: { responseTime: [], trafficPercentage: [] },
    azure: { responseTime: [], trafficPercentage: [] },
    gcp: { responseTime: [], trafficPercentage: [] },
  };
};

// Initial state with reasonable defaults
const initialProviders: CloudProviderState = {
  aws: {
    responseTime: 85,
    availabilityPercent: 99.95,
    costPerRequest: 0.20,
    errorRate: 0.01,
    trafficPercentage: 40,
    status: 'healthy',
    requestCount: 0,
  },
  azure: {
    responseTime: 95,
    availabilityPercent: 99.90,
    costPerRequest: 0.18,
    errorRate: 0.015,
    trafficPercentage: 35,
    status: 'healthy',
    requestCount: 0,
  },
  gcp: {
    responseTime: 90,
    availabilityPercent: 99.93,
    costPerRequest: 0.22,
    errorRate: 0.012,
    trafficPercentage: 25,
    status: 'healthy',
    requestCount: 0,
  },
  totalRequests: 0,
  timestamp: Date.now(),
};

export const useApiSimulation = create<ApiSimulationState>((set, get) => {
  let simulationInterval: number | null = null;
  
  const updateHistory = (providers: CloudProviderState) => {
    const { history } = get();
    const newTimestamp = Date.now();
    
    // Only keep the most recent 20 data points
    const MAX_HISTORY_POINTS = 20;
    const timestamps = [...history.timestamps, newTimestamp].slice(-MAX_HISTORY_POINTS);
    
    const awsResponseTime = [...history.aws.responseTime, providers.aws.responseTime].slice(-MAX_HISTORY_POINTS);
    const awsTrafficPercentage = [...history.aws.trafficPercentage, providers.aws.trafficPercentage].slice(-MAX_HISTORY_POINTS);
    
    const azureResponseTime = [...history.azure.responseTime, providers.azure.responseTime].slice(-MAX_HISTORY_POINTS);
    const azureTrafficPercentage = [...history.azure.trafficPercentage, providers.azure.trafficPercentage].slice(-MAX_HISTORY_POINTS);
    
    const gcpResponseTime = [...history.gcp.responseTime, providers.gcp.responseTime].slice(-MAX_HISTORY_POINTS);
    const gcpTrafficPercentage = [...history.gcp.trafficPercentage, providers.gcp.trafficPercentage].slice(-MAX_HISTORY_POINTS);
    
    return {
      timestamps,
      aws: { responseTime: awsResponseTime, trafficPercentage: awsTrafficPercentage },
      azure: { responseTime: azureResponseTime, trafficPercentage: azureTrafficPercentage },
      gcp: { responseTime: gcpResponseTime, trafficPercentage: gcpTrafficPercentage },
    };
  };

  const simulationTick = () => {
    const { providers } = get();
    
    // Generate random fluctuations in metrics
    const randomChange = (min: number, max: number) => Math.random() * (max - min) + min;
    
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
    
    const newGcp = {
      ...providers.gcp,
      responseTime: Math.max(20, providers.gcp.responseTime + randomChange(-5, 5)),
      errorRate: Math.max(0.001, Math.min(0.1, providers.gcp.errorRate + randomChange(-0.002, 0.002))),
      availabilityPercent: Math.min(100, Math.max(95, providers.gcp.availabilityPercent + randomChange(-0.05, 0.05))),
    };
    
    // Update status based on new response times
    newAws.status = determineStatus(newAws.responseTime);
    newAzure.status = determineStatus(newAzure.responseTime);
    newGcp.status = determineStatus(newGcp.responseTime);
    
    // AI traffic routing calculation
    const trafficDistribution = calculateTrafficDistribution({
      ...providers,
      aws: newAws,
      azure: newAzure,
      gcp: newGcp,
    });
    
    // Apply the new traffic distribution
    newAws.trafficPercentage = trafficDistribution.aws;
    newAzure.trafficPercentage = trafficDistribution.azure;
    newGcp.trafficPercentage = trafficDistribution.gcp;
    
    // Update request counts
    const newRequests = Math.floor(Math.random() * 100) + 50; // 50-150 new requests
    const totalRequests = providers.totalRequests + newRequests;
    
    newAws.requestCount = providers.aws.requestCount + Math.floor(newRequests * (newAws.trafficPercentage / 100));
    newAzure.requestCount = providers.azure.requestCount + Math.floor(newRequests * (newAzure.trafficPercentage / 100));
    newGcp.requestCount = providers.gcp.requestCount + Math.floor(newRequests * (newGcp.trafficPercentage / 100));
    
    const updatedProviders = {
      aws: newAws,
      azure: newAzure,
      gcp: newGcp,
      totalRequests,
      timestamp: Date.now(),
    };
    
    // Log important provider changes
    if (newAws.status !== providers.aws.status) {
      log.info(
        `AWS status changed from ${providers.aws.status} to ${newAws.status}`, 
        'api', 
        { 
          responseTime: newAws.responseTime,
          errorRate: newAws.errorRate,
          trafficPercentage: newAws.trafficPercentage
        },
        'aws'
      );
    }
    
    if (newAzure.status !== providers.azure.status) {
      log.info(
        `Azure status changed from ${providers.azure.status} to ${newAzure.status}`, 
        'api', 
        { 
          responseTime: newAzure.responseTime,
          errorRate: newAzure.errorRate, 
          trafficPercentage: newAzure.trafficPercentage
        },
        'azure'
      );
    }
    
    if (newGcp.status !== providers.gcp.status) {
      log.info(
        `GCP status changed from ${providers.gcp.status} to ${newGcp.status}`, 
        'api', 
        {
          responseTime: newGcp.responseTime,
          errorRate: newGcp.errorRate,
          trafficPercentage: newGcp.trafficPercentage
        },
        'gcp'
      );
    }
    
    // Log significant traffic shifts (more than 10%)
    const trafficShift = {
      aws: Math.abs(newAws.trafficPercentage - providers.aws.trafficPercentage),
      azure: Math.abs(newAzure.trafficPercentage - providers.azure.trafficPercentage),
      gcp: Math.abs(newGcp.trafficPercentage - providers.gcp.trafficPercentage),
    };
    
    if (Object.values(trafficShift).some(shift => shift > 10)) {
      log.info(
        'Significant traffic redistribution detected', 
        'routing', 
        {
          previous: {
            aws: providers.aws.trafficPercentage,
            azure: providers.azure.trafficPercentage,
            gcp: providers.gcp.trafficPercentage
          },
          current: {
            aws: newAws.trafficPercentage,
            azure: newAzure.trafficPercentage,
            gcp: newGcp.trafficPercentage
          }
        }
      );
    }
    
    // Update state with new metrics and history
    set({
      providers: updatedProviders,
      history: updateHistory(updatedProviders),
    });
  };

  return {
    providers: initialProviders,
    history: initializeHistory(),
    isSimulationRunning: false,
    selectedProvider: null,
    
    degradeProvider: (provider) => {
      const { providers } = get();
      const updatedProviders = { ...providers };
      
      // Significantly degrade the selected provider
      updatedProviders[provider] = {
        ...updatedProviders[provider],
        responseTime: updatedProviders[provider].responseTime + 200,
        errorRate: Math.min(0.3, updatedProviders[provider].errorRate + 0.15),
        status: 'critical',
      };
      
      // Recalculate traffic distribution
      const trafficDistribution = calculateTrafficDistribution(updatedProviders);
      
      // Apply new traffic distribution
      updatedProviders.aws.trafficPercentage = trafficDistribution.aws;
      updatedProviders.azure.trafficPercentage = trafficDistribution.azure;
      updatedProviders.gcp.trafficPercentage = trafficDistribution.gcp;
      
      // Log degradation event
      log.warning(
        `${provider.toUpperCase()} provider manually degraded by user`, 
        'api', 
        {
          responseTime: updatedProviders[provider].responseTime,
          errorRate: updatedProviders[provider].errorRate,
          status: 'critical'
        },
        provider
      );
      
      set({
        providers: updatedProviders,
        history: updateHistory(updatedProviders),
      });
    },
    
    improveProvider: (provider) => {
      const { providers } = get();
      const updatedProviders = { ...providers };
      
      // Improve the selected provider back to good metrics
      updatedProviders[provider] = {
        ...updatedProviders[provider],
        responseTime: Math.max(70, updatedProviders[provider].responseTime - 200),
        errorRate: Math.max(0.01, updatedProviders[provider].errorRate - 0.15),
        status: 'healthy',
      };
      
      // Recalculate traffic distribution
      const trafficDistribution = calculateTrafficDistribution(updatedProviders);
      
      // Apply new traffic distribution
      updatedProviders.aws.trafficPercentage = trafficDistribution.aws;
      updatedProviders.azure.trafficPercentage = trafficDistribution.azure;
      updatedProviders.gcp.trafficPercentage = trafficDistribution.gcp;
      
      // Log improvement event
      log.info(
        `${provider.toUpperCase()} provider manually improved by user`, 
        'api', 
        {
          responseTime: updatedProviders[provider].responseTime,
          errorRate: updatedProviders[provider].errorRate,
          status: 'healthy'
        },
        provider
      );
      
      set({
        providers: updatedProviders,
        history: updateHistory(updatedProviders),
      });
    },
    
    startSimulation: () => {
      if (simulationInterval) {
        window.clearInterval(simulationInterval);
      }
      
      log.info('Simulation started', 'api');
      simulationInterval = window.setInterval(simulationTick, 1500);
      
      set({ isSimulationRunning: true });
    },
    
    stopSimulation: () => {
      if (simulationInterval) {
        window.clearInterval(simulationInterval);
        simulationInterval = null;
      }
      
      log.info('Simulation stopped', 'api');
      set({ isSimulationRunning: false });
    },
    
    setSelectedProvider: (provider) => {
      if (provider) {
        log.debug(`Provider ${provider} selected by user`, 'frontend');
      }
      set({ selectedProvider: provider });
    },
  };
});
