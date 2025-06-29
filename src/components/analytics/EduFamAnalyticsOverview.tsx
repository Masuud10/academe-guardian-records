
import React from 'react';
import { useAdminSchoolsData } from '@/hooks/useAdminSchoolsData';
import { useAdminUsersData } from '@/hooks/useAdminUsersData';
import { useEduFamAnalyticsData } from '@/hooks/useEduFamAnalyticsData';
import { useSystemAnalytics } from '@/hooks/useSystemAnalytics';
import { TrendingUp } from 'lucide-react';
import SystemOverviewChartsSection from './sections/SystemOverviewChartsSection';
import EnhancedSystemAnalyticsSection from './sections/EnhancedSystemAnalyticsSection';
import AdditionalAnalyticsCardsSection from './sections/AdditionalAnalyticsCardsSection';
import AnalyticsLoadingState from './sections/AnalyticsLoadingState';
import AnalyticsErrorState from './sections/AnalyticsErrorState';
import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';

const EduFamAnalyticsOverview = () => {
  const { data: schoolsData = [], isLoading: schoolsLoading } = useAdminSchoolsData(0);
  const { data: usersData = [], isLoading: usersLoading } = useAdminUsersData(0);
  const { data: analyticsData, isLoading: analyticsLoading } = useEduFamAnalyticsData();
  const { 
    data: systemAnalytics, 
    isLoading: systemAnalyticsLoading, 
    error: systemAnalyticsError,
    refetch: refetchSystemAnalytics 
  } = useSystemAnalytics();

  const isLoading = schoolsLoading || usersLoading || analyticsLoading || systemAnalyticsLoading;

  if (isLoading) {
    return <AnalyticsLoadingState />;
  }

  if (systemAnalyticsError) {
    return <AnalyticsErrorState onRetry={() => refetchSystemAnalytics()} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Real-Time Analytics Overview</h3>
        <div className="ml-auto text-sm text-gray-500">
          Live data • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* System Overview Charts */}
      <SystemOverviewChartsSection
        schoolsCount={schoolsData.length}
        usersCount={usersData.length}
        analyticsData={analyticsData}
      />

      {/* Enhanced Visual Analytics Section */}
      {systemAnalytics && (
        <>
          <EnhancedSystemAnalyticsSection systemAnalytics={systemAnalytics} />
          <AdditionalAnalyticsCardsSection systemAnalytics={systemAnalytics} />
        </>
      )}

      {/* Individual School Analytics Section */}
      <SchoolAnalyticsDetail />
    </div>
  );
};

export default EduFamAnalyticsOverview;
