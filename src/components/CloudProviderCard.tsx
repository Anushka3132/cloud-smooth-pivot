
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProviderMetrics, CloudProvider } from '@/services/types/cloudProviderTypes';
import StatusIndicator from './StatusIndicator';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Clock, CloudOff, CloudRain, Gauge } from 'lucide-react';

interface CloudProviderCardProps {
  provider: CloudProvider;
  metrics: ProviderMetrics;
  isSelected: boolean;
  onClick: () => void;
}

const providerDetails: Record<CloudProvider, { name: string; color: string }> = {
  aws: { name: 'AWS', color: 'bg-aws text-aws border-aws/20' },
  azure: { name: 'Azure', color: 'bg-azure text-azure border-azure/20' },
  gcp: { name: 'Google Cloud', color: 'bg-gcp text-gcp border-gcp/20' }
};

const CloudProviderCard: React.FC<CloudProviderCardProps> = ({
  provider,
  metrics,
  isSelected,
  onClick
}) => {
  const { name, color } = providerDetails[provider];
  
  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md border-2',
        isSelected ? `border-${provider} shadow-lg` : 'border-border hover:border-gray-300'
      )} 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className={cn("text-lg font-bold", `text-${provider}`)}>
            {name}
          </CardTitle>
          <StatusIndicator status={metrics.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="font-medium">{metrics.responseTime.toFixed(0)} ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="font-medium">{metrics.availabilityPercent.toFixed(2)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Error Rate</p>
              <p className="font-medium">{(metrics.errorRate * 100).toFixed(2)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Cost/Request</p>
              <p className="font-medium">${metrics.costPerRequest.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Traffic Allocation</span>
            <span className="text-sm font-semibold">{metrics.trafficPercentage}%</span>
          </div>
          <Progress 
            value={metrics.trafficPercentage} 
            className={cn("h-2", isSelected ? `bg-${provider}/20` : "bg-secondary")}
            indicatorClassName={`bg-${provider}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudProviderCard;
