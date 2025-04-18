import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApiSimulation, CloudProvider } from '@/services/apiSimulationService';
import { log } from '@/services/loggingService';
import CloudProviderCard from '@/components/CloudProviderCard';
import StatusIndicator from '@/components/StatusIndicator';
import TrafficDistributionChart from '@/components/TrafficDistributionChart';
import PerformanceChart from '@/components/PerformanceChart';
import NetworkVisualizer from '@/components/NetworkVisualizer';
import MetricsOverview from '@/components/MetricsOverview';
import CloudProviderComparisonTable from '@/components/CloudProviderComparisonTable';
import CostAnalysisChart from '@/components/CostAnalysisChart';
import ReliabilityMetricsCard from '@/components/ReliabilityMetricsCard';
import { Play, Pause, AlertTriangle, Zap, Info, BarChart3, LineChart } from 'lucide-react';

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
    
    log.info('Application initialized', 'frontend');
    
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
      
      log.warning('User attempted to degrade provider without selection', 'frontend');
      return;
    }
    
    degradeProvider(selectedProvider);
    log.info(`User triggered provider degradation for ${selectedProvider}`, 'frontend');
    
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
      
      log.warning('User attempted to improve provider without selection', 'frontend');
      return;
    }
    
    improveProvider(selectedProvider);
    log.info(`User triggered provider improvement for ${selectedProvider}`, 'frontend');
    
    toast({
      title: "Provider Recovered",
      description: `${selectedProvider.toUpperCase()} performance has been restored. Watch the AI adjust the traffic.`,
    });
  };
  
  const toggleSimulation = () => {
    if (isSimulationRunning) {
      stopSimulation();
      log.info('User paused the simulation', 'frontend');
      
      toast({
        title: "Simulation Paused",
        description: "The traffic routing simulation is now paused.",
      });
    } else {
      startSimulation();
      log.info('User started the simulation', 'frontend');
      
      toast({
        title: "Simulation Running",
        description: "The traffic routing simulation is now running.",
      });
    }
  };

  const handleTabChange = (value: string) => {
    log.debug(`User switched to ${value} tab`, 'frontend');
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
        
        {/* Tabbed Interface for Detailed Analytics */}
        <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Provider Comparison</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="history">Historical Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrafficDistributionChart providers={providers} />
              <NetworkVisualizer providers={providers} />
            </div>
            
            <ReliabilityMetricsCard providers={providers} />
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="space-y-4">
              <CloudProviderComparisonTable providers={providers} />
              <p className="text-sm text-muted-foreground">
                This detailed comparison highlights the strengths and weaknesses of each cloud provider based on real-time metrics.
                The AI routing algorithm uses this data to optimize traffic distribution.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="cost">
            <div className="space-y-4">
              <CostAnalysisChart providers={providers} />
              <p className="text-sm text-muted-foreground">
                The cost analysis shows the financial impact of the current traffic distribution.
                The AI balances cost against performance and reliability when making routing decisions.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
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
            <p className="text-sm text-muted-foreground">
              Historical data shows how the AI has adapted to changing conditions over time,
              optimizing for performance and reliability across all cloud providers.
            </p>
          </TabsContent>
        </Tabs>
        
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
