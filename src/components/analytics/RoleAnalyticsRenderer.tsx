import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import SchoolOwnerAnalytics from "./SchoolOwnerAnalytics";
import PrincipalAnalytics from "./PrincipalAnalytics";
import TeacherAnalytics from "./TeacherAnalytics";
import ParentAnalytics from "./ParentAnalytics";
import FinanceOfficerAnalytics from "./FinanceOfficerAnalytics";


interface RoleAnalyticsRendererProps {
  role: string;
  filters: {
    term: string;
    class: string;
    subject: string;
    dateRange: string;
  };
}

const RoleAnalyticsRenderer: React.FC<RoleAnalyticsRendererProps> = ({ role, filters }) => {
  try {
    switch (role) {
      case "school_director":
        return <SchoolOwnerAnalytics filters={filters} />;
      case "principal":
        return <PrincipalAnalytics />;
      case "teacher":
        return <TeacherAnalytics filters={filters} />;
      case "parent":
        return <ParentAnalytics filters={filters} />;
      case "finance_officer":
        return <FinanceOfficerAnalytics filters={filters} />;
      case "edufam_admin":
      case "elimisha_admin":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>Admin analytics are not available in the school application.</CardDescription>
            </CardHeader>
          </Card>
        );
      case "hr":
        // HR has separate analytics in their dedicated dashboard
        return (
          <Card>
            <CardHeader>
              <CardTitle>HR Analytics</CardTitle>
              <CardDescription>
                Human Resources analytics and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  HR analytics are available in the dedicated HR Dashboard. Navigate to your dashboard to access HR-specific analytics and reports.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don&apos;t have permission to view analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Role &quot;{role}&quot; is not authorized for analytics access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );
    }
  } catch (error) {
    console.error("📊 RoleAnalyticsRenderer: Error rendering analytics:", error);
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Analytics Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load analytics component. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
};

export default RoleAnalyticsRenderer;
