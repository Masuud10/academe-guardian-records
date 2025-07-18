import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import AttendanceAdminSummary from "./AttendanceAdminSummary";
import TeacherAttendancePanel from "../attendance/TeacherAttendancePanel";
import ParentAttendanceView from "../attendance/ParentAttendanceView";

const AttendanceModule: React.FC = () => {
  const { user } = useAuth();

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSummaryRole =
    user?.role &&
    ["edufam_admin", "principal", "school_director"].includes(user.role);

  useEffect(() => {
    if (!isSummaryRole) {
      setLoading(false);
      return;
    }

    if (user.role === "edufam_admin") {
      supabase
        .from("schools")
        .select("id, name")
        .then(({ data, error }) => {
          if (error) setError("Could not fetch schools list.");
          else setSchools(data || []);
        });
    }

    const effectiveSchoolId =
      user.role === "edufam_admin" ? schoolFilter : user.school_id;

    if (!effectiveSchoolId) {
      setAttendanceSummary(null);
      if (user.role !== "edufam_admin") {
        setError("Your account is not associated with a school.");
      }
      setLoading(false);
      return;
    }

    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: analyticsError } = await supabase
          .from("school_analytics")
          .select("attendance_rate, performance_trend")
          .eq("school_id", effectiveSchoolId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analyticsError) throw analyticsError;

        setAttendanceSummary(data);
      } catch (err: any) {
        setError(
          "Could not load attendance summary data. Please try again shortly."
        );
        setAttendanceSummary(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [isSummaryRole, user?.role, user?.school_id, schoolFilter]);

  const renderForSummaryRole = () => {
    if (loading) {
      return (
        <div className="p-6 flex items-center">
          <span className="animate-spin h-6 w-6 mr-2 rounded-full border-2 border-blue-400 border-t-transparent"></span>
          Loading summary...
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (user?.role === "edufam_admin" && !schoolFilter && schools.length > 0) {
      return (
        <AttendanceAdminSummary
          schools={schools}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          attendanceSummary={null}
          loading={false}
          error={null}
        />
      );
    }

    return (
      <AttendanceAdminSummary
        loading={loading}
        error={null}
        attendanceSummary={{
          overall_attendance_percentage:
            attendanceSummary?.attendance_rate ?? null,
          trend: attendanceSummary?.performance_trend ?? "—",
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    // Admin case removed - school directors can access attendance summaries
    case "school_director":
      return renderForSummaryRole();
    case "principal":
      return (
        <div>
          {renderForSummaryRole()}
          <TeacherAttendancePanel
            userId={user.id}
            schoolId={user.school_id}
            userRole={user.role}
          />
        </div>
      );
    case "teacher":
      return (
        <TeacherAttendancePanel
          userId={user.id}
          schoolId={user.school_id}
          userRole={user.role}
        />
      );
    case "parent":
      return <ParentAttendanceView />;
    default:
      return (
        <div className="p-8">
          <h2 className="text-xl font-bold">
            You do not have permission to view this page.
          </h2>
          <p className="text-gray-500">
            Your role ({user.role}) does not have access to the attendance
            module.
          </p>
        </div>
      );
  }
};

export default AttendanceModule;
