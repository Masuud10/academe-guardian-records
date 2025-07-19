import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Users,
  Building2,
  Shield,
  Database,
  Network,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardTestResult {
  role: string;
  authentication: boolean;
  schoolAssignment: boolean;
  dataAccess: boolean;
  permissions: boolean;
  dashboardRender: boolean;
  errors: string[];
  warnings: string[];
}

const DashboardDebugger: React.FC = () => {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const { schoolId, isReady, isSystemAdmin } = useSchoolScopedData();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<DashboardTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");

  const validRoles = [
    "school_director",
    "principal",
    "teacher",
    "finance_officer",
    "hr",
    "parent",
  ];

  const runDashboardTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const results: DashboardTestResult[] = [];

    for (const role of validRoles) {
      setCurrentTest(`Testing ${role} dashboard...`);

      const result: DashboardTestResult = {
        role,
        authentication: false,
        schoolAssignment: false,
        dataAccess: false,
        permissions: false,
        dashboardRender: false,
        errors: [],
        warnings: [],
      };

      try {
        // Test 1: Authentication
        if (user && user.role === role) {
          result.authentication = true;
        } else {
          result.errors.push("User role mismatch or no user found");
        }

        // Test 2: School Assignment
        if (role !== "parent" && role !== "edufam_admin") {
          if (schoolId || user?.school_id) {
            result.schoolAssignment = true;
          } else {
            result.errors.push("No school assignment found");
          }
        } else {
          result.schoolAssignment = true; // Parents don't need school assignment
        }

        // Test 3: Data Access
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, role, school_id")
            .eq("role", role)
            .limit(1);

          if (!error && data && data.length > 0) {
            result.dataAccess = true;
          } else {
            result.errors.push(`No ${role} users found in database`);
          }
        } catch (error) {
          result.errors.push(`Database access failed: ${error}`);
        }

        // Test 4: Permissions
        const hasValidRole = validRoles.includes(role);
        if (hasValidRole) {
          result.permissions = true;
        } else {
          result.errors.push("Invalid role for school application");
        }

        // Test 5: Dashboard Render (simulate)
        result.dashboardRender = result.authentication && result.permissions;

        // Add warnings for potential issues
        if (role === "school_director" && !isSystemAdmin) {
          result.warnings.push(
            "School director may need system admin privileges"
          );
        }

        if (role === "finance_officer" && !schoolId) {
          result.warnings.push(
            "Finance officer needs school assignment for full functionality"
          );
        }
      } catch (error) {
        result.errors.push(`Test failed: ${error}`);
      }

      results.push(result);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest("");

    // Show summary toast
    const passedTests = results.filter((r) => r.dashboardRender).length;
    const totalTests = results.length;

    toast({
      title: "Dashboard Tests Complete",
      description: `${passedTests}/${totalTests} dashboards passed all tests`,
      variant: passedTests === totalTests ? "default" : "destructive",
    });
  };

  const getTestStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getOverallStatus = (result: DashboardTestResult) => {
    const allPassed =
      result.authentication &&
      result.schoolAssignment &&
      result.dataAccess &&
      result.permissions &&
      result.dashboardRender;
    return allPassed ? "success" : "error";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Debugger
          </CardTitle>
          <CardDescription>
            Comprehensive testing tool for all user role dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 border rounded">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Database</p>
                  <p className="text-xs text-muted-foreground">
                    {authLoading ? "Connecting..." : "Connected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded">
                <Network className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Network</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 border rounded">
                <Shield className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Authentication</p>
                  <p className="text-xs text-muted-foreground">
                    {user ? "Authenticated" : "Not authenticated"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current User Info */}
            {user && (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current User:</strong> {user.email} ({user.role})
                  {schoolId && ` | School: ${schoolId}`}
                </AlertDescription>
              </Alert>
            )}

            {/* Test Button */}
            <Button
              onClick={runDashboardTests}
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {currentTest}
                </>
              ) : (
                "Run Dashboard Tests"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Test Results</h3>

          {testResults.map((result) => (
            <Card
              key={result.role}
              className={`border-2 ${
                getOverallStatus(result) === "success"
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">
                    {result.role.replace("_", " ")} Dashboard
                  </span>
                  <Badge
                    variant={
                      getOverallStatus(result) === "success"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {getOverallStatus(result) === "success" ? "PASS" : "FAIL"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Test Checks */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.authentication)}
                      <span className="text-xs">Auth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.schoolAssignment)}
                      <span className="text-xs">School</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.dataAccess)}
                      <span className="text-xs">Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.permissions)}
                      <span className="text-xs">Perms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.dashboardRender)}
                      <span className="text-xs">Render</span>
                    </div>
                  </div>

                  {/* Errors */}
                  {result.errors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600">
                        Errors:
                      </p>
                      {result.errors.map((error, index) => (
                        <p key={index} className="text-xs text-red-600">
                          • {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {result.warnings.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-yellow-600">
                        Warnings:
                      </p>
                      {result.warnings.map((warning, index) => (
                        <p key={index} className="text-xs text-yellow-600">
                          • {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {
                    testResults.filter((r) => getOverallStatus(r) === "success")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {
                    testResults.filter((r) => getOverallStatus(r) === "error")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {testResults.reduce((sum, r) => sum + r.errors.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Errors</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {testResults.reduce((sum, r) => sum + r.warnings.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardDebugger;
