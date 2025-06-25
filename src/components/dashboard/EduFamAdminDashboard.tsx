
import React, { useState } from 'react';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { calculateUserStats } from '@/utils/calculateUserStats';
import SystemOverviewCards from './admin/SystemOverviewCards';
import AdministrativeHub from './edufam-admin/AdministrativeHub';
import RecentSchoolsSection from './admin/RecentSchoolsSection';
import UserRoleBreakdown from './admin/UserRoleBreakdown';
import ErrorDisplay from './admin/ErrorDisplay';
import SystemHealthStatusCard from "@/components/analytics/SystemHealthStatusCard";
import EduFamAnalyticsOverview from '@/components/analytics/EduFamAnalyticsOverview';
import RoleReportDownloadButton from '@/components/reports/RoleReportDownloadButton';
import DashboardModals from './DashboardModals';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EduFamAdminDashboardProps {
  onModalOpen: (modalType: string) => void;
}

const EduFamAdminDashboard = ({ onModalOpen }: EduFamAdminDashboardProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { user } = useAuth();

  // Permission check - only edufam_admin should access this dashboard
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Access denied. Only EduFam Administrators can access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const {
    data: schoolsData = [],
    isLoading: schoolsLoading,
    error: schoolsError,
    refetch: refetchSchools,
    isRefetching: schoolsRefetching,
  } = useAdminSchoolsData(refreshKey);

  const {
    data: usersData = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
    isRefetching: usersRefetching,
  } = useAdminUsersData(refreshKey);

  const handleUserCreated = () => {
    console.log('👥 EduFamAdmin: User created, refreshing data');
    setRefreshKey((prev) => prev + 1);
  };

  const handleModalOpen = (modalType: string) => {
    console.log('[EduFamAdminDashboard] handleModalOpen called with:', modalType);
    setActiveModal(modalType);
    if (onModalOpen) onModalOpen(modalType);
  };

  const handleModalClose = () => {
    console.log('[EduFamAdminDashboard] handleModalClose');
    setActiveModal(null);
  };

  const handleDataChangedInModal = () => {
    console.log('[EduFamAdminDashboard] Data changed in modal, refreshing dashboard');
    setRefreshKey((prev) => prev + 1);
    setActiveModal(null);
  };

  const handleRetryAll = () => {
    console.log('🔄 EduFamAdmin: Retrying all data fetch');
    setRefreshKey((prev) => prev + 1);
    refetchSchools();
    refetchUsers();
  };

  const handleRetrySchools = () => {
    console.log('🏫 EduFamAdmin: Retrying schools fetch');
    refetchSchools();
  };

  const userStats = React.useMemo(() => {
    if (!Array.isArray(usersData) || usersData.length === 0) {
      return {
        totalUsers: 0,
        usersWithSchools: 0,
        usersWithoutSchools: 0,
        roleBreakdown: []
      };
    }
    return calculateUserStats(usersData);
  }, [usersData]);

  // Place report download buttons at the top for Admins
  const renderReportDownloads = () => (
    <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-2">
      <RoleReportDownloadButton
        type="grades"
        term={"" + (new Date().getFullYear())}
        label="Download All School Grades (Excel)"
      />
      <RoleReportDownloadButton
        type="attendance"
        term={"" + (new Date().getFullYear())}
        label="Download All School Attendance (Excel)"
      />
    </div>
  );

  // Critical error state: both queries failed
  if (schoolsError && usersError) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">EduFam Admin Dashboard</h1>
          <Button onClick={handleRetryAll} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry All
          </Button>
        </div>
        <ErrorDisplay
          schoolsError={schoolsError}
          usersError={usersError}
          onRetryAll={handleRetryAll}
        />
      </div>
    );
  }

  // Ensure we have valid arrays for calculations
  const validSchoolsData = Array.isArray(schoolsData) ? schoolsData : [];
  const validUsersData = Array.isArray(usersData) ? usersData : [];

  return (
    <div className="space-y-6">
      {/* Excel report download shortcuts for EduFam Admin */}
      {renderReportDownloads()}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
        <p className="text-blue-100">
          Manage your educational platform from this comprehensive admin dashboard
        </p>
      </div>

      {/* Stats Icons directly below greetings */}
      <SystemOverviewCards
        schoolsCount={validSchoolsData.length}
        totalUsers={userStats.totalUsers}
        usersWithSchools={userStats.usersWithSchools}
        usersWithoutSchools={userStats.usersWithoutSchools}
        schoolsLoading={schoolsLoading}
        usersLoading={usersLoading}
        schoolsRefetching={schoolsRefetching}
        usersRefetching={usersRefetching}
      />

      {/* Real-Time Analytics Overview (bar charts, line graphs, pie charts) */}
      <EduFamAnalyticsOverview />

      {/* System Health Status */}
      <SystemHealthStatusCard />

      {/* Administrative Hub */}
      <AdministrativeHub
        onModalOpen={handleModalOpen}
        onUserCreated={handleUserCreated}
      />

      {/* Modal Management - Only render when activeModal is set */}
      {activeModal && (
        <DashboardModals
          activeModal={activeModal}
          onClose={handleModalClose}
          user={user}
          onDataChanged={handleDataChangedInModal}
        />
      )}

      {/* Recent Schools Section */}
      <RecentSchoolsSection
        schoolsData={validSchoolsData}
        schoolsLoading={schoolsLoading}
        schoolsError={schoolsError}
        onModalOpen={handleModalOpen}
        onRetrySchools={handleRetrySchools}
      />

      {/* User Role Breakdown */}
      <UserRoleBreakdown
        roleBreakdown={userStats.roleBreakdown}
        totalUsers={userStats.totalUsers}
        usersLoading={usersLoading}
      />

      {/* Fallback error display for single errors */}
      {((schoolsError && !usersError) || (!schoolsError && usersError)) && (
        <ErrorDisplay
          schoolsError={schoolsError}
          usersError={usersError}
          onRetryAll={handleRetryAll}
        />
      )}
    </div>
  );
};

export default EduFamAdminDashboard;
