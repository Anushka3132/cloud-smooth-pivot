import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudProviderState, MetricsHistory } from '@/services/types/cloudProviderTypes';
import TrafficDistributionChart from '@/components/TrafficDistributionChart';
import NetworkVisualizer from '@/components/NetworkVisualizer';
import ReliabilityMetricsCard from '@/components/ReliabilityMetricsCard';
import CloudProviderComparisonTable from '@/components/CloudProviderComparisonTable';
import CostAnalysisChart from '@/components/CostAnalysisChart';
import PerformanceChart from '@/components/PerformanceChart';
import { log } from '@/services/loggingService';
import { BarChart3, LineChart } from 'lucide-react';

interface AnalyticsTabsProps {
  providers: CloudProviderState;
  history: MetricsHistory;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ providers, history }) => {
  // Log that the analytics tab was viewed
  React.useEffect(() => {
    log.debug('Analytics tab viewed by user', 'frontend');
  }, []);
  
  return (
    <Tabs defaultValue="overview" className="w-full space-y-4">
      <TabsList>
        <TabsTrigger value="overview" className="flex items-center gap-1.5">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-1.5">
          <LineChart className="h-4 w-4" />
          Performance
        </TabsTrigger>
        <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
        <TabsTrigger value="reliability">Reliability</TabsTrigger>
        <TabsTrigger value="network">Network</TabsTrigger>
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TrafficDistributionChart providers={providers} />
          <ReliabilityMetricsCard providers={providers} />
        </div>
      </TabsContent>
      <TabsContent value="performance" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceChart 
            history={history} 
            metric="responseTime" 
            title="Response Time Over Time" 
            yAxisLabel="Response Time (ms)" 
          />
          <PerformanceChart
            history={history}
            metric="trafficPercentage"
            title="Traffic Distribution Over Time"
            yAxisLabel="Traffic (%)"
          />
        </div>
      </TabsContent>
      <TabsContent value="cost">
        <CostAnalysisChart providers={providers} />
      </TabsContent>
      <TabsContent value="reliability">
        <ReliabilityMetricsCard providers={providers} />
      </TabsContent>
      <TabsContent value="network">
        <NetworkVisualizer providers={providers} />
      </TabsContent>
      <TabsContent value="comparison">
        <CloudProviderComparisonTable providers={providers} />
      </TabsContent>
    </Tabs>
  );
};

export default AnalyticsTabs;
