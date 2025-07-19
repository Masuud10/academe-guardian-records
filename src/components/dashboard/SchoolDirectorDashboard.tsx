import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import SchoolOwnerMetricsFetcher from "./school-owner/SchoolOwnerMetricsFetcher";
import SchoolDirectorExpenseApproval from "@/components/finance/SchoolDirectorExpenseApproval";
import DashboardAttendanceAnalytics from "@/components/attendance/DashboardAttendanceAnalytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar } from "lucide-react";

const SchoolDirectorDashboard = () => {
  const { user } = useAuth();
  const { schoolId, isReady, validateSchoolAccess } = useSchoolScopedData();
  const [systemStatus, setSystemStatus] = useState({
    schoolAccess: false,
  });

  console.log(
    "🏫 SchoolDirectorDashboard: Rendering with school director access and functionality"
  );

  useEffect(() => {
    // Validate system status
    if (user && schoolId) {
      setSystemStatus((prev) => ({
        ...prev,
        schoolAccess: validateSchoolAccess(schoolId),
      }));
    }
  }, [user, schoolId, validateSchoolAccess]);

  // Show loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading school director dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show error if no school assignment
  if (!schoolId) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No school assignment found. Please contact your administrator to
            assign you to a school.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show error if no access to school
  if (!systemStatus.schoolAccess) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You do not have permission to view this school's
            data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Main Content */}
        <div className="space-y-6">
          <SchoolOwnerMetricsFetcher />

          {/* Attendance Analytics Section */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <DashboardAttendanceAnalytics role="school_director" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SchoolDirectorExpenseApproval />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and management functions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors">
                  <div className="font-medium">View School Analytics</div>
                  <div className="text-sm text-muted-foreground">
                    Comprehensive school performance metrics
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Staff Management</div>
                  <div className="text-sm text-muted-foreground">
                    Manage teachers and support staff
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Financial Overview</div>
                  <div className="text-sm text-muted-foreground">
                    School financial status and reports
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Student Management</div>
                  <div className="text-sm text-muted-foreground">
                    View and manage student records
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            School Director Dashboard • Last updated:{" "}
            {new Date().toLocaleString()}
          </p>
          <p>School ID: {schoolId}</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolDirectorDashboard;
