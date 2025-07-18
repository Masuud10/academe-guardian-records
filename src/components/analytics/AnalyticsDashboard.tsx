
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import AnalyticsFilters from "./AnalyticsFilters";
import RoleAnalyticsRenderer from "./RoleAnalyticsRenderer";

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const [filters, setFilters] = useState({
    term: "current",
    class: "all",
    subject: "all",
    dateRange: "month"
  });

  console.log("📊 AnalyticsDashboard: Rendering for user role", user?.role, {
    isSystemAdmin,
    schoolId,
    isReady
  });

  if (!isReady) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-64"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.role) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Access Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Unable to determine user permissions for analytics access.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getRoleTitle = () => {
    switch (user?.role) {
      case "school_director":
        return "School Director Analytics";
      case "principal":
        return "Principal Analytics";
      case "teacher":
        return "Teacher Analytics";
      case "parent":
        return "Parent Analytics";
      case "finance_officer":
        return "Finance Analytics";
      // Admin roles removed for school application
      default:
        return "Analytics Dashboard";
    }
  };

  const getRoleDescription = () => {
    switch (user?.role) {
      // Admin roles removed for school application
      case "school_director":
      case "principal":
        return "School performance metrics and insights";
      case "teacher":
        return "Class and student performance analytics";
      case "parent":
        return "Your children's academic progress and insights";
      case "finance_officer":
        return "Financial analytics and reporting";
      default:
        return "Comprehensive insights and performance metrics";
    }
  };

  const needsSchoolAssignment = ["school_director", "principal", "teacher", "finance_officer"].includes(user.role);

  if (needsSchoolAssignment && !schoolId) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-5 w-5" />
            School Assignment Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your account needs to be assigned to a school to view analytics.
              Please contact support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const showFilters = ["school_director", "principal", "teacher", "finance_officer"].includes(user?.role || "");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getRoleTitle()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {getRoleDescription()}
          </p>
          {schoolId && (
            <p className="text-xs text-gray-500 mt-1">
              School ID: {schoolId.slice(0, 8)}...
            </p>
          )}
        </div>

        {showFilters && (
          <AnalyticsFilters filters={filters} setFilters={setFilters} />
        )}
      </div>

      <RoleAnalyticsRenderer role={user.role} filters={filters} />
    </div>
  );
};

export default AnalyticsDashboard;
