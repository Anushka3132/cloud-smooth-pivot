import { create } from 'zustand';
import { log } from './loggingService';
import { CloudProvider, CloudProviderState, MetricsHistory } from './types/cloudProviderTypes';
import { determineStatus, calculateTrafficDistribution } from './utils/cloudProviderUtils';
import { checkErrorRateAlerts } from './utils/alertUtils';
import { initialProviders, initializeHistory } from './state/initialCloudState';
import { 
  simulateMetricsChanges, 
  updateTrafficAndRequests, 
  logProviderChanges 
} from './simulation/simulationEngine';
import { updateHistory } from './state/historyTracker';

// Re-export types for external use
export type { CloudProvider, HealthStatus, ProviderMetrics, CloudProviderState, MetricsHistory } from './types/cloudProviderTypes';

interface ApiSimulationState {
  providers: CloudProviderState;
  history: MetricsHistory;
  isSimulationRunning: boolean;
  selectedProvider: CloudProvider | null;
  degradeProvider: (provider: CloudProvider) => void;
  improveProvider: (provider: CloudProvider) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  setSelectedProvider: (provider: CloudProvider | null) => void;
}

export const useApiSimulation = create<ApiSimulationState>((set, get) => {
  let simulationInterval: number | null = null;

  const simulationTick = () => {
    const { providers, history } = get();
    
    // Apply random changes to metrics
    const providersWithChanges = simulateMetricsChanges(providers);
    
    // Update traffic distribution and requests
    const updatedProviders = updateTrafficAndRequests(providersWithChanges);
    
    // Log important changes
    logProviderChanges(providers, updatedProviders);
    
    // Update state with new metrics and history
    set({
      providers: updatedProviders,
      history: updateHistory(updatedProviders, history),
    });
  };

  return {
    providers: initialProviders,
    history: initializeHistory(),
    isSimulationRunning: false,
    selectedProvider: null,
    
    degradeProvider: (provider) => {
      const { providers } = get();
      const updatedProviders = { ...providers };
      
      // Significantly degrade the selected provider
      updatedProviders[provider] = {
        ...updatedProviders[provider],
        responseTime: updatedProviders[provider].responseTime + 200,
        errorRate: Math.min(0.3, updatedProviders[provider].errorRate + 0.15),
        status: 'critical',
      };
      
      // Recalculate traffic distribution
      const trafficDistribution = calculateTrafficDistribution(updatedProviders);
      
      // Apply new traffic distribution
      updatedProviders.aws.trafficPercentage = trafficDistribution.aws;
      updatedProviders.azure.trafficPercentage = trafficDistribution.azure;
      updatedProviders.gcp.trafficPercentage = trafficDistribution.gcp;
      
      // Check for error rate alerts after degradation
      checkErrorRateAlerts(updatedProviders);
      
      // Log degradation event
      log.warning(
        `${provider.toUpperCase()} provider manually degraded by user`, 
        'api', 
        {
          responseTime: updatedProviders[provider].responseTime,
          errorRate: updatedProviders[provider].errorRate,
          status: 'critical'
        },
        provider
      );
      
      set({
        providers: updatedProviders,
        history: updateHistory(updatedProviders, get().history),
      });
    },
    
    improveProvider: (provider) => {
      const { providers } = get();
      const updatedProviders = { ...providers };
      
      // Improve the selected provider back to good metrics
      // For GCP, we'll give even better error rates
      const errorRateImprovement = provider === 'gcp' ? 0.2 : 0.15;
      const minErrorRate = provider === 'gcp' ? 0.005 : 0.01;
      
      updatedProviders[provider] = {
        ...updatedProviders[provider],
        responseTime: Math.max(70, updatedProviders[provider].responseTime - 200),
        errorRate: Math.max(minErrorRate, updatedProviders[provider].errorRate - errorRateImprovement),
        status: 'healthy',
      };
      
      // Recalculate traffic distribution
      const trafficDistribution = calculateTrafficDistribution(updatedProviders);
      
      // Apply new traffic distribution
      updatedProviders.aws.trafficPercentage = trafficDistribution.aws;
      updatedProviders.azure.trafficPercentage = trafficDistribution.azure;
      updatedProviders.gcp.trafficPercentage = trafficDistribution.gcp;
      
      // Log improvement event
      log.info(
        `${provider.toUpperCase()} provider manually improved by user`, 
        'api', 
        {
          responseTime: updatedProviders[provider].responseTime,
          errorRate: updatedProviders[provider].errorRate,
          status: 'healthy'
        },
        provider
      );
      
      set({
        providers: updatedProviders,
        history: updateHistory(updatedProviders, get().history),
      });
    },
    
    startSimulation: () => {
      if (simulationInterval) {
        window.clearInterval(simulationInterval);
      }
      
      log.info('Simulation started', 'api');
      simulationInterval = window.setInterval(simulationTick, 1500);
      
      set({ isSimulationRunning: true });
    },
    
    stopSimulation: () => {
      if (simulationInterval) {
        window.clearInterval(simulationInterval);
        simulationInterval = null;
      }
      
      log.info('Simulation stopped', 'api');
      set({ isSimulationRunning: false });
    },
    
    setSelectedProvider: (provider) => {
      if (provider) {
        log.debug(`Provider ${provider} selected by user`, 'frontend');
      }
      set({ selectedProvider: provider });
    },
  };
});
