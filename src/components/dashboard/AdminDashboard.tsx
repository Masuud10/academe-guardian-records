import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useRoleValidation } from "@/hooks/useRoleValidation";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

import SchoolAdminDashboard from "./school-admin/SchoolAdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./parent/ParentDashboard";
import AdminCommunicationsBanner from "@/components/common/AdminCommunicationsBanner";

const AdminDashboard = () => {
  const { user, isLoading, error } = useAuth();
  const { schoolId } = useSchoolScopedData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={() => window.location.reload()}
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  if (!user) {
    return (
      <ErrorMessage
        error="Please log in to access the dashboard."
        className="max-w-md mx-auto mt-20"
      />
    );
  }

  const handleModalOpen = (modalType: string) => {
    console.log("AdminDashboard: Opening modal:", modalType);
    // Handle modal opening logic here
  };

  // Role-based dashboard rendering with proper error boundaries
  return (
    <ErrorBoundary>
      <AdminCommunicationsBanner />
      {(() => {
        switch (user.role) {
          case "edufam_admin":
            return (
              <ErrorBoundary>
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold text-red-600 mb-4">Access Restricted</h2>
                  <p className="text-gray-600">Admin features are not available in the school application.</p>
                </div>
              </ErrorBoundary>
            );

          case "principal":
          case "school_owner":
            if (!schoolId) {
              return (
                <ErrorMessage
                  error="Your account needs to be assigned to a school. Please contact the system administrator."
                  className="max-w-md mx-auto mt-20"
                />
              );
            }
            return (
              <ErrorBoundary>
                <SchoolAdminDashboard
                  user={user}
                  onModalOpen={handleModalOpen}
                />
              </ErrorBoundary>
            );

          case "teacher":
            if (!schoolId) {
              return (
                <ErrorMessage
                  error="Your account needs to be assigned to a school. Please contact your principal."
                  className="max-w-md mx-auto mt-20"
                />
              );
            }
            return (
              <ErrorBoundary>
                <TeacherDashboard user={user} onModalOpen={handleModalOpen} />
              </ErrorBoundary>
            );

          case "parent":
            return (
              <ErrorBoundary>
                <ParentDashboard />
              </ErrorBoundary>
            );

          default:
            return (
              <ErrorMessage
                error={`Invalid user role: ${user.role}. Please contact support.`}
                className="max-w-md mx-auto mt-20"
              />
            );
        }
      })()}
    </ErrorBoundary>
  );
};

export default AdminDashboard;
