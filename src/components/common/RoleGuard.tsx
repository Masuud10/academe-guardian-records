import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingScreen from "./LoadingScreen";
import DeactivatedAccountMessage from "@/components/auth/DeactivatedAccountMessage";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireSchoolAssignment?: boolean;
  fallback?: React.ReactNode;
  redirectOnFail?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requireSchoolAssignment = false,
  fallback,
  redirectOnFail = false,
}) => {
  const { user, isLoading, error } = useAuth();

  console.log("🛡️ RoleGuard: Checking access with roles:", allowedRoles, {
    userRole: user?.role,
    userSchoolId: user?.school_id,
    requireSchoolAssignment,
    error,
  });

  // Show loading while validating
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Handle authentication errors
  if (error) {
    // Check if the error is related to account deactivation
    if (error.includes("deactivated") || error.includes("inactive")) {
      return <DeactivatedAccountMessage />;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">
                Authentication Error
              </CardTitle>
            </div>
            <CardDescription>
              There was a problem with authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    if (redirectOnFail) {
      window.location.href = "/";
      return <LoadingScreen />;
    }
    return fallback || <LoadingScreen />;
  }

  // Check if user account is deactivated
  if (user && user.user_metadata?.status === "inactive") {
    console.log("🛡️ RoleGuard: User account is deactivated");
    return <DeactivatedAccountMessage />;
  }

  // Check if user has valid role
  if (!user.role) {
    if (redirectOnFail) {
      window.location.href = "/";
      return <LoadingScreen />;
    }

    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="border-red-200 bg-red-50 max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-600">Invalid Role</CardTitle>
              </div>
              <CardDescription>
                Your account role is not properly configured.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-4">
                Please contact your administrator to configure your role.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check role-based access if roles are specified
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role as UserRole)
  ) {
    console.log(
      "🛡️ RoleGuard: Role not allowed:",
      user.role,
      "Required:",
      allowedRoles
    );

    if (redirectOnFail) {
      window.location.href = "/";
      return <LoadingScreen />;
    }

    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                Your role: {user.role} | Required: {allowedRoles.join(", ")}
              </span>
            </AlertDescription>
          </Alert>
        </div>
      )
    );
  }

  // Handle school assignment requirement
  if (requireSchoolAssignment && !user.school_id && true) {
    if (redirectOnFail) {
      window.location.href = "/setup";
      return <LoadingScreen />;
    }

    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="border-yellow-200 bg-yellow-50 max-w-md">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-800">
                  School Assignment Required
                </CardTitle>
              </div>
              <CardDescription>
                Your account needs to be assigned to a school.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-700 mb-4">
                Please contact your administrator to assign your account to a
                school.
              </p>
              <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded">
                Role: {user.role}
                <br />
                User ID: {user.id?.slice(0, 8)}...
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // All checks passed
  console.log("🛡️ RoleGuard: Access granted for role:", user.role);
  return <>{children}</>;
};

export default RoleGuard;
