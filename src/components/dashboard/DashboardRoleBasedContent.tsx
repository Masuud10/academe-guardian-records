import React from "react";
import { AuthUser } from "@/types/auth";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useRoleValidation } from "@/hooks/useRoleValidation";

import SchoolAdminDashboard from "./SchoolAdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import SchoolOwnerDashboard from "./SchoolOwnerDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import MaintenanceNotification from "@/components/common/MaintenanceNotification";
import SchoolDirectorDashboard from "./SchoolDirectorDashboard";
import HRDashboard from "./HRDashboard";

interface DashboardRoleBasedContentProps {
  user: AuthUser;
  onModalOpen: (modalType: string) => void;
}

const DashboardRoleBasedContent: React.FC<DashboardRoleBasedContentProps> = ({
  user,
  onModalOpen,
}) => {
  const { isSystemAdmin, schoolId, isReady } = useSchoolScopedData();
  const { isValid, hasValidRole, hasRequiredSchoolAssignment, error } =
    useRoleValidation();

  console.log("📊 DashboardRoleBasedContent: Rendering for role:", user.role, {
    isSystemAdmin,
    schoolId,
    userSchoolId: user.school_id,
    isReady,
    isValid,
    hasValidRole,
    hasRequiredSchoolAssignment,
  });

  // Wait for school scoped data to be ready
  if (!isReady) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  // Handle invalid role state
  if (!hasValidRole) {
    console.error(
      "📊 DashboardRoleBasedContent: Invalid role detected:",
      user.role
    );
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">
              Role Configuration Error
            </CardTitle>
          </div>
          <CardDescription>
            Your account role is not properly configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">
            {error ||
              `Your account role "${user.role || "None"}" is not recognized.`}
          </p>
          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Debug Info:</strong>
            <br />
            User ID: {user.id?.slice(0, 8)}...
            <br />
            Email: {user.email}
            <br />
            Role: {user.role || "None"}
            <br />
            School ID: {user.school_id || "None"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle school assignment issues for roles that require it
  if (!hasRequiredSchoolAssignment) {
    console.warn(
      "📊 DashboardRoleBasedContent: School assignment required but missing for role:",
      user.role
    );
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">
            School Assignment Required
          </CardTitle>
          <CardDescription>
            Your account needs to be assigned to a school.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 mb-4">
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
    );
  }

  console.log(
    "📊 DashboardRoleBasedContent: Routing based on role:",
    user.role
  );

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case "edufam_admin":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering SystemAdminDashboard for edufam_admin"
      );
      return (
        <div>
          <MaintenanceNotification />
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600">
              Admin features are not available in the school application.
            </p>
          </div>
        </div>
      );

    case "school_director":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering SchoolDirectorDashboard for school_director"
      );
      return (
        <div>
          <MaintenanceNotification />
          <SchoolDirectorDashboard />
        </div>
      );

    case "principal":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering PrincipalDashboard for principal"
      );
      return (
        <div>
          <MaintenanceNotification />
          <PrincipalDashboard user={user} onModalOpen={onModalOpen} />
        </div>
      );

    case "teacher":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering TeacherDashboard for teacher"
      );
      return (
        <div>
          <MaintenanceNotification />
          <TeacherDashboard user={user} onModalOpen={onModalOpen} />
        </div>
      );

    case "finance_officer":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering FinanceOfficerDashboard for finance_officer"
      );
      return (
        <div>
          <MaintenanceNotification />
          <FinanceOfficerDashboard user={user} />
        </div>
      );

    case "hr":
      console.log("📊 DashboardRoleBasedContent: Rendering HRDashboard for hr");
      return (
        <div>
          <MaintenanceNotification />
          <HRDashboard user={user} />
        </div>
      );

    case "parent":
      console.log(
        "📊 DashboardRoleBasedContent: Rendering ParentDashboard for parent"
      );
      return (
        <div>
          <MaintenanceNotification />
          <ParentDashboard user={user} onModalOpen={onModalOpen} />
        </div>
      );

    default:
      console.error(
        "📊 DashboardRoleBasedContent: Unknown role detected:",
        user.role
      );
      return (
        <div>
          <MaintenanceNotification />
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-600">Unknown Role</CardTitle>
              <CardDescription>
                Your account role is not recognized by the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">
                Role "{user.role}" is not supported. Please contact your
                administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      );
  }
};

export default DashboardRoleBasedContent;
