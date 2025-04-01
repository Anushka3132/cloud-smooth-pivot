import { CloudProviderState, MetricsHistory } from '../types/cloudProviderTypes';

export const updateHistory = (providers: CloudProviderState, history: MetricsHistory): MetricsHistory => {
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
