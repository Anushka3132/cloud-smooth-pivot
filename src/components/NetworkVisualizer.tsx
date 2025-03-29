
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudProviderState, CloudProvider } from '@/services/apiSimulationService';
import { cn } from '@/lib/utils';

interface NetworkVisualizerProps {
  providers: CloudProviderState;
}

interface DataPacket {
  id: number;
  provider: CloudProvider;
  progress: number;
  lane: number;
}

const getCloudColor = (provider: CloudProvider): string => {
  const colors: Record<CloudProvider, string> = {
    aws: 'text-aws',
    azure: 'text-azure',
    gcp: 'text-gcp',
  };
  return colors[provider];
};

const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ providers }) => {
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const packetIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Add new packets based on traffic percentages
      const newPackets: DataPacket[] = [];
      
      // For each provider, maybe add a packet based on their traffic percentage
      const addPacketForProvider = (provider: CloudProvider, percentage: number) => {
        if (Math.random() * 100 < percentage) {
          newPackets.push({
            id: packetIdRef.current++,
            provider,
            progress: 0,
            lane: Math.floor(Math.random() * 3), // 3 lanes per provider
          });
        }
      };
      
      addPacketForProvider('aws', providers.aws.trafficPercentage);
      addPacketForProvider('azure', providers.azure.trafficPercentage);
      addPacketForProvider('gcp', providers.gcp.trafficPercentage);
      
      // Update existing packets' progress
      setPackets(prevPackets => {
        const updatedPackets = prevPackets
          .map(packet => ({
            ...packet,
            progress: packet.progress + (Math.random() * 2 + 1) // Random speed
          }))
          .filter(packet => packet.progress < 100); // Remove completed packets
        
        return [...updatedPackets, ...newPackets];
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [providers]);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Network Traffic Visualization</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div 
          ref={containerRef}
          className="grid-animation h-[240px] w-full rounded-md relative overflow-hidden border"
        >
          {/* Cloud Provider Icons at the left */}
          <div className="absolute left-4 inset-y-0 flex flex-col justify-around">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-aws/10 text-aws font-bold">
                AWS
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-azure/10 text-azure font-bold">
                AZ
              </div>
            </div>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gcp/10 text-gcp font-bold">
                GCP
              </div>
            </div>
          </div>
          
          {/* API Icon at the right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold">
              API
            </div>
          </div>
          
          {/* Data packets */}
          {packets.map((packet) => {
            const providerIndex = packet.provider === 'aws' ? 0 : packet.provider === 'azure' ? 1 : 2;
            const yPosition = (providerIndex * 80) + (packet.lane * 16) + 40; // Distribute across lanes
            
            return (
              <div
                key={packet.id}
                className={cn(
                  "absolute h-2 w-8 rounded-full animate-pulse", 
                  getCloudColor(packet.provider)
                )}
                style={{
                  left: `${16 + packet.progress * 0.7}%`,
                  top: `${yPosition}px`,
                  backgroundColor: 'currentColor'
                }}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkVisualizer;
