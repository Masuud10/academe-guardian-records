import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useCurrentAcademicInfo } from "@/hooks/useCurrentAcademicInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  TrendingUp,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { academicInfo } = useCurrentAcademicInfo(schoolId);

  const {
    data: teacherStats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacher-stats", user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return null;

      try {
        console.log("Fetching teacher stats for:", user.id, schoolId);

        // CRITICAL: Validate user authorization first
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("role, school_id")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error validating user profile:", profileError);
          throw new Error("Failed to validate user permissions");
        }

        // CRITICAL: Role and school validation
        if (
          userProfile.role !== "teacher" &&
          ![
            "principal",
            "school_director",
            "edufam_admin",
            "school_director",
          ].includes(userProfile.role)
        ) {
          throw new Error(
            "Access denied: Insufficient permissions for teacher dashboard"
          );
        }

        if (
          userProfile.school_id !== schoolId &&
          !["edufam_admin"].includes(userProfile.role)
        ) {
          throw new Error("Access denied: School assignment mismatch");
        }

        // Get teacher's assigned classes with enhanced validation
        const { data: teacherAssignments, error: assignmentsError } =
          await supabase
            .from("subject_teacher_assignments")
            .select(
              `
            class_id,
            subject_id,
            teacher_id,
            school_id,
            classes!inner(id, name, level, stream),
            subjects!inner(id, name, code)
          `
            )
            .eq("teacher_id", user.id)
            .eq("school_id", schoolId)
            .eq("is_active", true);

        if (assignmentsError) {
          console.error(
            "Error fetching teacher assignments:",
            assignmentsError
          );
          throw assignmentsError;
        }

        // CRITICAL: Validate all assignments belong to current teacher and school
        const invalidAssignments = teacherAssignments?.filter(
          (ta) => ta.teacher_id !== user.id || ta.school_id !== schoolId
        );

        if (invalidAssignments && invalidAssignments.length > 0) {
          console.error(
            "Invalid teacher assignments detected:",
            invalidAssignments
          );
          throw new Error(
            "Access denied: Invalid teacher assignments detected"
          );
        }

        const uniqueClasses =
          teacherAssignments
            ?.filter((ta) => ta.classes)
            .map((ta) => ta.classes)
            .filter(
              (cls, index, self) =>
                index === self.findIndex((c) => c.id === cls.id)
            ) || [];

        const uniqueSubjects =
          teacherAssignments
            ?.filter((ta) => ta.subjects)
            .map((ta) => ta.subjects)
            .filter(
              (sub, index, self) =>
                index === self.findIndex((s) => s.id === sub.id)
            ) || [];

        const classIds = uniqueClasses.map((c) => c.id);

        // Get total students in teacher's classes with validation
        let studentCount = 0;
        if (classIds.length > 0) {
          const { count, error: studentError } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .in("class_id", classIds)
            .eq("school_id", schoolId)
            .eq("is_active", true);

          if (studentError) {
            console.error("Error fetching student count:", studentError);
          } else {
            studentCount = count || 0;
          }
        }

        // Get today's attendance submissions
        const today = new Date().toISOString().split("T")[0];
        const { count: todayAttendance } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("submitted_by", user.id)
          .eq("school_id", schoolId)
          .eq("date", today);

        // Get pending grade submissions
        const { count: pendingGrades } = await supabase
          .from("grades")
          .select("*", { count: "exact", head: true })
          .eq("submitted_by", user.id)
          .eq("school_id", schoolId)
          .eq("status", "draft");

        // Get recent announcements for the teacher
        const { data: announcements } = await supabase
          .from("announcements")
          .select("*")
          .eq("school_id", schoolId)
          .contains("target_audience", ["teacher"])
          .eq("is_archived", false)
          .order("created_at", { ascending: false })
          .limit(5);

        return {
          classCount: uniqueClasses.length,
          studentCount: studentCount,
          subjectCount: uniqueSubjects.length,
          todayAttendance: todayAttendance || 0,
          pendingGrades: pendingGrades || 0,
          classes: uniqueClasses,
          subjects: uniqueSubjects,
          announcements: announcements || [],
        };
      } catch (error) {
        console.error("Error fetching teacher stats:", error);
        throw error;
      }
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Teacher dashboard error:", error);
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load teacher dashboard data. Please try refreshing the
            page.
            {process.env.NODE_ENV === "development" && (
              <details className="mt-2">
                <summary>Debug Info</summary>
                <pre className="text-xs mt-1 whitespace-pre-wrap">
                  {error instanceof Error ? error.message : "Unknown error"}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!teacherStats) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No teaching assignments found. Please contact your administrator to
            assign classes and subjects.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name} | {academicInfo.term} -{" "}
            {academicInfo.year}
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 w-fit">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">My Classes</p>
                <p className="text-2xl font-bold text-blue-900">
                  {teacherStats.classCount}
                </p>
                <p className="text-xs text-blue-600">Active assignments</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">
                  My Students
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {teacherStats.studentCount}
                </p>
                <p className="text-xs text-green-600">Total learners</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Subjects</p>
                <p className="text-2xl font-bold text-purple-900">
                  {teacherStats.subjectCount}
                </p>
                <p className="text-xs text-purple-600">Teaching areas</p>
              </div>
              <ClipboardList className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">
                  Today's Attendance
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {teacherStats.todayAttendance}
                </p>
                <p className="text-xs text-orange-600">Classes recorded</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats.classes.length > 0 ? (
                teacherStats.classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {cls.name}
                      </span>
                      {(cls.level || cls.stream) && (
                        <p className="text-sm text-gray-600">
                          {cls.level} {cls.stream && `- ${cls.stream}`}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No classes assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              My Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teacherStats.subjects.length > 0 ? (
                teacherStats.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {subject.name}
                      </span>
                      {subject.code && (
                        <p className="text-sm text-gray-600">
                          Code: {subject.code}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Teaching</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No subjects assigned yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks and Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Tasks & Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teacherStats.pendingGrades > 0 && (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-900">
                    You have {teacherStats.pendingGrades} pending grade
                    submissions
                  </span>
                  <p className="text-sm text-yellow-700 mt-1">
                    Submit grades for principal approval
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-yellow-700 border-yellow-300"
                >
                  Action Required
                </Badge>
              </div>
            )}

            {teacherStats.todayAttendance === 0 && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-gray-900">
                    Today's attendance not yet recorded
                  </span>
                  <p className="text-sm text-blue-700 mt-1">
                    Record attendance for your classes
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                >
                  Pending
                </Badge>
              </div>
            )}

            {/* Show recent announcements */}
            {teacherStats.announcements.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">
                  Recent Announcements
                </h4>
                {teacherStats.announcements.slice(0, 3).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-indigo-900 truncate">
                        {announcement.title}
                      </p>
                      <p className="text-sm text-indigo-700 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-indigo-700 border-indigo-300 text-xs"
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {teacherStats.pendingGrades === 0 &&
              teacherStats.todayAttendance > 0 &&
              teacherStats.announcements.length === 0 && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-gray-900">
                      All tasks completed for today!
                    </span>
                    <p className="text-sm text-green-700 mt-1">
                      Great work staying on top of your responsibilities
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300"
                  >
                    Up to date
                  </Badge>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
