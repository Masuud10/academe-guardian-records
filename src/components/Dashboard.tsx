import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

import PrincipalDashboard from "./dashboard/PrincipalDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import ParentDashboard from "./dashboard/ParentDashboard";
import FinanceOfficerDashboard from "./dashboard/FinanceOfficerDashboard";
import HRDashboard from "./dashboard/HRDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { checkDatabaseConnection } from "@/integrations/supabase/client";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import SchoolDirectorDashboard from "./dashboard/SchoolDirectorDashboard";

const Dashboard: React.FC = () => {
  const { user, isLoading, error: authError } = useAuth();
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [isCheckingDb, setIsCheckingDb] = useState(true);

  // Check database connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkDatabaseConnection();
        setDbStatus(status);
      } catch (err) {
        console.error("Failed to check database connection:", err);
        setDbStatus({ connected: false, error: "Connection check failed" });
      } finally {
        setIsCheckingDb(false);
      }
    };

    checkConnection();
  }, []);

  console.log(
    "🎯 Dashboard: Rendering for user:",
    user?.email,
    "role:",
    user?.role,
    "dbStatus:",
    dbStatus
  );

  // Show loading while checking database or auth
  if (isLoading || isCheckingDb) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Authentication error: {authError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle database connection errors
  if (dbStatus && !dbStatus.connected) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Database connection error:{" "}
            {dbStatus.error || "Unable to connect to database"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle missing user
  if (!user || !user.role) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
      </div>
    );
  }

  // Validate user role (removed admin roles for school app)
  const validRoles = [
    "principal",
    "teacher",
    "parent",
    "school_director",
    "finance_officer",
    "hr",
  ];
  const normalizedRole = user.role.toLowerCase();
  if (!validRoles.includes(normalizedRole)) {
    console.warn("🎯 Dashboard: Unknown user role:", user.role);
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unknown user role: {user.role}. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role with proper logging
  console.log("🎯 Dashboard: Routing based on role:", user.role);
  console.log("🎯 Dashboard: Normalized role:", normalizedRole);
  console.log("🎯 Dashboard: User object:", user);

  try {
    switch (normalizedRole) {
      case "school_director":
        console.log("🎯 Dashboard: Routing to School Director Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <SchoolDirectorDashboard />
          </div>
        );

      case "principal":
        console.log("🎯 Dashboard: Routing to Principal Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <PrincipalDashboard user={user} />
          </div>
        );

      case "teacher":
        console.log("🎯 Dashboard: Routing to Teacher Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <TeacherDashboard user={user} />
          </div>
        );

      case "finance_officer":
        console.log("🎯 Dashboard: Routing to Finance Officer Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <FinanceOfficerDashboard user={user} />
          </div>
        );

      case "hr":
        console.log("🎯 Dashboard: Routing to HR Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <HRDashboard user={user} />
          </div>
        );

      case "parent":
        console.log("🎯 Dashboard: Routing to Parent Dashboard");
        return (
          <div>
            <MaintenanceNotification />
            <ParentDashboard user={user} />
          </div>
        );

      default:
        console.warn("🎯 Dashboard: Unknown user role:", user.role);
        return (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unknown user role: {user.role}. Please contact your administrator.
            </AlertDescription>
          </Alert>
        );
    }
  } catch (error) {
    console.error("🎯 Dashboard: Error rendering dashboard:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading dashboard. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};

export default Dashboard;
