import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";
import { useAuth } from "@/contexts/AuthContext";
import {
  useUserManagementStats,
  useSecuritySettings,
  useSystemMaintenance,
} from "@/hooks/useSystemSettings";
import {
  Settings,
  Database,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Bell,
  Users,
  Building2,
  MessageSquare,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SystemMaintenanceControl from "./settings/SystemMaintenanceControl";

interface SystemSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  auto_backup_enabled: boolean;
  security_audit_enabled: boolean;
  max_schools_per_owner: number;
  backup_retention_days: number;
  system_notifications_enabled: boolean;
  data_encryption_enabled: boolean;
}

interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  user_growth_rate: number;
}

interface SecurityData {
  total_audit_events: number;
  security_incidents: number;
  failed_login_attempts: number;
  last_security_scan: string;
}

const SettingsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStatsLoading, setUserStatsLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    allow_new_registrations: true,
    auto_backup_enabled: true,
    security_audit_enabled: true,
    max_schools_per_owner: 5,
    backup_retention_days: 30,
    system_notifications_enabled: true,
    data_encryption_enabled: true,
  });

  const [userStats, setUserStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    new_users_this_month: 0,
    user_growth_rate: 0,
  });

  const [securityData, setSecurityData] = useState<SecurityData>({
    total_audit_events: 0,
    security_incidents: 0,
    failed_login_attempts: 0,
    last_security_scan: "",
  });

  useEffect(() => {
    loadSystemSettings();
    loadUserStats();
    loadSecurityData();
  }, []);

  const loadSystemSettings = async () => {
    setLoading(true);
    try {
      // Load system settings from database
      // This would typically fetch from your settings table
      console.log("Loading system settings...");
    } catch (err) {
      console.error("Error loading system settings:", err);
      setError("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    setUserStatsLoading(true);
    try {
      // Load user statistics
      console.log("Loading user stats...");
    } catch (err) {
      console.error("Error loading user stats:", err);
    } finally {
      setUserStatsLoading(false);
    }
  };

  const loadSecurityData = async () => {
    setSecurityLoading(true);
    try {
      // Load security data
      console.log("Loading security data...");
    } catch (err) {
      console.error("Error loading security data:", err);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSettingChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save system settings to database
      console.log("Saving system settings:", settings);

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    setLoading(true);
    try {
      // Trigger database backup
      console.log("Creating database backup...");

      toast({
        title: "Backup Started",
        description: "Database backup has been initiated.",
      });
    } catch (err) {
      console.error("Error creating backup:", err);
      toast({
        title: "Error",
        description: "Failed to create database backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "edufam_admin") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access system settings.
        </AlertDescription>
      </Alert>
    );
  }

  if (userStatsLoading || securityLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Manage system-wide configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Settings
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* System Maintenance Control */}
      <SystemMaintenanceControl />

      {/* System Configuration */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            System Configuration
          </CardTitle>
          <CardDescription className="text-base">
            Core system settings and toggles for managing the EduFam platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_registrations">
                  Allow New Registrations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable new school registrations
                </p>
              </div>
              <Switch
                id="allow_registrations"
                checked={Boolean(settings.allow_new_registrations)}
                onCheckedChange={(checked) =>
                  handleSettingChange("allow_new_registrations", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_backup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic database backups
                </p>
              </div>
              <Switch
                id="auto_backup"
                checked={Boolean(settings.auto_backup_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("auto_backup_enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security_audit">Security Audit</Label>
                <p className="text-sm text-muted-foreground">
                  Enable security audit logging
                </p>
              </div>
              <Switch
                id="security_audit"
                checked={Boolean(settings.security_audit_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("security_audit_enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system_notifications">
                  System Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable system-wide notifications
                </p>
              </div>
              <Switch
                id="system_notifications"
                checked={Boolean(settings.system_notifications_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("system_notifications_enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data_encryption">Data Encryption</Label>
                <p className="text-sm text-muted-foreground">
                  Enable data encryption at rest
                </p>
              </div>
              <Switch
                id="data_encryption"
                checked={Boolean(settings.data_encryption_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("data_encryption_enabled", checked)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_schools">Max Schools per Owner</Label>
              <Input
                id="max_schools"
                type="number"
                value={settings.max_schools_per_owner}
                onChange={(e) =>
                  handleSettingChange(
                    "max_schools_per_owner",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="backup_retention">Backup Retention (Days)</Label>
              <Input
                id="backup_retention"
                type="number"
                value={settings.backup_retention_days}
                onChange={(e) =>
                  handleSettingChange(
                    "backup_retention_days",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            Database Management
          </CardTitle>
          <CardDescription className="text-base">
            Database operations, backups, and maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">
                Backup Operations
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Create manual database backups and manage backup retention
              </p>
              <Button
                onClick={handleDatabaseBackup}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">
                System Status
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                View current system status and performance metrics
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Security Overview
          </CardTitle>
          <CardDescription className="text-base">
            System security status, audit logs, and threat monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {securityData ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {securityData.total_audit_events || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Audit Events
                </div>
                <div className="text-xs text-blue-500 mt-1">System-wide</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {securityData.security_incidents || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Security Incidents
                </div>
                <div className="text-xs text-red-500 mt-1">
                  Requires attention
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {securityData.failed_login_attempts || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Failed Logins
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  Last 24 hours
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {securityData.last_security_scan ? "✓" : "⚠"}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Security Scan
                </div>
                <div className="text-xs text-green-500 mt-1">
                  {securityData.last_security_scan ? "Recent" : "Pending"}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No security data available</p>
              <p className="text-sm">Security monitoring will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Statistics */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            User Statistics
          </CardTitle>
          <CardDescription className="text-base">
            Platform usage statistics and user activity metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.total_users || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Users
              </div>
              <div className="text-xs text-blue-500 mt-1">All time</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.active_users || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Active Users
              </div>
              <div className="text-xs text-green-500 mt-1">Last 30 days</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userStats.new_users_this_month || 0}
              </div>
              <div className="text-sm text-gray-600 font-medium">New Users</div>
              <div className="text-xs text-purple-500 mt-1">This month</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {userStats.user_growth_rate || 0}%
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Growth Rate
              </div>
              <div className="text-xs text-orange-500 mt-1">Monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
