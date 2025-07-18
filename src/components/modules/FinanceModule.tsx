import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import FinanceSettingsPanel from "@/components/finance/FinanceSettingsPanel";
import StudentAccountsPanel from "@/components/finance/StudentAccountsPanel";
import MpesaPaymentsPanel from "@/components/finance/MpesaPaymentsPanel";
import FinancialReportsPanel from "@/components/finance/FinancialReportsPanel";
import FinanceAnalyticsPanel from "@/components/finance/FinanceAnalyticsPanel";
import FinanceDebugTest from "@/components/finance/FinanceDebugTest";
import { useFinanceOfficerAnalytics } from "@/hooks/useFinanceOfficerAnalytics";
import {
  DollarSign,
  Settings,
  Users,
  CreditCard,
  BarChart3,
  FileText,
  RefreshCw,
} from "lucide-react";

const FinanceModule: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: analyticsData } = useFinanceOfficerAnalytics({
    term: "current",
    class: "all",
  });

  if (
    !user ||
    !["finance_officer", "principal", "school_director"].includes(
      user.role || ""
    )
  ) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p>You don't have permission to access the finance module.</p>
      </div>
    );
  }

  const keyMetrics = analyticsData?.keyMetrics || {
    totalRevenue: 0,
    totalCollected: 0,
    outstandingAmount: 0,
    totalMpesaPayments: 0,
    collectionRate: 0,
    totalStudents: 0,
    defaultersCount: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-muted-foreground">
            Manage school finances, fees, and payments
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mpesa" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            MPESA Payments
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Accounts
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Debug Test
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KES {keyMetrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected fees this year
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Collected
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  KES {keyMetrics.totalCollected.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Collected so far
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Outstanding
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  KES {keyMetrics.outstandingAmount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending payments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Collection Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {keyMetrics.collectionRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Payment efficiency
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Students</span>
                  <span className="font-semibold">
                    {keyMetrics.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Students with Outstanding Fees</span>
                  <span className="font-semibold text-orange-600">
                    {keyMetrics.defaultersCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MPESA Payments (Total)</span>
                  <span className="font-semibold text-green-600">
                    KES {keyMetrics.totalMpesaPayments.toLocaleString()}
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
                  onClick={() => setActiveTab("students")}
                  className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">View Student Accounts</div>
                  <div className="text-sm text-muted-foreground">
                    Check individual balances and payment history
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">Generate Reports</div>
                  <div className="text-sm text-muted-foreground">
                    Export financial data and summaries
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("mpesa")}
                  className="w-full p-3 text-left border rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">MPESA Transactions</div>
                  <div className="text-sm text-muted-foreground">
                    View and manage mobile payments
                  </div>
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mpesa">
          <MpesaPaymentsPanel />
        </TabsContent>

        <TabsContent value="students">
          <StudentAccountsPanel />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReportsPanel />
        </TabsContent>

        <TabsContent value="analytics">
          <FinanceAnalyticsPanel />
        </TabsContent>

        <TabsContent value="settings">
          <FinanceSettingsPanel />
        </TabsContent>

        <TabsContent value="debug">
          <FinanceDebugTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceModule;
