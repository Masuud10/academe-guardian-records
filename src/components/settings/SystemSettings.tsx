import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Shield,
  Database,
  Download,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Users,
  Calendar,
  FileText,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SystemSettings = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");

  // Check permissions
  const canManageSystem =
    user?.role &&
    ["school_director", "elimisha_admin", "edufam_admin"].includes(user.role);

  // Get system statistics
  const { data: systemStats, isLoading: loadingStats } = useQuery({
    queryKey: ["systemStats", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      // Get counts from various tables
      const [
        { count: studentsCount },
        { count: teachersCount },
        { count: parentsCount },
        { count: classesCount },
        { count: subjectsCount },
        { count: examinationsCount },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "teacher"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "parent"),
        supabase
          .from("classes")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("subjects")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("examinations")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
      ]);

      return {
        students: studentsCount || 0,
        teachers: teachersCount || 0,
        parents: parentsCount || 0,
        classes: classesCount || 0,
        subjects: subjectsCount || 0,
        examinations: examinationsCount || 0,
      };
    },
    enabled: !!schoolId,
  });

  // Get maintenance mode status
  const { data: maintenanceMode, isLoading: loadingMaintenance } = useQuery({
    queryKey: ["maintenanceMode"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (error && error.code !== "PGRST116") return { enabled: false };

      if (data?.setting_value && typeof data.setting_value === "object") {
        return (data.setting_value as any)?.enabled || false;
      }
      return false;
    },
  });

  // Get recent audit logs (as backup records)
  const { data: auditLogs, isLoading: loadingAudits } = useQuery({
    queryKey: ["auditLogs", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) return [];
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Toggle maintenance mode
  const toggleMaintenanceMode = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: {
          enabled: enabled,
          message: enabled
            ? "System is currently under maintenance. Please check back later."
            : "",
        },
        description: "Maintenance mode configuration",
        updated_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, enabled) => {
      toast({
        title: "Success",
        description: `Maintenance mode ${
          enabled ? "enabled" : "disabled"
        } successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["maintenanceMode"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create backup (simulate)
  const createBackup = useMutation({
    mutationFn: async (backupType: string) => {
      if (!schoolId) throw new Error("No school ID");

      const { data, error } = await supabase
        .from("audit_logs")
        .insert({
          school_id: schoolId,
          action: "backup",
          target_entity: "system",
          performed_by_role: user?.role || "unknown",
          performed_by_user_id: user?.id,
          metadata: {
            backup_type: backupType,
            file_name: `backup_${backupType}_${
              new Date().toISOString().split("T")[0]
            }.sql`,
            status: "completed",
          },
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Backup created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", schoolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (loadingStats || loadingMaintenance || loadingAudits) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system settings...</p>
        </div>
      </div>
    );
  }

  // Check permissions before rendering
  if (!canManageSystem) {
    return (
      <div className="p-8 text-center">
        <Alert className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only school directors and system administrators can
            manage system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration, maintenance mode, and monitoring
          </p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Statistics */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-xl font-bold">{systemStats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="text-xl font-bold">{systemStats.teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parents</p>
                  <p className="text-xl font-bold">{systemStats.parents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-xl font-bold">{systemStats.classes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-xl font-bold">{systemStats.subjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Examinations</p>
                  <p className="text-xl font-bold">
                    {systemStats.examinations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("general")}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          General
        </Button>
        <Button
          variant={activeTab === "maintenance" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("maintenance")}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-2" />
          Maintenance
        </Button>
        <Button
          variant={activeTab === "monitoring" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("monitoring")}
          className="flex-1"
        >
          <Database className="h-4 w-4 mr-2" />
          Monitoring
        </Button>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                General system configuration will be available in future
                updates. Contact support for advanced configuration options.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                When maintenance mode is enabled, only administrators can access
                the system. All other users will see a maintenance message.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Maintenance Mode</label>
                <p className="text-sm text-muted-foreground">
                  {maintenanceMode
                    ? "System is currently in maintenance mode"
                    : "System is currently accessible to all users"}
                </p>
              </div>
              <Switch
                checked={maintenanceMode || false}
                onCheckedChange={(checked) =>
                  toggleMaintenanceMode.mutate(checked)
                }
                disabled={toggleMaintenanceMode.isPending}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Before Maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Notify users in advance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">After Maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Disable maintenance mode
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Tab */}
      {activeTab === "monitoring" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Monitoring</CardTitle>
              <Button
                onClick={() => createBackup.mutate("full")}
                disabled={createBackup.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                Create Backup Log
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="font-medium">Recent System Events</label>
              {auditLogs?.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No recent events found
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()} •{" "}
                          {log.performed_by_role}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {log.target_entity || "system"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemSettings;
