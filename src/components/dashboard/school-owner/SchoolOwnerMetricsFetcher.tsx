import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SchoolOwnerDashboardLayout from "./SchoolOwnerDashboardLayout";
import FinancialOverviewReadOnly from "../shared/FinancialOverviewReadOnly";
import ExpenseApprovalQueue from "@/components/finance/ExpenseApprovalQueue";

export interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  feeCollectionRate: number;
  totalRevenue: number;
  attendanceRate: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

const SchoolOwnerMetricsFetcher: React.FC = () => {
  const { user } = useAuth();
  const { schoolId, isSystemAdmin } = useSchoolScopedData();

  const [metrics, setMetrics] = useState<SchoolMetrics>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    feeCollectionRate: 0,
    totalRevenue: 0,
    attendanceRate: 0,
    outstandingFees: 0,
    monthlyGrowth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSchoolMetrics = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setError(
        "No school assignment found. Please contact your administrator."
      );
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        setLoading(true);
        setError(null);
        console.log(
          "📊 SchoolOwnerMetricsFetcher: Fetching metrics for school:",
          schoolId
        );

        const targetSchoolId = schoolId || user?.school_id;

        // Validate school ID format
        if (
          !targetSchoolId ||
          typeof targetSchoolId !== "string" ||
          targetSchoolId.length < 10
        ) {
          throw new Error("Invalid school ID format");
        }

        // Set timeout for better user experience
        const timeoutId = setTimeout(() => {
          console.warn(
            "📊 SchoolOwnerMetricsFetcher: Query timeout - showing partial data"
          );
          setLoading(false);
        }, 15000); // 15 second timeout

        // Fetch basic school metrics with proper error handling
        const [studentsRes, teachersRes, classesRes] = await Promise.all([
          supabase
            .from("students")
            .select("id", { count: "exact" })
            .eq("school_id", targetSchoolId)
            .eq("is_active", true),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .eq("school_id", targetSchoolId)
            .eq("role", "teacher")
            .eq("status", "active"),
          supabase
            .from("classes")
            .select("id", { count: "exact" })
            .eq("school_id", targetSchoolId),
        ]);

        clearTimeout(timeoutId);

        // Check for errors in basic queries
        if (studentsRes.error) {
          console.error("Error fetching students:", studentsRes.error);
          throw new Error(
            `Failed to fetch students: ${studentsRes.error.message}`
          );
        }
        if (teachersRes.error) {
          console.error("Error fetching teachers:", teachersRes.error);
          throw new Error(
            `Failed to fetch teachers: ${teachersRes.error.message}`
          );
        }
        if (classesRes.error) {
          console.error("Error fetching classes:", classesRes.error);
          throw new Error(
            `Failed to fetch classes: ${classesRes.error.message}`
          );
        }

        // Calculate attendance rate with error handling
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("status")
          .eq("school_id", targetSchoolId)
          .gte(
            "date",
            new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
          )
          .limit(1000);

        if (attendanceError) {
          console.error("Error fetching attendance:", attendanceError);
          // Don't throw error, just set to 0
        }
        if (attendanceData && attendanceData.length === 1000) {
          console.warn(
            "⚠️ Attendance data may be truncated (1000 records fetched)"
          );
        }

        const totalAttendance = attendanceData?.length || 0;
        const presentCount =
          attendanceData?.filter((a) => a.status === "present").length || 0;
        const attendanceRate =
          totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

        // @ts-expect-error - Supabase types are not fully typed
        const { data: financialData, error: financialError } = await supabase
          .from("financial_transactions")
          .select("amount")
          .eq("school_id", targetSchoolId)
          .eq("transaction_type", "payment")
          .eq("status", "completed")
          .limit(500);

        if (financialError) {
          console.error("Error fetching financial data:", financialError);
          // Don't throw error, continue with default values
        }

        const totalRevenue =
          financialData?.reduce(
            (sum, transaction) => sum + (Number(transaction.amount) || 0),
            0
          ) || 0;

        // Calculate fee collection rate and outstanding fees with error handling
        const { data: feeData, error: feeError } = await supabase
          .from("fees")
          .select("amount, paid_amount, status")
          .eq("school_id", targetSchoolId)
          .limit(500);

        if (feeError) {
          console.error("Error fetching fee data:", feeError);
          // Don't throw error, continue with default values
        }
        if (feeData && feeData.length === 500) {
          console.warn("⚠️ Fee data may be truncated (500 records fetched)");
        }

        const totalExpected =
          feeData?.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0) ||
          0;
        const totalCollected =
          feeData?.reduce(
            (sum, fee) => sum + (Number(fee.paid_amount) || 0),
            0
          ) || 0;
        const feeCollectionRate =
          totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
        const outstandingFees = Math.max(0, totalExpected - totalCollected);

        // Calculate monthly growth (simplified - comparing current month to previous)
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const { data: currentMonthData } = await supabase
          .from("financial_transactions")
          .select("amount")
          .eq("school_id", targetSchoolId)
          .eq("transaction_type", "payment")
          .eq("status", "completed")
          .gte(
            "created_at",
            new Date(currentYear, currentMonth, 1).toISOString()
          )
          .lt(
            "created_at",
            new Date(currentYear, currentMonth + 1, 1).toISOString()
          );

        const { data: previousMonthData } = await supabase
          .from("financial_transactions")
          .select("amount")
          .eq("school_id", targetSchoolId)
          .eq("transaction_type", "payment")
          .eq("status", "completed")
          .gte(
            "created_at",
            new Date(previousYear, previousMonth, 1).toISOString()
          )
          .lt(
            "created_at",
            new Date(previousYear, previousMonth + 1, 1).toISOString()
          );

        const currentMonthRevenue =
          currentMonthData?.reduce(
            (sum, t) => sum + (Number(t.amount) || 0),
            0
          ) || 0;
        const previousMonthRevenue =
          previousMonthData?.reduce(
            (sum, t) => sum + (Number(t.amount) || 0),
            0
          ) || 0;

        const monthlyGrowth =
          previousMonthRevenue > 0
            ? ((currentMonthRevenue - previousMonthRevenue) /
                previousMonthRevenue) *
              100
            : 0;

        const calculatedMetrics = {
          totalStudents: studentsRes.count || 0,
          totalTeachers: teachersRes.count || 0,
          totalClasses: classesRes.count || 0,
          feeCollectionRate: Math.round(
            Math.min(100, Math.max(0, feeCollectionRate))
          ),
          totalRevenue: Math.round(totalRevenue),
          attendanceRate: Math.round(
            Math.min(100, Math.max(0, attendanceRate))
          ),
          outstandingFees: Math.round(outstandingFees),
          monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
        };

        setMetrics(calculatedMetrics);
        setLastUpdated(new Date());

        // Warn if all metrics are zero (possible data or access issue)
        if (
          (studentsRes.count || 0) === 0 &&
          (teachersRes.count || 0) === 0 &&
          (classesRes.count || 0) === 0 &&
          Math.round(totalRevenue) === 0 &&
          Math.round(attendanceRate) === 0
        ) {
          console.warn(
            "⚠️ All school metrics are zero. This may indicate a data or access issue."
          );
        }

        setError(null);
        break; // Success, exit loop
      } catch (err: unknown) {
        attempts++;
        const isNetwork =
          err instanceof Error &&
          err.message &&
          (err.message.includes("Network") || err.message.includes("timeout"));
        if (attempts < maxAttempts && isNetwork) {
          console.warn(
            `Retrying school metrics fetch (attempt ${attempts + 1})`
          );
          await new Promise((res) => setTimeout(res, 1000 * attempts));
          continue;
        }
        console.error(
          "📊 SchoolOwnerMetricsFetcher: Error fetching metrics:",
          err
        );
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to load school metrics. Please try again.";
        setError(errorMessage);
        break;
      } finally {
        setLoading(false);
      }
    }
  }, [schoolId, user?.school_id, isSystemAdmin]);

  useEffect(() => {
    fetchSchoolMetrics();
  }, [fetchSchoolMetrics]);

  const handleRetry = () => {
    fetchSchoolMetrics();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="m-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SchoolOwnerDashboardLayout
        metrics={metrics}
        loading={loading}
        schoolId={schoolId}
        onManagementAction={(action) => {
          console.log("School Director Management Action:", action);
        }}
      />

      {/* Expense Approval Queue */}
      <ExpenseApprovalQueue />

      {/* Financial Overview - Linked to Finance Officer Dashboard */}
      <FinancialOverviewReadOnly />

      {/* Last Updated Indicator */}
      {lastUpdated && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default SchoolOwnerMetricsFetcher;
