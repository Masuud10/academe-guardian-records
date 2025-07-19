import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  LineChart,
  PieChart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTeacherClassAnalytics } from "@/hooks/useTeacherClassAnalytics";

interface ClassAnalyticsData {
  classPerformance: Array<{
    className: string;
    averageGrade: number;
    studentCount: number;
    attendanceRate: number;
  }>;
  attendanceTrend: Array<{
    date: string;
    rate: number;
  }>;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  gradingStatus: Array<{
    exam: string;
    submitted: number;
    total: number;
    status: "complete" | "pending" | "not-started";
  }>;
  termPerformance: Array<{
    term: string;
    average: number;
    improvement: number;
  }>;
}

const ClassAnalyticsOverview: React.FC = () => {
  const { data: analyticsData, isLoading, error } = useTeacherClassAnalytics();

  const chartConfig = {
    averageGrade: { label: "Average Grade", color: "#3b82f6" },
    attendanceRate: { label: "Attendance Rate", color: "#10b981" },
    rate: { label: "Attendance Rate", color: "#8b5cf6" },
    average: { label: "Term Average", color: "#f59e0b" },
  };

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading analytics...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error("Class analytics error:", error);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-red-600">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load analytics data</p>
              {process.env.NODE_ENV === "development" && (
                <p className="text-xs mt-1 text-gray-500">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData || analyticsData.classPerformance.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Analytics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <BarChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No analytics data available</p>
              <p className="text-xs mt-1">
                You may not have any classes assigned yet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Class Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.classPerformance.map((classData, index) => (
              <div
                key={classData.className}
                className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50"
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {classData.className}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Average Grade:
                    </span>
                    <Badge variant="secondary">{classData.averageGrade}%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Students:</span>
                    <span className="text-sm font-medium">
                      {classData.studentCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attendance:</span>
                    <Badge
                      variant={
                        classData.attendanceRate >= 90
                          ? "default"
                          : classData.attendanceRate >= 75
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {classData.attendanceRate}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Trend */}
      {analyticsData.attendanceTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Attendance Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analyticsData.attendanceTrend}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke={chartConfig.rate.color}
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade Distribution */}
      {analyticsData.gradeDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analyticsData.gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, percentage }) =>
                      `${grade}: ${percentage}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData.gradeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grading Status */}
      {analyticsData.gradingStatus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grading Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.gradingStatus.map((status) => (
                <div
                  key={status.exam}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{status.exam}</h4>
                    <p className="text-sm text-gray-600">
                      {status.submitted} of {status.total} grades submitted
                    </p>
                  </div>
                  <Badge
                    variant={
                      status.status === "complete"
                        ? "default"
                        : status.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {status.status === "complete"
                      ? "Complete"
                      : status.status === "pending"
                      ? "Pending"
                      : "Not Started"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Term Performance */}
      {analyticsData.termPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Term Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.termPerformance.map((term) => (
                <div
                  key={term.term}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">{term.term}</h4>
                    <p className="text-sm text-gray-600">
                      Average: {term.average}%
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={term.improvement > 0 ? "default" : "secondary"}
                    >
                      {term.improvement > 0 ? "+" : ""}
                      {term.improvement}% improvement
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassAnalyticsOverview;
