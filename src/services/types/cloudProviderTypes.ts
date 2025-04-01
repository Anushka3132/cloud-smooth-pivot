
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
