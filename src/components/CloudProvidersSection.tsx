import React from 'react';
import { CloudProviderState, CloudProvider } from '@/services/types/cloudProviderTypes';
import CloudProviderCard from '@/components/CloudProviderCard';

interface CloudProvidersSectionProps {
  providers: CloudProviderState;
  selectedProvider: CloudProvider | null;
  onProviderSelect: (provider: CloudProvider) => void;
}

const CloudProvidersSection: React.FC<CloudProvidersSectionProps> = ({ 
  providers, 
  selectedProvider, 
  onProviderSelect 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CloudProviderCard
        provider="aws"
        metrics={providers.aws}
        isSelected={selectedProvider === 'aws'}
        onClick={() => onProviderSelect('aws')}
      />
      <CloudProviderCard
        provider="azure"
        metrics={providers.azure}
        isSelected={selectedProvider === 'azure'}
        onClick={() => onProviderSelect('azure')}
      />
      <CloudProviderCard
        provider="gcp"
        metrics={providers.gcp}
        isSelected={selectedProvider === 'gcp'}
        onClick={() => onProviderSelect('gcp')}
      />
    </div>
  );
};

export default CloudProvidersSection;
