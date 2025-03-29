
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useApiSimulation, CloudProvider } from '@/services/apiSimulationService';
import CloudProviderCard from '@/components/CloudProviderCard';
import StatusIndicator from '@/components/StatusIndicator';
import TrafficDistributionChart from '@/components/TrafficDistributionChart';
import PerformanceChart from '@/components/PerformanceChart';
import NetworkVisualizer from '@/components/NetworkVisualizer';
import MetricsOverview from '@/components/MetricsOverview';
import { Play, Pause, AlertTriangle, Zap, Info } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const { 
    providers, 
    history,
    isSimulationRunning, 
    startSimulation, 
    stopSimulation,
    degradeProvider,
    improveProvider,
    selectedProvider,
    setSelectedProvider
  } = useApiSimulation();

  useEffect(() => {
    // Start simulation automatically when page loads
    startSimulation();
    
    // Show welcome toast
    toast({
      title: "Welcome to Smart API Router",
      description: "The simulation is now running. You can pause it or simulate failures to see how the AI adapts routing.",
    });
    
    // Clean up when component unmounts
    return () => {
      stopSimulation();
    };
  }, []);

  const handleDegradeProvider = () => {
    if (!selectedProvider) {
      toast({
        title: "No Provider Selected",
        description: "Please select a cloud provider first.",
        variant: "destructive",
      });
      return;
    }
    
    degradeProvider(selectedProvider);
    toast({
      title: "Provider Degraded",
      description: `${selectedProvider.toUpperCase()} performance has been degraded. Watch the AI reroute traffic.`,
      variant: "destructive",
    });
  };
  
  const handleImproveProvider = () => {
    if (!selectedProvider) {
      toast({
        title: "No Provider Selected",
        description: "Please select a cloud provider first.",
        variant: "destructive",
      });
      return;
    }
    
    improveProvider(selectedProvider);
    toast({
      title: "Provider Recovered",
      description: `${selectedProvider.toUpperCase()} performance has been restored. Watch the AI adjust the traffic.`,
    });
  };
  
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      stopSimulation();
      toast({
        title: "Simulation Paused",
        description: "The traffic routing simulation is now paused.",
      });
    } else {
      startSimulation();
      toast({
        title: "Simulation Running",
        description: "The traffic routing simulation is now running.",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart API Router</h1>
            <p className="text-muted-foreground mt-1">
              AI-Powered Traffic Routing Across Multiple Cloud Providers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSimulation}
              className="shadow-sm"
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>{isSimulationRunning ? "Simulation running" : "Simulation paused"}</span>
            </div>
          </div>
        </div>
        
        {/* Metrics Overview */}
        <MetricsOverview providers={providers} />
        
        {/* Cloud Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CloudProviderCard 
            provider="aws" 
            metrics={providers.aws} 
            isSelected={selectedProvider === 'aws'}
            onClick={() => setSelectedProvider(selectedProvider === 'aws' ? null : 'aws')}
          />
          <CloudProviderCard 
            provider="azure" 
            metrics={providers.azure} 
            isSelected={selectedProvider === 'azure'}
            onClick={() => setSelectedProvider(selectedProvider === 'azure' ? null : 'azure')}
          />
          <CloudProviderCard 
            provider="gcp" 
            metrics={providers.gcp} 
            isSelected={selectedProvider === 'gcp'}
            onClick={() => setSelectedProvider(selectedProvider === 'gcp' ? null : 'gcp')}
          />
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <Button 
            variant="destructive" 
            disabled={!selectedProvider} 
            onClick={handleDegradeProvider}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Simulate Provider Failure
          </Button>
          <Button 
            variant="default" 
            disabled={!selectedProvider} 
            onClick={handleImproveProvider}
          >
            <Zap className="h-4 w-4 mr-2" />
            Recover Provider
          </Button>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrafficDistributionChart providers={providers} />
          <NetworkVisualizer providers={providers} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PerformanceChart 
            history={history}
            metric="responseTime"
            title="Response Time History"
            yAxisLabel="Time (ms)"
          />
          <PerformanceChart 
            history={history}
            metric="trafficPercentage" 
            title="Traffic Distribution History"
            yAxisLabel="Traffic (%)"
          />
        </div>
        
        {/* Explanation */}
        <div className="bg-accent p-4 rounded-lg border mt-6">
          <h3 className="text-lg font-semibold mb-2">How This Works</h3>
          <p className="text-muted-foreground text-sm">
            This dashboard demonstrates AI-powered API traffic routing across multiple cloud providers.
            The simulation uses reinforcement learning to optimize performance, cost, and reliability in real time.
            When one provider experiences degraded performance, the AI automatically reroutes traffic to the healthier providers
            to maintain optimal API responsiveness and uptime.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-aws" />
              <span className="text-sm">AWS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-azure" />
              <span className="text-sm">Microsoft Azure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gcp" />
              <span className="text-sm">Google Cloud Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
