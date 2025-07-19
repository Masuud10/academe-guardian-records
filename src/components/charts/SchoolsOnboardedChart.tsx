
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';

interface SchoolsOnboardedChartProps {
  data: Array<{
    month: string;
    count: number;
  }>;
}

const SchoolsOnboardedChart = ({ data }: SchoolsOnboardedChartProps) => {
  const chartConfig = {
    count: {
      label: "Schools Onboarded",
      color: "hsl(var(--chart-3))",
    },
  };

  // Process and validate data
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ SchoolsOnboardedChart: No data provided, using fallback');
      return [
        { month: 'No Data', count: 0 }
      ];
    }

    const processedData = data.map(item => ({
      ...item,
      count: Number(item.count) || 0,
    }));

    console.log('📊 SchoolsOnboardedChart: Processed data:', processedData);
    return processedData;
  }, [data]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Schools Onboarded by Month</CardTitle>
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                fill="var(--color-count)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SchoolsOnboardedChart;
