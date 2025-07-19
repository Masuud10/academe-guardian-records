import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  BarChart3,
  DollarSign,
  FileText,
  UserCheck,
  UserX,
  Building2,
  Shield,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditStaffDialog } from "@/components/hr/EditStaffDialog";
import { SupportStaff } from "@/types/supportStaff";
import HRAnalyticsOverview from "@/components/hr/HRAnalyticsOverview";
import { useToast } from "@/hooks/use-toast";

interface HRDashboardProps {
  user: AuthUser;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ user }) => {
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch support staff data
  const {
    data: supportStaff,
    isLoading: isLoadingStaff,
    refetch: refetchStaff,
  } = useQuery<SupportStaff[]>({
    queryKey: ["support-staff", user.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_staff")
        .select(
          "id, school_id, employee_id, full_name, role_title, department, profile_photo_url, salary_amount, salary_currency, employment_type, phone, email, address, date_of_hire, supervisor_id, notes, is_active, created_at, updated_at, created_by"
        )
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((staff) => ({
        ...staff,
        role_title:
          staff.role_title as import("@/types/supportStaff").SupportStaffRole,
      })) as SupportStaff[];
    },
    enabled: !!user.school_id,
  });

  // Fetch school users for HR management
  const { data: schoolUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["school-users", user.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user.school_id,
  });

  // Calculate HR metrics
  const totalStaff = supportStaff?.length || 0;
  const activeStaff =
    supportStaff?.filter((staff) => staff.is_active === true).length || 0;
  const totalUsers = schoolUsers?.length || 0;
  const activeUsers =
    schoolUsers?.filter((user) => user.status !== "inactive").length || 0;

  // Calculate salary metrics
  const totalSalary =
    supportStaff
      ?.filter((staff) => staff.salary_amount)
      .reduce((sum, staff) => sum + (staff.salary_amount || 0), 0) || 0;

  const avgSalary = totalStaff > 0 ? totalSalary / totalStaff : 0;

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentHires =
    supportStaff?.filter((staff) => new Date(staff.created_at) > sevenDaysAgo)
      .length || 0;

  const handleEditStaff = (staff: SupportStaff) => {
    setSelectedStaff(staff);
    setEditDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 hover:bg-green-200"
      : "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getEmploymentTypeBadge = (type: string) => {
    const colors = {
      permanent: "bg-blue-100 text-blue-800",
      contract: "bg-orange-100 text-orange-800",
      temporary: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoadingStaff || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground">
            Manage human resources, staff, and user administration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Total Staff
            </CardTitle>
            <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalStaff}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Support staff members
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Active Staff
            </CardTitle>
            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {activeStaff}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              System Users
            </CardTitle>
            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
              <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {totalUsers}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Avg. Salary
            </CardTitle>
            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
              <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              KES {Math.round(avgSalary).toLocaleString()}
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Monthly average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Alert */}
      {recentHires > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>{recentHires} new staff member(s)</strong> joined in the
            last 7 days. Review their profiles and complete onboarding.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Directory</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Staff Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Active Staff
                </CardTitle>
                <CardDescription>
                  Currently active support staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportStaff
                    ?.filter((staff) => staff.is_active)
                    .slice(0, 5)
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {staff.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{staff.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {staff.role_title}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={getEmploymentTypeBadge(
                            staff.employment_type
                          )}
                        >
                          {staff.employment_type}
                        </Badge>
                      </div>
                    ))}
                  {supportStaff?.filter((staff) => staff.is_active).length ===
                    0 && (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No active staff found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-600" />
                  Inactive Staff
                </CardTitle>
                <CardDescription>
                  Staff members currently inactive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supportStaff
                    ?.filter((staff) => !staff.is_active)
                    .slice(0, 5)
                    .map((staff) => (
                      <div
                        key={staff.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {staff.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{staff.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {staff.role_title}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-gray-600">
                          Inactive
                        </Badge>
                      </div>
                    ))}
                  {supportStaff?.filter((staff) => !staff.is_active).length ===
                    0 && (
                    <div className="text-center py-8">
                      <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No inactive staff found
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                Complete list of all support staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportStaff?.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {staff.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{staff.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {staff.role_title} • {staff.employee_id}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">
                            {staff.email} • {staff.phone}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            className={getEmploymentTypeBadge(
                              staff.employment_type
                            )}
                          >
                            {staff.employment_type}
                          </Badge>
                          {staff.department && (
                            <Badge variant="outline">{staff.department}</Badge>
                          )}
                          {staff.salary_amount && (
                            <Badge variant="outline">
                              {staff.salary_currency}{" "}
                              {staff.salary_amount.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={getStatusBadge(staff.is_active || false)}
                      >
                        {staff.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStaff(staff)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                {supportStaff?.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No staff found</h3>
                    <p className="text-muted-foreground">
                      No support staff records available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                HR Analytics Overview
              </CardTitle>
              <CardDescription className="text-base">
                Comprehensive analytics and insights for human resources
                management
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <HRAnalyticsOverview user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-6">
          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Staff Management</CardTitle>
                <CardDescription>
                  Manage all HR staff with full CRUD capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Payroll Management</CardTitle>
                <CardDescription>
                  Handle salary processing and compensation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Attendance Monitoring</CardTitle>
                <CardDescription>
                  Track staff attendance and time management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">HR Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive HR reports and analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg">User Management</CardTitle>
                <CardDescription>
                  Manage system users and access permissions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <BarChart3 className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-lg">HR Analytics</CardTitle>
                <CardDescription>
                  Advanced analytics and performance insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Staff Dialog */}
      {selectedStaff && (
        <EditStaffDialog
          staff={selectedStaff}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onStaffUpdated={() => {
            refetchStaff();
            setEditDialogOpen(false);
            setSelectedStaff(null);
            toast({
              title: "Staff Updated",
              description:
                "Staff member information has been updated successfully.",
            });
          }}
        />
      )}
    </div>
  );
};

export default HRDashboard;
