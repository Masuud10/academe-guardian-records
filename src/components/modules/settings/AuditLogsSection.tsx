import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Filter, Calendar, User, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  target_entity: string;
  performed_by_role: string;
  created_at: string;
  metadata: any;
  performed_by_user_id: string;
}

const AuditLogsSection = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [userRole, setUserRole] = useState("all");
  const [activityType, setActivityType] = useState("all");

  const {
    data: auditLogs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs", dateFrom, dateTo, userRole, activityType],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }
      if (dateTo) {
        query = query.lte("created_at", dateTo + "T23:59:59");
      }
      if (userRole !== "all") {
        query = query.eq("performed_by_role", userRole);
      }
      if (activityType !== "all") {
        query = query.ilike("action", `%${activityType}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    },
  });

  const handleApplyFilters = () => {
    refetch();
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("create") || action.includes("insert"))
      return "default";
    if (action.includes("update") || action.includes("modify"))
      return "secondary";
    if (action.includes("delete") || action.includes("remove"))
      return "destructive";
    return "outline";
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role === "edufam_admin" || role === "elimisha_admin") return "default";
    if (role === "principal" || role === "school_director") return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Audit Logs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <Label htmlFor="date-from">From Date</Label>
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to">To Date</Label>
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>User Role</Label>
            <Select value={userRole} onValueChange={setUserRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="edufam_admin">EduFam Admin</SelectItem>
                <SelectItem value="elimisha_admin">Elimisha Admin</SelectItem>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="school_director">School Director</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="finance_officer">Finance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleApplyFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Apply Filters
        </Button>

        {/* Audit Logs List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Activity</h4>
            <Badge variant="outline">{auditLogs?.length || 0} records</Badge>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="space-y-2 p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Loading audit logs...
                  </div>
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                        {log.target_entity && (
                          <span className="text-sm text-muted-foreground">
                            on {log.target_entity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" />
                        <Badge
                          variant={getRoleBadgeVariant(log.performed_by_role)}
                          className="text-xs"
                        >
                          {log.performed_by_role}
                        </Badge>
                        <Calendar className="w-3 h-3 ml-2" />
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm")}
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <code>{JSON.stringify(log.metadata, null, 2)}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No audit logs found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogsSection;
