
import React from 'react';
import { cn } from '@/lib/utils';
import { HealthStatus } from '@/services/apiSimulationService';

interface StatusIndicatorProps {
  status: HealthStatus;
  pulse?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  pulse = true,
  className
}) => {
  const statusColor = {
    healthy: 'bg-healthy',
    warning: 'bg-warning',
    critical: 'bg-critical'
  };
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'h-3 w-3 rounded-full',
        statusColor[status],
        pulse && 'animate-pulse-opacity'
      )} />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
};

export default StatusIndicator;
