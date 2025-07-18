import React, { useState } from "react";
import { AuthUser } from "@/types/auth";
import RoleGuard from "@/components/common/RoleGuard";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useTeacherStats } from "@/hooks/useTeacherStats";
import TeacherStatsCards from "./teacher/TeacherStatsCards";
import ClassAnalyticsOverview from "./teacher/ClassAnalyticsOverview";
import MyClasses from "./teacher/MyClasses";
import CompactTeacherTimetable from "./teacher/CompactTeacherTimetable";

import BulkGradingModal from "@/components/grading/BulkGradingModal";
import AttendanceModal from "@/components/modals/AttendanceModal";
import GradesModal from "@/components/modals/GradesModal";
import { useToast } from "@/hooks/use-toast";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";

interface TeacherDashboardProps {
  user: AuthUser;
  onModalOpen?: (modalType: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  user,
  onModalOpen,
}) => {
  const { isReady } = useSchoolScopedData();
  const { data: stats, isLoading } = useTeacherStats();
  const { toast } = useToast();

  // Modal states
  const [bulkGradingOpen, setBulkGradingOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);

  const handleModalClose = (modalType: string) => {
    console.log("TeacherDashboard: Closing modal:", modalType);

    try {
      switch (modalType) {
        case "bulkGrading":
          setBulkGradingOpen(false);
          break;
        case "attendance":
          setAttendanceModalOpen(false);
          break;
        case "grades":
          setGradesModalOpen(false);
          break;
        default:
          console.warn("Unknown modal type:", modalType);
      }
    } catch (error) {
      console.error("Error closing modal:", modalType, error);
      toast({
        title: "Error",
        description: "Failed to close modal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModalSuccess = (modalType: string, message?: string) => {
    try {
      handleModalClose(modalType);
      if (message) {
        toast({
          title: "Success",
          description: message,
        });
      }
    } catch (error) {
      console.error("Error handling modal success:", modalType, error);
      toast({
        title: "Error",
        description: "Failed to process modal success. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Validate user role and school assignment
  if (!user || user.role !== "teacher") {
    console.error("TeacherDashboard: Invalid user role", user?.role);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg border shadow-sm max-w-md w-full">
          <div className="text-center text-red-600">
            <p>Access Denied</p>
            <p className="text-sm mt-1">
              This dashboard is only available for teachers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prevent render before role/school_id are ready
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg border shadow-sm max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["teacher"]} requireSchoolAssignment={true}>
      <div className="min-h-screen bg-background">
        <MaintenanceNotification />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Stats Overview */}
          <div className="w-full">
            <TeacherStatsCards stats={stats} loading={isLoading} />
          </div>

          {/* Class Analytics Overview Section */}
          <div id="class-analytics-section">
            <ClassAnalyticsOverview />
          </div>

          {/* My Assignments Section */}
          <div className="bg-card rounded-lg border shadow-sm">
            <MyClasses />
          </div>

          {/* My Timetable Section */}
          <div className="bg-card rounded-lg border shadow-sm">
            <CompactTeacherTimetable />
          </div>
        </div>

        {/* Local Modals */}
        {bulkGradingOpen && (
          <BulkGradingModal
            open={bulkGradingOpen}
            onClose={() => handleModalClose("bulkGrading")}
            classList={stats?.classes || []}
            subjectList={stats?.subjects || []}
          />
        )}

        {attendanceModalOpen && (
          <AttendanceModal
            onClose={() => handleModalClose("attendance")}
            userRole={user.role}
          />
        )}

        {gradesModalOpen && (
          <GradesModal
            onClose={() => handleModalClose("grades")}
            userRole={user.role}
          />
        )}
      </div>
    </RoleGuard>
  );
};

export default TeacherDashboard;
