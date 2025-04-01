
import { CloudProviderState, CloudProvider, HealthStatus } from '../types/cloudProviderTypes';

// Helper function to determine status based on metrics
export const determineStatus = (responseTime: number): HealthStatus => {
  if (responseTime < 100) return 'healthy';
  if (responseTime < 300) return 'warning';
  return 'critical';
};

// Calculate traffic distribution using a simplified AI routing algorithm
export const calculateTrafficDistribution = (providers: CloudProviderState): Record<CloudProvider, number> => {
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
