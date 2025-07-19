import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import AttendanceTrendChart from "@/components/charts/AttendanceTrendChart";
import PerformanceTrendsChart from "@/components/charts/PerformanceTrendsChart";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Download,
  Printer,
} from "lucide-react";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";

interface AttendanceAnalyticsData {
  overallStats: {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendanceRate: number;
  };
  classStats: Array<{
    className: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
  }>;
  dailyTrends: Array<{
    date: string;
    attendanceRate: number;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
  }>;
  studentStats: Array<{
    studentId: string;
    studentName: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    attendanceRate: number;
  }>;
}

interface DashboardAttendanceAnalyticsProps {
  role: "principal" | "teacher" | "school_director";
  classId?: string; // For teacher-specific analytics
}

const fetchAttendanceAnalytics = async (
  userId: string,
  schoolId: string,
  role: string,
  classId?: string
): Promise<AttendanceAnalyticsData> => {
  console.log("📊 Fetching attendance analytics:", {
    userId,
    schoolId,
    role,
    classId,
  });

  try {
    // First, get attendance records
    let attendanceQuery = supabase
      .from("attendance")
      .select("id, student_id, status, date, class_id")
      .eq("school_id", schoolId)
      .gte(
        "date",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      ); // Last 30 days

    // Role-based filtering
    if (role === "teacher" && classId) {
      attendanceQuery = attendanceQuery.eq("class_id", classId);
    }

    const { data: attendanceRecords, error: attendanceError } =
      await attendanceQuery;

    if (attendanceError) {
      console.error("Error fetching attendance records:", attendanceError);
      throw new Error("Failed to fetch attendance data");
    }

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        overallStats: {
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          attendanceRate: 0,
        },
        classStats: [],
        dailyTrends: [],
        studentStats: [],
      };
    }

    // Get unique student IDs
    const studentIds = [...new Set(attendanceRecords.map((r) => r.student_id))];

    // Get student details
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select(
        "id, first_name, last_name, admission_number, roll_number, class_id"
      )
      .in("id", studentIds);

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      throw new Error("Failed to fetch student data");
    }

    // Get class details
    const classIds = [
      ...new Set(students?.map((s) => s.class_id).filter(Boolean) || []),
    ];
    const { data: classes, error: classesError } = await supabase
      .from("classes")
      .select("id, name")
      .in("id", classIds);

    if (classesError) {
      console.error("Error fetching classes:", classesError);
      throw new Error("Failed to fetch class data");
    }

    // Create lookup maps
    const studentsMap = new Map(students?.map((s) => [s.id, s]) || []);
    const classesMap = new Map(classes?.map((c) => [c.id, c]) || []);

    // Combine data
    const enrichedRecords = attendanceRecords.map((record) => ({
      ...record,
      student: studentsMap.get(record.student_id),
      class: classesMap.get(record.student?.class_id || ""),
    }));

    // Calculate overall statistics
    const presentCount = enrichedRecords.filter(
      (r) => r.status === "present"
    ).length;
    const absentCount = enrichedRecords.filter(
      (r) => r.status === "absent"
    ).length;
    const lateCount = enrichedRecords.filter((r) => r.status === "late").length;
    const excusedCount = enrichedRecords.filter(
      (r) => r.status === "excused"
    ).length;
    const totalRecords = enrichedRecords.length;

    // Get unique students
    const uniqueStudents = [
      ...new Set(enrichedRecords.map((r) => r.student_id)),
    ];
    const totalStudents = uniqueStudents.length;

    // Calculate class-wise statistics
    const classStatsMap = new Map();
    enrichedRecords.forEach((record) => {
      const className = record.class?.name || "Unknown Class";
      if (!classStatsMap.has(className)) {
        classStatsMap.set(className, {
          className,
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          attendanceRate: 0,
        });
      }
      const stats = classStatsMap.get(className);
      stats.totalStudents = new Set(
        enrichedRecords
          .filter((r) => r.class?.name === className)
          .map((r) => r.student_id)
      ).size;

      if (record.status === "present") stats.presentCount++;
      else if (record.status === "absent") stats.absentCount++;
      else if (record.status === "late") stats.lateCount++;

      stats.attendanceRate =
        stats.totalStudents > 0
          ? Math.round(
              (stats.presentCount /
                (stats.presentCount + stats.absentCount + stats.lateCount)) *
                100
            )
          : 0;
    });

    // Calculate daily trends (last 7 days)
    const dailyTrendsMap = new Map();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    last7Days.forEach((date) => {
      const dayRecords = enrichedRecords.filter((r) => r.date === date);
      const dayPresent = dayRecords.filter(
        (r) => r.status === "present"
      ).length;
      const dayAbsent = dayRecords.filter((r) => r.status === "absent").length;
      const dayTotal = dayRecords.length;

      dailyTrendsMap.set(date, {
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        attendanceRate:
          dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0,
        presentCount: dayPresent,
        absentCount: dayAbsent,
        totalStudents: dayTotal,
      });
    });

    // Calculate student-wise statistics
    const studentStatsMap = new Map();
    enrichedRecords.forEach((record) => {
      const studentId = record.student_id;
      const studentName = `${record.student?.first_name || ""} ${
        record.student?.last_name || ""
      }`.trim();

      if (!studentStatsMap.has(studentId)) {
        studentStatsMap.set(studentId, {
          studentId,
          studentName,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          attendanceRate: 0,
        });
      }

      const stats = studentStatsMap.get(studentId);
      stats.totalDays++;

      if (record.status === "present") stats.presentDays++;
      else if (record.status === "absent") stats.absentDays++;
      else if (record.status === "late") stats.lateDays++;

      stats.attendanceRate = Math.round(
        (stats.presentDays / stats.totalDays) * 100
      );
    });

    return {
      overallStats: {
        totalStudents,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate:
          totalRecords > 0
            ? Math.round((presentCount / totalRecords) * 100)
            : 0,
      },
      classStats: Array.from(classStatsMap.values()),
      dailyTrends: Array.from(dailyTrendsMap.values()),
      studentStats: Array.from(studentStatsMap.values()).slice(0, 10), // Top 10 students
    };
  } catch (error) {
    console.error("Error in fetchAttendanceAnalytics:", error);
    throw error;
  }
};

