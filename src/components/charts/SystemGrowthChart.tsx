
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface SystemGrowthChartProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemGrowthChart: React.FC<SystemGrowthChartProps> = ({ schoolsCount, usersCount }) => {
  const data = [
    {
      name: 'Schools',
      count: schoolsCount,
      growth: '+12%'
    },
    {
      name: 'Users',
      count: usersCount,
      growth: '+8%'
    },
    {
      name: 'Active',
      count: Math.floor(usersCount * 0.85),
      growth: '+15%'
    }
  ];

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">System Growth</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemGrowthChart;
