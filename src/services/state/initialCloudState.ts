
import { CloudProviderState, MetricsHistory } from '../types/cloudProviderTypes';

// Initial provider state with metrics
export const initialProviders: CloudProviderState = {
  aws: {
    responseTime: 85,
    availabilityPercent: 99.96,
    costPerRequest: 0.00012,
    errorRate: 0.022,
    trafficPercentage: 35,
    status: 'healthy',
    requestCount: 1250
  },
  azure: {
    responseTime: 92,
    availabilityPercent: 99.94,
    costPerRequest: 0.00013,
    errorRate: 0.018,
    trafficPercentage: 33,
    status: 'healthy',
    requestCount: 1150
  },
  gcp: {
    responseTime: 80,
    availabilityPercent: 99.97,
    costPerRequest: 0.00011,
    // Reduced initial error rate for GCP
    errorRate: 0.011,
    trafficPercentage: 32,
    status: 'healthy',
    requestCount: 1100
  },
  totalRequests: 3500,
  timestamp: Date.now()
};

// Initialize metrics history
export const initializeHistory = (): MetricsHistory => ({
  timestamps: [],
  aws: {
    responseTime: [],
    trafficPercentage: [],
  },
  azure: {
    responseTime: [],
    trafficPercentage: [],
  },
  gcp: {
    responseTime: [],
    trafficPercentage: [],
  },
});
