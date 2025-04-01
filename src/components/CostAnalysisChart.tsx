
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudProviderState } from '@/services/types/cloudProviderTypes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostAnalysisChartProps {
  providers: CloudProviderState;
}

const CostAnalysisChart: React.FC<CostAnalysisChartProps> = ({ providers }) => {
  // Calculate total costs
  const costData = useMemo(() => {
    const awsCost = providers.aws.costPerRequest * providers.aws.requestCount;
    const azureCost = providers.azure.costPerRequest * providers.azure.requestCount;
    const gcpCost = providers.gcp.costPerRequest * providers.gcp.requestCount;
    
    return [
      {
        name: 'AWS',
        costPerRequest: providers.aws.costPerRequest,
        totalCost: awsCost,
        requestCount: providers.aws.requestCount,
        fill: '#FF9900'
      },
      {
        name: 'Azure',
        costPerRequest: providers.azure.costPerRequest,
        totalCost: azureCost,
        requestCount: providers.azure.requestCount,
        fill: '#0078D4'
      },
      {
        name: 'GCP',
        costPerRequest: providers.gcp.costPerRequest,
        totalCost: gcpCost,
        requestCount: providers.gcp.requestCount,
        fill: '#4285F4'
      }
    ];
  }, [providers]);
  
  // Calculate total cost
  const totalCost = costData.reduce((sum, provider) => sum + provider.totalCost, 0).toFixed(2);
  
  // Format for tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 rounded shadow-lg border border-border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Cost per request: ${data.costPerRequest.toFixed(2)}</p>
          <p className="text-sm">Total requests: {data.requestCount.toLocaleString()}</p>
          <p className="text-sm font-medium">Total cost: ${data.totalCost.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Cost Analysis</CardTitle>
          <div className="text-sm font-medium">
            Total: ${totalCost}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ 
                  value: 'Cost ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="totalCost" name="Total Cost ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostAnalysisChart;
