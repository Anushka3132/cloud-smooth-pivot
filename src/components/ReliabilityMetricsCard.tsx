
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudProviderState } from '@/services/types/cloudProviderTypes';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReliabilityMetricsCardProps {
  providers: CloudProviderState;
}

const ReliabilityMetricsCard: React.FC<ReliabilityMetricsCardProps> = ({ providers }) => {
  // Calculate weighted average availability based on traffic distribution
  const weightedAvailability = (
    (providers.aws.availabilityPercent * providers.aws.trafficPercentage) +
    (providers.azure.availabilityPercent * providers.azure.trafficPercentage) +
    (providers.gcp.availabilityPercent * providers.gcp.trafficPercentage)
  ) / 100;
  
  // Calculate improvement over single-provider scenarios
  const improvementOverWorst = (
    weightedAvailability - 
    Math.min(
      providers.aws.availabilityPercent,
      providers.azure.availabilityPercent,
      providers.gcp.availabilityPercent
    )
  ).toFixed(4);
  
  // Get status indicator
  const getAvailabilityStatus = (availability: number) => {
    if (availability >= 99.95) return { 
      icon: <CheckCircle className="h-4 w-4" />, 
      text: 'Excellent',
      color: 'text-green-500'
    };
    if (availability >= 99.9) return { 
      icon: <CheckCircle className="h-4 w-4" />, 
      text: 'Good',
      color: 'text-green-400'
    };
    if (availability >= 99.5) return { 
      icon: <AlertTriangle className="h-4 w-4" />, 
      text: 'Moderate',
      color: 'text-amber-500'
    };
    return { 
      icon: <XCircle className="h-4 w-4" />, 
      text: 'Poor',
      color: 'text-red-500'
    };
  };
  
  const awsStatus = getAvailabilityStatus(providers.aws.availabilityPercent);
  const azureStatus = getAvailabilityStatus(providers.azure.availabilityPercent);
  const gcpStatus = getAvailabilityStatus(providers.gcp.availabilityPercent);
  const overallStatus = getAvailabilityStatus(weightedAvailability);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Reliability Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Overall Availability</span>
              <span className={cn("flex items-center gap-1.5", overallStatus.color)}>
                {overallStatus.icon}
                <span>{overallStatus.text}</span>
                <span className="font-semibold">{weightedAvailability.toFixed(3)}%</span>
              </span>
            </div>
            <Progress 
              value={weightedAvailability - 99} 
              className="h-2"
              indicatorClassName={cn(
                weightedAvailability >= 99.95 ? "bg-green-500" :
                weightedAvailability >= 99.9 ? "bg-green-400" :
                weightedAvailability >= 99.5 ? "bg-amber-500" : 
                "bg-red-500"
              )}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {parseFloat(improvementOverWorst) > 0 ? (
                <span className="text-green-500">+{improvementOverWorst}% improvement with multi-cloud</span>
              ) : (
                <span>No improvement with current traffic distribution</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-aws mb-1">AWS</div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("text-xs flex items-center gap-1", awsStatus.color)}>
                  {awsStatus.icon}
                  <span>{awsStatus.text}</span>
                </span>
              </div>
              <Progress 
                value={providers.aws.availabilityPercent - 99} 
                className="h-1.5"
                indicatorClassName="bg-aws"
              />
              <div className="mt-1 text-xs text-center">
                {providers.aws.availabilityPercent.toFixed(3)}%
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-azure mb-1">Azure</div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("text-xs flex items-center gap-1", azureStatus.color)}>
                  {azureStatus.icon}
                  <span>{azureStatus.text}</span>
                </span>
              </div>
              <Progress 
                value={providers.azure.availabilityPercent - 99} 
                className="h-1.5"
                indicatorClassName="bg-azure"
              />
              <div className="mt-1 text-xs text-center">
                {providers.azure.availabilityPercent.toFixed(3)}%
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gcp mb-1">Google Cloud</div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("text-xs flex items-center gap-1", gcpStatus.color)}>
                  {gcpStatus.icon}
                  <span>{gcpStatus.text}</span>
                </span>
              </div>
              <Progress 
                value={providers.gcp.availabilityPercent - 99} 
                className="h-1.5"
                indicatorClassName="bg-gcp"
              />
              <div className="mt-1 text-xs text-center">
                {providers.gcp.availabilityPercent.toFixed(3)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReliabilityMetricsCard;
