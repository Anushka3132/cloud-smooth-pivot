
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CloudProviderState, CloudProvider } from '@/services/apiSimulationService';
import { CheckCircle2, XCircle, AlertTriangle, Cpu, Clock, DollarSign, HelpCircle, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CloudProviderComparisonTableProps {
  providers: CloudProviderState;
}

interface ComparisonMetric {
  name: string;
  description: string;
  icon: React.ReactNode;
  getValue: (provider: CloudProvider, providers: CloudProviderState) => React.ReactNode;
}

const CloudProviderComparisonTable: React.FC<CloudProviderComparisonTableProps> = ({ providers }) => {
  const metrics: ComparisonMetric[] = [
    {
      name: 'Response Time',
      description: 'Average time to respond to API requests',
      icon: <Clock className="h-4 w-4" />,
      getValue: (provider, providers) => (
        <div className="flex items-center">
          <span className="font-medium">{providers[provider].responseTime.toFixed(0)} ms</span>
          {getPerformanceIndicator(providers[provider].responseTime, 'response')}
        </div>
      ),
    },
    {
      name: 'Availability',
      description: 'Percentage of time the service is operational',
      icon: <Cpu className="h-4 w-4" />,
      getValue: (provider, providers) => (
        <div className="flex items-center">
          <span className="font-medium">{providers[provider].availabilityPercent.toFixed(3)}%</span>
          {getPerformanceIndicator(providers[provider].availabilityPercent, 'availability')}
        </div>
      ),
    },
    {
      name: 'Error Rate',
      description: 'Percentage of failed requests',
      icon: <AlertTriangle className="h-4 w-4" />,
      getValue: (provider, providers) => (
        <div className="flex items-center">
          <span className="font-medium">{(providers[provider].errorRate * 100).toFixed(2)}%</span>
          {getPerformanceIndicator(providers[provider].errorRate, 'error', true)}
        </div>
      ),
    },
    {
      name: 'Cost',
      description: 'Average cost per API request',
      icon: <DollarSign className="h-4 w-4" />,
      getValue: (provider, providers) => (
        <div className="flex items-center">
          <span className="font-medium">${providers[provider].costPerRequest.toFixed(2)}</span>
          {getPerformanceIndicator(providers[provider].costPerRequest, 'cost', true)}
        </div>
      ),
    },
    {
      name: 'Traffic',
      description: 'Current percentage of traffic routed to this provider',
      icon: <Activity className="h-4 w-4" />,
      getValue: (provider, providers) => (
        <div className="font-medium">
          {providers[provider].trafficPercentage}%
        </div>
      ),
    },
  ];

  const getPerformanceIndicator = (value: number, metric: string, lowerIsBetter: boolean = false) => {
    let color = 'text-green-500';
    let icon = <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />;

    // Different thresholds based on metric type
    if (metric === 'response') {
      if (value > 150) {
        color = 'text-red-500';
        icon = <XCircle className="h-3.5 w-3.5 ml-1.5" />;
      } else if (value > 100) {
        color = 'text-amber-500';
        icon = <AlertTriangle className="h-3.5 w-3.5 ml-1.5" />;
      }
    } else if (metric === 'availability') {
      if (value < 99.9) {
        color = 'text-red-500';
        icon = <XCircle className="h-3.5 w-3.5 ml-1.5" />;
      } else if (value < 99.95) {
        color = 'text-amber-500';
        icon = <AlertTriangle className="h-3.5 w-3.5 ml-1.5" />;
      }
    } else if (metric === 'error') {
      if (value > 0.05) {
        color = 'text-red-500';
        icon = <XCircle className="h-3.5 w-3.5 ml-1.5" />;
      } else if (value > 0.01) {
        color = 'text-amber-500';
        icon = <AlertTriangle className="h-3.5 w-3.5 ml-1.5" />;
      }
    } else if (metric === 'cost') {
      if (value > 0.20) {
        color = lowerIsBetter ? 'text-red-500' : 'text-green-500';
        icon = lowerIsBetter ? <XCircle className="h-3.5 w-3.5 ml-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 ml-1.5" />;
      } else if (value > 0.15) {
        color = 'text-amber-500';
        icon = <AlertTriangle className="h-3.5 w-3.5 ml-1.5" />;
      }
    }

    return <span className={color}>{icon}</span>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Metric</TableHead>
            <TableHead className="bg-aws/5">
              <span className="flex items-center text-aws font-medium">
                AWS
              </span>
            </TableHead>
            <TableHead className="bg-azure/5">
              <span className="flex items-center text-azure font-medium">
                Azure
              </span>
            </TableHead>
            <TableHead className="bg-gcp/5">
              <span className="flex items-center text-gcp font-medium">
                Google Cloud
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric.name}>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1.5">
                      {metric.icon}
                      <span>{metric.name}</span>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{metric.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="bg-aws/5">{metric.getValue('aws', providers)}</TableCell>
              <TableCell className="bg-azure/5">{metric.getValue('azure', providers)}</TableCell>
              <TableCell className="bg-gcp/5">{metric.getValue('gcp', providers)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CloudProviderComparisonTable;
