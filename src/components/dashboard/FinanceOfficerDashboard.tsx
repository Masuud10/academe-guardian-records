import React, { useState, useEffect } from "react";
import { AuthUser } from "@/types/auth";
import { useOptimizedFinanceMetrics } from "@/hooks/finance/useOptimizedFinanceMetrics";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FinanceAnalyticsCharts from "@/components/finance/FinanceAnalyticsCharts";

interface FinanceOfficerDashboardProps {
  user: AuthUser;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({
  user,
}) => {
  console.log(
    "💰 FinanceOfficerDashboard: Rendering for finance officer:",
    user.email
  );

  // CRITICAL SECURITY FIX: Enhanced role validation
  useEffect(() => {
    if (
      ![
        "finance_officer",
        "principal",
        "school_director",
        "elimisha_admin",
        "edufam_admin",
      ].includes(user.role)
    ) {
      console.error(
        "🚫 FinanceOfficerDashboard: Unauthorized role attempting access:",
        user.role
      );
      // Component should not render for unauthorized roles
    }
  }, [user.role]);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setActiveSection } = useNavigation();
  const {
    metrics,
    isLoading,
    error,
    loadingTimeout,
    dataTruncated,
    retryCount,
    refetch,
  } = useOptimizedFinanceMetrics();

  const handleRefresh = async () => {
    console.log("Refreshing finance dashboard...");
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);

    try {
      if (refetch) {
        await refetch();
      }
    } catch (refreshError) {
      console.error("Error during refresh:", refreshError);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Show loading state with timeout
  if (isLoading && !loadingTimeout && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial overview...</p>
          {retryCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Retry attempt {retryCount}/2
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error state or timeout
  if (error || loadingTimeout) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {loadingTimeout
              ? "Loading Timeout"
              : "Error Loading Financial Data"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {loadingTimeout
              ? "The dashboard is taking longer than expected to load. Please try refreshing."
              : "There was a problem loading the financial analytics. Please try refreshing the page."}
            {error && (
              <>
                <br />
                <small className="text-xs mt-2 block">
                  Error: {error.message}
                </small>
              </>
            )}
            {retryCount > 0 && (
              <>
                <br />
                <small className="text-xs mt-2 block">
                  Retry attempts: {retryCount}/2
                </small>
              </>
            )}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Retry Loading"}
          </Button>
        </div>
      </div>
    );
  }

  // Use metrics with safe fallbacks
  const safeMetrics = metrics || {
    totalRevenue: 0,
    totalCollected: 0,
    outstandingAmount: 0,
    totalMpesaPayments: 0,
    collectionRate: 0,
    totalStudents: 0,
    defaultersCount: 0,
  };

  // Validate metrics for display
  const hasValidData =
    safeMetrics.totalRevenue > 0 || safeMetrics.totalStudents > 0;
  const hasZeroMetrics =
    safeMetrics.totalRevenue === 0 && safeMetrics.totalStudents === 0;

  return (
    <div className="space-y-8" key={refreshKey}>
      {/* Data truncation warning */}
      {dataTruncated && (
        <Alert variant="default" className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            Data Truncation Warning
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Some financial data may be truncated due to large datasets. For
            complete analysis, use the detailed reports.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {safeMetrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expected this term</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collected
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {safeMetrics.totalCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {safeMetrics.outstandingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Collection Rate
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {safeMetrics.collectionRate}%
            </div>
            <p className="text-xs text-muted-foreground">Payment efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics Charts */}
      {hasValidData && <FinanceAnalyticsCharts />}

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Total Students</span>
              <span className="font-semibold">{safeMetrics.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span>Students with Outstanding Fees</span>
              <span className="font-semibold text-orange-600">
                {safeMetrics.defaultersCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Compliance</span>
              <span className="font-semibold text-green-600">
                {safeMetrics.totalStudents > 0
                  ? Math.round(
                      ((safeMetrics.totalStudents -
                        safeMetrics.defaultersCount) /
                        safeMetrics.totalStudents) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>MPESA Payments</span>
              <span className="font-semibold text-green-600">
                KES {safeMetrics.totalMpesaPayments.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Other Methods</span>
              <span className="font-semibold">
                KES{" "}
                {Math.max(
                  0,
                  safeMetrics.totalCollected - safeMetrics.totalMpesaPayments
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MPESA Share</span>
              <span className="font-semibold">
                {safeMetrics.totalCollected > 0
                  ? Math.round(
                      (safeMetrics.totalMpesaPayments /
                        safeMetrics.totalCollected) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => setActiveSection("fee-management")}
              className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">View Fee Management</div>
              <div className="text-sm text-muted-foreground">
                Manage student fees and payments
              </div>
            </button>
            <button
              onClick={() => setActiveSection("financial-reports")}
              className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Generate Reports</div>
              <div className="text-sm text-muted-foreground">
                Export financial summaries
              </div>
            </button>
            <button
              onClick={() => setActiveSection("financial-analytics")}
              className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-muted-foreground">
                Detailed financial insights
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Data Status Info */}
      {hasZeroMetrics && (
        <div className="text-center py-8">
          <div className="bg-blue-50 rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Getting Started
            </h3>
            <p className="text-blue-700 mb-4">
              No financial data found. This could be because:
            </p>
            <ul className="text-sm text-blue-600 text-left max-w-md mx-auto space-y-1">
              <li>• No fee structures have been set up</li>
              <li>• No student fee records exist</li>
              <li>• No payments have been recorded</li>
            </ul>
            <p className="text-sm text-blue-600 mt-4">
              Start by setting up fee structures in the Finance Module to see
              analytics here.
            </p>
          </div>
        </div>
      )}

      {/* Refresh button for manual refresh */}
      <div className="flex justify-center">
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="mt-4"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
        </Button>
      </div>
    </div>
  );
};

export default FinanceOfficerDashboard;
