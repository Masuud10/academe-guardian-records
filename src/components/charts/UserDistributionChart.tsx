
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Users } from 'lucide-react';

interface UserDistributionChartProps {
  data: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
}

const UserDistributionChart = ({ data }: UserDistributionChartProps) => {
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  // Process and validate data
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ UserDistributionChart: No data provided, using fallback');
      return [
        { role: 'No Data', count: 1, percentage: 100 }
      ];
    }

    const processedData = data.map(item => ({
      ...item,
      count: Number(item.count) || 0,
      percentage: Number(item.percentage) || 0,
    }));

    console.log('📊 UserDistributionChart: Processed data:', processedData);
    return processedData;
  }, [data]);

  const chartConfig = React.useMemo(() => {
    return chartData.reduce((config, item, index) => {
      config[item.role.toLowerCase().replace(' ', '_')] = {
        label: item.role,
        color: COLORS[index % COLORS.length],
      };
      return config;
    }, {} as any);
  }, [chartData]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">User Distribution by Role</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, percentage }) => `${role}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default UserDistributionChart;
