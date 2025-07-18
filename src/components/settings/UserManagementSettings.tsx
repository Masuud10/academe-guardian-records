import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserManagementStats } from "@/hooks/useSystemSettings";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";

const UserManagementSettings: React.FC = () => {
  const { toast } = useToast();
  const { data: userStats, isLoading, error } = useUserManagementStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  // Mock user data for demonstration
  const [recentUsers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john@school.edu",
      role: "principal",
      status: "active",
      lastLogin: "2024-06-30",
      school: "Greenfield High",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@school.edu",
      role: "teacher",
      status: "active",
      lastLogin: "2024-06-29",
      school: "Greenfield High",
    },
    {
      id: 3,
      name: "Mike Brown",
      email: "mike@parent.com",
      role: "parent",
      status: "active",
      lastLogin: "2024-06-28",
      school: "Various",
    },
    {
      id: 4,
      name: "Lisa Davis",
      email: "lisa@finance.edu",
      role: "finance_officer",
      status: "active",
      lastLogin: "2024-06-27",
      school: "Central Academy",
    },
    {
      id: 5,
      name: "Tom Wilson",
      email: "tom@owner.com",
      role: "school_director",
      status: "pending",
      lastLogin: "Never",
      school: "Wilson Academy",
    },
  ]);

  const handleUserAction = (action: string, userId: number) => {
    toast({
      title: "User Action",
      description: `User ${action} action performed successfully.`,
    });
  };

  const getRoleColor = (role: string) => {
    const colors = {
      edufam_admin: "bg-red-100 text-red-800",
      school_director: "bg-purple-100 text-purple-800",
      principal: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      parent: "bg-yellow-100 text-yellow-800",
      finance_officer: "bg-indigo-100 text-indigo-800",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
          <p>Loading user management data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      </div>

      {/* User Statistics */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            User Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-3xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-3xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-3xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700 mt-1">Recent Signups</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-3xl font-bold text-orange-900">
                {Object.keys(userStats?.users_by_role || {}).length}
              </div>
              <p className="text-sm text-orange-700 mt-1">User Roles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Roles Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(userStats?.users_by_role || {}).map(
              ([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium capitalize">
                      {role.replace("_", " ")}
                    </span>
                  </div>
                  <Badge className={getRoleColor(role)}>
                    {count as number}
                  </Badge>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* User Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search_users">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search_users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or school..."
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filter_role">Filter by Role</Label>
              <select
                id="filter_role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="principal">Principal</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="finance_officer">Finance Officer</option>
                <option value="school_director">School Director</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="bg-green-600 hover:bg-green-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{user.school}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {user.lastLogin}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserAction("manage", user.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSettings;
