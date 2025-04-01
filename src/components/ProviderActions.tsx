import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { log } from '@/services/loggingService';
import { CloudProvider } from '@/services/types/cloudProviderTypes';
import { AlertTriangle, Zap } from 'lucide-react';

interface ProviderActionsProps {
  selectedProvider: CloudProvider | null;
  degradeProvider: (provider: CloudProvider) => void;
  improveProvider: (provider: CloudProvider) => void;
}

const ProviderActions: React.FC<ProviderActionsProps> = ({ 
  selectedProvider, 
  degradeProvider, 
  improveProvider 
}) => {
  const { toast } = useToast();
  
  const handleDegrade = () => {
    if (selectedProvider) {
      degradeProvider(selectedProvider);
      toast({
        title: `${selectedProvider.toUpperCase()} Degraded`,
        description: `Manually degraded ${selectedProvider}.`,
      });
    } else {
      toast({
        title: 'No Provider Selected',
        description: 'Please select a provider to degrade.',
        variant: 'destructive',
      });
    }
  };
  
  const handleImprove = () => {
    if (selectedProvider) {
      improveProvider(selectedProvider);
      toast({
        title: `${selectedProvider.toUpperCase()} Improved`,
        description: `Manually improved ${selectedProvider}.`,
      });
    } else {
      toast({
        title: 'No Provider Selected',
        description: 'Please select a provider to improve.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button 
        variant="destructive" 
        onClick={handleDegrade}
        disabled={!selectedProvider}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Degrade
      </Button>
      <Button 
        variant="outline" 
        onClick={handleImprove}
        disabled={!selectedProvider}
      >
        <Zap className="mr-2 h-4 w-4" />
        Improve
      </Button>
    </div>
  );
};

export default ProviderActions;
