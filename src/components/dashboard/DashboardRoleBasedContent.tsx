
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SchoolOwnerDashboard from "./SchoolOwnerDashboard";
import PrincipalDashboard from "./PrincipalDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
import ElimshaAdminDashboard from "./ElimshaAdminDashboard";
import FinanceOfficerDashboard from "./FinanceOfficerDashboard";
import EmptySchoolDashboard from "./EmptySchoolDashboard";
import { User } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface DashboardRoleBasedContentProps {
  user: User;
  onModalOpen: (modalType: string) => void;
}

const DashboardRoleBasedContent = ({ user, onModalOpen }: DashboardRoleBasedContentProps) => {
  const { currentSchool } = useSchoolScopedData();

  console.log(
    "📊 Dashboard: Getting role-based dashboard for role:",
    user?.role,
    "user object:",
    user,
    "school:",
    user?.school_id,
    "currentSchool:",
    currentSchool
  );

  // Ensure we have a valid user and role
  if (!user || !user.role) {
    console.log("📊 Dashboard: No user or role found, showing default message");
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Dashboard</CardTitle>
          <CardDescription>
            Setting up your dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please wait while we load your role-specific dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  // For Elimisha/EduFam admins, ALWAYS show admin dashboard regardless of school assignment
  if (user.role === 'elimisha_admin' || user.role === 'edufam_admin') {
    console.log("📊 Dashboard: Rendering ElimshaAdminDashboard for admin role:", user.role);
    return <ElimshaAdminDashboard onModalOpen={onModalOpen} />;
  }

  // For all other roles, check if they have school assignment when needed
  if (!user.school_id && user.role !== 'elimisha_admin' && user.role !== 'edufam_admin') {
    console.log("📊 Dashboard: User has no school assignment, role:", user.role);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Setup Required</CardTitle>
          <CardDescription>
            Your account has not been assigned to a school yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Please contact your administrator to assign you to a school. Your role: {user.role}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render role-specific dashboard based on exact role match
  console.log("📊 Dashboard: Rendering dashboard for role:", user.role);
  
  switch (user.role) {
    case "school_owner":
      console.log("📊 Dashboard: Rendering SchoolOwnerDashboard");
      return <SchoolOwnerDashboard />;
      
    case "principal":
      console.log("📊 Dashboard: Rendering PrincipalDashboard");
      return <PrincipalDashboard />;
      
    case "teacher":
      console.log("📊 Dashboard: Rendering TeacherDashboard");
      return <TeacherDashboard />;
      
    case "finance_officer":
      console.log("📊 Dashboard: Rendering FinanceOfficerDashboard");
      return <FinanceOfficerDashboard onModalOpen={onModalOpen} />;
      
    case "parent":
      console.log("📊 Dashboard: Rendering ParentDashboard");
      return <ParentDashboard />;
      
    default:
      console.log("📊 Dashboard: Unknown or invalid role, showing error:", user.role);
      return (
        <Card>
          <CardHeader>
            <CardTitle>Invalid Role</CardTitle>
            <CardDescription>
              Your account role is not recognized: {user.role || "undefined"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Please contact your administrator to verify your account permissions.
              {user.school_id && ` | School: ${user.school_id.slice(0, 8)}...`}
            </p>
          </CardContent>
        </Card>
      );
  }
};

export default DashboardRoleBasedContent;
