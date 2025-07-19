
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface AttendanceTrendData {
  week: string;
  attendanceRate: number;
  presentStudents: number;
  absentStudents: number;
}

interface AttendanceTrendChartProps {
  data: AttendanceTrendData[];
}

const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Network-Wide Attendance Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Weekly attendance patterns across all schools
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis yAxisId="rate" orientation="left" domain={[70, 100]} />
            <YAxis yAxisId="count" orientation="right" />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'attendanceRate') return [`${value}%`, 'Attendance Rate'];
                return [value, name === 'presentStudents' ? 'Present Students' : 'Absent Students'];
              }}
            />
            <Legend />
            <Line 
              yAxisId="rate"
              type="monotone" 
              dataKey="attendanceRate" 
              stroke="#22c55e" 
              strokeWidth={3}
              name="Attendance Rate (%)"
            />
            <Line 
              yAxisId="count"
              type="monotone" 
              dataKey="presentStudents" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Present Students"
            />
            <Line 
              yAxisId="count"
              type="monotone" 
              dataKey="absentStudents" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Absent Students"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AttendanceTrendChart;
