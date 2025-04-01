
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudProviderState, CloudProvider } from '@/services/types/cloudProviderTypes';
import { ActivitySquare, Cpu, Clock, CloudOff } from 'lucide-react';
import ErrorRateAlert from './ErrorRateAlert';

interface MetricsOverviewProps {
  providers: CloudProviderState;
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ providers }) => {
  // Calculate the weighted average response time based on traffic distribution
  const averageResponseTime = (
    (providers.aws.responseTime * providers.aws.trafficPercentage) +
    (providers.azure.responseTime * providers.azure.trafficPercentage) +
    (providers.gcp.responseTime * providers.gcp.trafficPercentage)
  ) / 100;
  
  // Calculate overall error rate
  const overallErrorRate = (
    (providers.aws.errorRate * providers.aws.trafficPercentage) +
    (providers.azure.errorRate * providers.azure.trafficPercentage) +
    (providers.gcp.errorRate * providers.gcp.trafficPercentage)
  ) / 100;
  
  // Calculate overall availability 
  const overallAvailability = (
    (providers.aws.availabilityPercent * providers.aws.trafficPercentage) +
    (providers.azure.availabilityPercent * providers.azure.trafficPercentage) +
    (providers.gcp.availabilityPercent * providers.gcp.trafficPercentage)
  ) / 100;
  
  // Calculate requests per second (assume the data is for a 5 second period)
  const requestsPerSecond = providers.totalRequests / 5;
  
  // Check for high error rates (exceeding 5% which we're using as the 99th percentile)
  const ERROR_RATE_THRESHOLD = 0.05;
  const highErrorRateProviders = [
    providers.aws.errorRate >= ERROR_RATE_THRESHOLD ? 'aws' : null,
    providers.azure.errorRate >= ERROR_RATE_THRESHOLD ? 'azure' : null,
    providers.gcp.errorRate >= ERROR_RATE_THRESHOLD ? 'gcp' : null,
  ].filter(Boolean) as CloudProvider[]; // Add explicit type casting here
  
  return (
    <>
      {/* Display error rate alerts if any provider exceeds the threshold */}
      {highErrorRateProviders.map((provider) => (
        <ErrorRateAlert 
          key={provider} 
          provider={provider} 
          errorRate={providers[provider].errorRate} 
        />
      ))}
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{averageResponseTime.toFixed(1)} ms</div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{overallAvailability.toFixed(3)}%</div>
              <Cpu className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{(overallErrorRate * 100).toFixed(2)}%</div>
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{providers.totalRequests.toLocaleString()}</div>
              <ActivitySquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MetricsOverview;
