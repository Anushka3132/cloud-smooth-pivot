
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsHistory, CloudProvider } from '@/services/apiSimulationService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  history: MetricsHistory;
  metric: 'responseTime' | 'trafficPercentage';
  title: string;
  yAxisLabel: string;
}

const CLOUD_COLORS: Record<CloudProvider, string> = {
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#4285F4',
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  history, 
  metric, 
  title,
  yAxisLabel 
}) => {
  // Transform history data into the format recharts expects
  const chartData = history.timestamps.map((timestamp, index) => ({
    time: formatTimestamp(timestamp),
    aws: history.aws[metric][index],
    azure: history.azure[metric][index],
    gcp: history.gcp[metric][index],
  }));
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="time" 
                tickMargin={10}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
              />
              <YAxis 
                label={{ 
                  value: yAxisLabel, 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12 }
                }} 
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="aws" 
                name="AWS" 
                stroke={CLOUD_COLORS.aws} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="azure" 
                name="Azure" 
                stroke={CLOUD_COLORS.azure} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="gcp" 
                name="Google Cloud" 
                stroke={CLOUD_COLORS.gcp} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
