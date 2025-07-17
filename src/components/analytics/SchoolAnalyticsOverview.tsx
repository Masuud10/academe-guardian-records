
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSchoolAnalytics } from '@/hooks/useSchoolAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import SchoolAnalyticsDetail from './SchoolAnalyticsDetail';

const SchoolAnalyticsOverview = () => {
  const { user } = useAuth();

  // Permission check
  if (!user || user.role !== 'edufam_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Alert className="bg-red-50 border-red-200 max-w-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Access Denied</AlertTitle>
          <AlertDescription className="text-red-700">
            Only EduFam Admins can access school analytics.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* System-wide Analytics Stats Icons */}
      <Card>
        <CardHeader>
          <CardTitle>System Analytics Unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">System analytics are not available in the school application.</p>
        </CardContent>
      </Card>

      {/* Individual School Analytics */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Individual School Analytics</h2>
        </div>
        
        {/* Individual School Analytics Detail */}
        <SchoolAnalyticsDetail />
      </div>
    </div>
  );
};

export default SchoolAnalyticsOverview;
