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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Lock,
  Unlock,
  Shield,
  Eye,
} from "lucide-react";
import { AuthUser } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface HRUserManagementModuleProps {
  user: AuthUser;
}

interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: string;
  school_id: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  permissions: string[];
}

const HRUserManagementModule: React.FC<HRUserManagementModuleProps> = ({
  user,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const userRoles = [
    "principal",
    "teacher",
    "finance_officer",
    "parent",
    "school_director",
    "hr",
  ];

  // Fetch system users with multi-tenant isolation
  const {
    data: systemUsers,
    isLoading,
    refetch,
  } = useQuery<SystemUser[]>({
    queryKey: ["hr-users", user.school_id],
    queryFn: async () => {
      if (!user.school_id) {
        throw new Error("No school access");
      }

      // Get all profiles for the school
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          name,
          role,
          school_id,
          created_at,
          updated_at
        `
        )
        .eq("school_id", user.school_id)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get support staff data for additional user info
      const { data: supportStaff, error: staffError } = await supabase
        .from("support_staff")
        .select(
          "id, employee_id, full_name, role_title, phone, email, is_active"
        )
        .eq("school_id", user.school_id);

      if (staffError) throw staffError;

      // Merge profile and support staff data
      return (profiles || []).map((profile: any) => {
        const staffInfo = supportStaff?.find(
          (staff) => staff.email === profile.email
        );

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name || staffInfo?.full_name || "Unnamed User",
          role: profile.role,
          school_id: profile.school_id,
          is_active: staffInfo?.is_active ?? true,
          last_login: null, // Would come from auth logs in real implementation
          created_at: profile.created_at,
          permissions: getRolePermissions(profile.role),
        };
      }) as SystemUser[];
    },
    enabled: !!user.school_id,
  });

  const getRolePermissions = (role: string): string[] => {
    const rolePermissions = {
      principal: ["all"],
      teacher: ["read", "write_own", "grade"],
      finance_officer: ["read", "financial_write"],
      parent: ["read_own_child"],
      school_director: ["all"],
      hr: ["read", "user_management", "staff_management"],
    };
    return rolePermissions[role as keyof typeof rolePermissions] || ["read"];
  };

  // Calculate user summary
  const userSummary = React.useMemo(() => {
    if (!systemUsers) return null;

    const summary = systemUsers.reduce(
      (acc, user) => {
        acc.totalUsers++;
        if (user.is_active) acc.activeUsers++;
        if (!acc.roleCount[user.role]) acc.roleCount[user.role] = 0;
        acc.roleCount[user.role]++;
        return acc;
      },
      {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        roleCount: {} as Record<string, number>,
      }
    );

    summary.inactiveUsers = summary.totalUsers - summary.activeUsers;
    return summary;
  }, [systemUsers]);

  // Filter users
  const filteredUsers =
    systemUsers?.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    }) || [];

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    try {
      // In real implementation, this would update user status
      toast({
        title: "User Status Updated",
        description: `User has been ${
          currentStatus ? "deactivated" : "activated"
        }.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      principal: "bg-purple-100 text-purple-800",
      teacher: "bg-blue-100 text-blue-800",
      finance_officer: "bg-green-100 text-green-800",
      parent: "bg-orange-100 text-orange-800",
      school_director: "bg-red-100 text-red-800",
      hr: "bg-pink-100 text-pink-800",
    };
    return (
      roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Permissions
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">
                  {userSummary?.totalUsers || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {userSummary?.activeUsers || 0}
                </p>
              </div>
              <Unlock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive Users
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {userSummary?.inactiveUsers || 0}
                </p>
              </div>
              <Lock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Roles
                </p>
                <p className="text-2xl font-bold">
                  {Object.keys(userSummary?.roleCount || {}).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {user.name || "Unnamed User"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role.replace("_", " ")}
                        </Badge>
                        <Badge className={getStatusBadge(user.is_active)}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined:{" "}
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {}}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {}}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleUserStatus(user.id, user.is_active)
                      }
                    >
                      {user.is_active ? (
                        <Lock className="h-4 w-4 mr-1" />
                      ) : (
                        <Unlock className="h-4 w-4 mr-1" />
                      )}
                      {user.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No system users available"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRUserManagementModule;
