
import { CloudProviderState, MetricsHistory } from '../types/cloudProviderTypes';

export const initializeHistory = (): MetricsHistory => {
  return {
    timestamps: [],
    aws: { responseTime: [], trafficPercentage: [] },
    azure: { responseTime: [], trafficPercentage: [] },
    gcp: { responseTime: [], trafficPercentage: [] },
  };
};

// Initial state with reasonable defaults
export const initialProviders: CloudProviderState = {
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