const DashboardAttendanceAnalytics: React.FC<
  DashboardAttendanceAnalyticsProps
> = ({ role, classId }) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { generateAttendancePDF, printAttendanceReport, isGenerating } =
    useAttendanceReports();

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendanceAnalytics", user?.id, schoolId, role, classId],
    queryFn: () =>
      fetchAttendanceAnalytics(user?.id || "", schoolId || "", role, classId),
    enabled: !!user?.id && !!schoolId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">
                Loading attendance analytics...
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load attendance analytics: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.overallStats.totalStudents === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No attendance data available</p>
            <p className="text-sm">
              Attendance analytics will appear once data is recorded
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overallStats, classStats, dailyTrends, studentStats } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Attendance Analytics
          </h2>
          <p className="text-sm text-gray-600">
            {role === "teacher" ? "Class" : "School"} attendance overview and
            trends
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              printAttendanceReport(
                "All Classes",
                new Date().toISOString().split("T")[0],
                []
              )
            }
            disabled={isGenerating}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          <Button
            size="sm"
            onClick={() =>
              generateAttendancePDF(
                "All Classes",
                new Date().toISOString().split("T")[0],
                [],
                {}
              )
            }
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overall Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Present</p>
                <p className="text-2xl font-bold text-green-800">
                  {overallStats.presentCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-800">
                  {overallStats.absentCount}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Late</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {overallStats.lateCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Attendance Rate
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {overallStats.attendanceRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends Chart */}
        {dailyTrends.length > 0 && (
          <AttendanceTrendChart
            data={dailyTrends.map((day) => ({
              week: day.date,
              attendanceRate: day.attendanceRate,
              presentStudents: day.presentCount,
              absentStudents: day.absentCount,
            }))}
          />
        )}

        {/* Performance Trends Chart (using attendance as performance metric) */}
        {dailyTrends.length > 0 && (
          <PerformanceTrendsChart
            data={dailyTrends.map((day) => ({
              month: day.date,
              average_grade: day.attendanceRate,
              total_grades: day.totalStudents,
            }))}
          />
        )}
      </div>

      {/* Class Performance (for principals and school directors) */}
      {role !== "teacher" && classStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classStats.map((classStat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{classStat.className}</div>
                    <div className="text-sm text-muted-foreground">
                      {classStat.presentCount}/{classStat.totalStudents}{" "}
                      students present
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress
                        value={classStat.attendanceRate}
                        className="h-2"
                      />
                    </div>
                    <Badge
                      variant={
                        classStat.attendanceRate >= 90
                          ? "default"
                          : classStat.attendanceRate >= 75
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {classStat.attendanceRate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Performance (for teachers) */}
      {role === "teacher" && studentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentStats.map((student, index) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{student.studentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {student.presentDays}/{student.totalDays} days present
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress
                        value={student.attendanceRate}
                        className="h-2"
                      />
                    </div>
                    <Badge
                      variant={
                        student.attendanceRate >= 90
                          ? "default"
                          : student.attendanceRate >= 75
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {student.attendanceRate}%
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

export default DashboardAttendanceAnalytics;
