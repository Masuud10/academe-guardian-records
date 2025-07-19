import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAnalyticsPermissions } from "@/hooks/useAnalyticsPermissions";
import { useTeacherAnalyticsSummary } from "@/hooks/useTeacherAnalyticsSummary";
import { useTeacherClassAnalytics } from "@/hooks/useTeacherClassAnalytics";
import PerformanceTrendsChart from "@/components/charts/PerformanceTrendsChart";
import AttendanceTrendChart from "@/components/charts/AttendanceTrendChart";
import SchoolPerformanceChart from "@/components/charts/SchoolPerformanceChart";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const TeacherClassAnalytics: React.FC = () => {
  const { analyticsScope, canViewSchoolAnalytics } = useAnalyticsPermissions();
  const { summary, loading, error } = useTeacherAnalyticsSummary();
  const {
    data: detailedAnalytics,
    isLoading: detailedLoading,
    error: detailedError,
  } = useTeacherClassAnalytics();

  // Check if teacher has permission for class analytics
  if (analyticsScope !== "class") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access Denied: You don't have permission to view class analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Class Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading analytics...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load class analytics: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasData =
    summary.avgGrade !== null ||
    summary.attendanceRate !== null ||
    summary.gradesExpected !== null;

  if (!hasData) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Class Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Your class analytics will appear here once you start entering
                grades and attendance data for your assigned classes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPerformanceTrend = (avgGrade: number | null) => {
    if (avgGrade === null) return null;
    if (avgGrade >= 80)
      return {
        icon: TrendingUp,
        color: "text-green-600",
        label: "Excellent Performance",
      };
    if (avgGrade >= 70)
      return {
        icon: TrendingUp,
        color: "text-blue-600",
        label: "Good Performance",
      };
    if (avgGrade >= 60)
      return {
        icon: TrendingUp,
        color: "text-yellow-600",
        label: "Average Performance",
      };
    return {
      icon: TrendingDown,
      color: "text-red-600",
      label: "Needs Improvement",
    };
  };

  const performanceTrend = getPerformanceTrend(summary.avgGrade);
  const completionRate =
    summary.gradesExpected && summary.gradesExpected > 0
      ? (summary.gradesSubmitted || 0) / summary.gradesExpected
      : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Analytics</h1>
          <p className="text-gray-600">
            Performance insights for your assigned classes
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Teacher Level Access
        </Badge>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Average Performance */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Class Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-900">
                {summary.avgGrade !== null
                  ? `${summary.avgGrade.toFixed(1)}%`
                  : "—"}
              </div>
              {performanceTrend && (
                <div className="flex items-center gap-1">
                  <performanceTrend.icon
                    className={`h-4 w-4 ${performanceTrend.color}`}
                  />
                  <span
                    className={`text-sm font-medium ${performanceTrend.color}`}
                  >
                    {performanceTrend.label}
                  </span>
                </div>
              )}
              <p className="text-xs text-blue-700">Overall class performance</p>
            </div>
          </CardContent>
        </Card>

        {/* Grade Completion */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Grade Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-900">
                {summary.gradesSubmitted !== null &&
                summary.gradesExpected !== null
                  ? `${summary.gradesSubmitted}/${summary.gradesExpected}`
                  : "—"}
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle
                  className={`h-4 w-4 ${
                    completionRate > 0.8
                      ? "text-green-600"
                      : completionRate > 0.5
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    completionRate > 0.8
                      ? "text-green-600"
                      : completionRate > 0.5
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.round(completionRate * 100)}% Complete
                </span>
              </div>
              <p className="text-xs text-purple-700">
                Grades submitted vs expected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rate */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-900">
                {summary.attendanceRate !== null
                  ? `${summary.attendanceRate.toFixed(1)}%`
                  : "—"}
              </div>
              <div className="flex items-center gap-1">
                <Users
                  className={`h-4 w-4 ${
                    summary.attendanceRate !== null
                      ? summary.attendanceRate > 90
                        ? "text-green-600"
                        : summary.attendanceRate > 80
                        ? "text-blue-600"
                        : "text-red-600"
                      : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    summary.attendanceRate !== null
                      ? summary.attendanceRate > 90
                        ? "text-green-600"
                        : summary.attendanceRate > 80
                        ? "text-blue-600"
                        : "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {summary.attendanceRate !== null
                    ? summary.attendanceRate > 90
                      ? "Excellent"
                      : summary.attendanceRate > 80
                      ? "Good"
                      : "Needs Attention"
                    : "No Data"}
                </span>
              </div>
              <p className="text-xs text-green-700">
                Class attendance tracking
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.avgGrade !== null && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    Performance Analysis
                  </p>
                  <p className="text-sm text-blue-700">
                    Your classes are performing{" "}
                    {summary.avgGrade >= 75
                      ? "above"
                      : summary.avgGrade >= 60
                      ? "at"
                      : "below"}{" "}
                    expected standards.
                    {summary.avgGrade < 60 &&
                      " Consider reviewing teaching strategies or providing additional support."}
                  </p>
                </div>
              </div>
            )}

            {completionRate < 0.8 &&
              summary.gradesExpected &&
              summary.gradesExpected > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">
                      Pending Grades
                    </p>
                    <p className="text-sm text-yellow-700">
                      You have{" "}
                      {summary.gradesExpected - (summary.gradesSubmitted || 0)}{" "}
                      grades still pending submission. Complete grading to get
                      better analytics insights.
                    </p>
                  </div>
                </div>
              )}

            {summary.attendanceRate !== null && summary.attendanceRate < 85 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <Users className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Attendance Concern</p>
                  <p className="text-sm text-red-700">
                    Class attendance is below optimal levels. Consider following
                    up with students or parents to improve attendance patterns.
                  </p>
                </div>
              </div>
            )}

            {summary.avgGrade !== null &&
              summary.avgGrade >= 80 &&
              completionRate >= 0.9 &&
              summary.attendanceRate !== null &&
              summary.attendanceRate >= 90 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">
                      Excellent Performance
                    </p>
                    <p className="text-sm text-green-700">
                      Your classes are performing exceptionally well across all
                      metrics. Keep up the great work!
                    </p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics Charts */}
      {detailedAnalytics && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Detailed Analytics
          </h2>

          {/* Performance Trends Chart */}
          {detailedAnalytics.termPerformance &&
            detailedAnalytics.termPerformance.length > 0 && (
              <PerformanceTrendsChart
                data={detailedAnalytics.termPerformance.map((term) => ({
                  month: term.term,
                  average_grade: term.average,
                  total_grades: term.totalGrades,
                }))}
              />
            )}

          {/* Attendance Trend Chart */}
          {detailedAnalytics.attendanceTrend &&
            detailedAnalytics.attendanceTrend.length > 0 && (
              <AttendanceTrendChart
                data={detailedAnalytics.attendanceTrend.map((day) => ({
                  week: day.date,
                  attendanceRate: day.rate,
                  presentStudents: day.presentCount,
                  absentStudents: day.totalStudents - day.presentCount,
                }))}
              />
            )}

          {/* Class Performance Chart */}
          {detailedAnalytics.classPerformance &&
            detailedAnalytics.classPerformance.length > 0 && (
              <SchoolPerformanceChart
                data={detailedAnalytics.classPerformance.map((cls) => ({
                  schoolName: cls.className,
                  averageGrade: cls.averageGrade,
                  attendanceRate: cls.attendanceRate,
                  passRate: cls.averageGrade >= 50 ? 100 : 0, // Calculate pass rate based on average grade
                }))}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default TeacherClassAnalytics;
