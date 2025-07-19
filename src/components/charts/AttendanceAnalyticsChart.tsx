import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users } from "lucide-react";

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface AttendanceAnalyticsChartProps {
  data: AttendanceData[];
}

const AttendanceAnalyticsChart: React.FC<AttendanceAnalyticsChartProps> = ({
  data,
}) => {
  const mockData =
    data.length > 0
      ? data
      : [
          { day: "Mon", attendance: 85 },
          { day: "Tue", attendance: 88 },
          { day: "Wed", attendance: 82 },
          { day: "Thu", attendance: 90 },
          { day: "Fri", attendance: 78 },
        ];

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Weekly Attendance</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceAnalyticsChart;
