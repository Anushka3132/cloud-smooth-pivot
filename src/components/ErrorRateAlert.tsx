
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { CloudProvider } from '@/services/types/cloudProviderTypes';

interface ErrorRateAlertProps {
  provider: CloudProvider;
  errorRate: number;
}

const ErrorRateAlert: React.FC<ErrorRateAlertProps> = ({ provider, errorRate }) => {
  const formattedErrorRate = (errorRate * 100).toFixed(2);
  const providerName = provider.toUpperCase();
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>High Error Rate Alert: {providerName}</AlertTitle>
      <AlertDescription>
        {providerName} has an error rate of {formattedErrorRate}%, which exceeds the 99th percentile threshold.
        Traffic is being automatically rerouted to healthy providers.
      </AlertDescription>
    </Alert>
  );
};

export default ErrorRateAlert;
