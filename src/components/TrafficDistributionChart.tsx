
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudProviderState, CloudProvider } from '@/services/types/cloudProviderTypes';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TrafficDistributionChartProps {
  providers: CloudProviderState;
}

const CLOUD_COLORS: Record<CloudProvider, string> = {
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#4285F4',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm">{`Traffic: ${data.value}%`}</p>
        <p className="text-sm">{`Requests: ${data.requests.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const TrafficDistributionChart: React.FC<TrafficDistributionChartProps> = ({ providers }) => {
  const data = [
    { 
      name: 'AWS', 
      value: providers.aws.trafficPercentage,
      requests: providers.aws.requestCount,
      color: CLOUD_COLORS.aws,
    },
    { 
      name: 'Azure', 
      value: providers.azure.trafficPercentage,
      requests: providers.azure.requestCount,
      color: CLOUD_COLORS.azure,
    },
    { 
      name: 'Google Cloud', 
      value: providers.gcp.trafficPercentage,
      requests: providers.gcp.requestCount,
      color: CLOUD_COLORS.gcp,
    },
  ];
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Traffic Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[240px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficDistributionChart;
