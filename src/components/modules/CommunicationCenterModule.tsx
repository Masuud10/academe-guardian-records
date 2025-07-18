import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Megaphone,
  Send,
  Archive,
  Eye,
  Users,
  Bell,
  Filter,
  Search,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Trash2,
} from "lucide-react";
import {
  useEnhancedAnnouncements,
  AnnouncementFilters,
} from "@/hooks/useEnhancedAnnouncements";
import { useAdminCommunications } from "@/hooks/useAdminCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import BroadcastAnnouncementDialog from "./communication/BroadcastAnnouncementDialog";
import AnnouncementFiltersComponent from "./communication/AnnouncementFilters";
import AnnouncementsList from "./communication/AnnouncementsList";
import AnnouncementMetrics from "./communication/AnnouncementMetrics";
import AnnouncementQuickActions from "./communication/AnnouncementQuickActions";

const CommunicationCenterModule = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<AnnouncementFilters>({
    is_archived: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // PHASE 3: Admin Communications state
  const [isAdminCommCreateOpen, setIsAdminCommCreateOpen] = useState(false);
  const [adminCommForm, setAdminCommForm] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    target_roles: [] as string[],
    expires_at: "",
    dismissible: true,
  });

  const {
    announcements,
    loading,
    error,
    createBroadcastAnnouncement,
    markAsRead,
    archiveAnnouncement,
    refetch,
  } = useEnhancedAnnouncements(filters);

  // PHASE 3: Admin Communications hook
  const {
    communications: adminCommunications,
    allCommunications,
    stats: commStats,
    isLoading: commLoading,
    createCommunication,
    updateCommunication,
    deleteCommunication,
  } = useAdminCommunications();

  const canCreateBroadcast =
    user?.role && ["edufam_admin", "elimisha_admin"].includes(user.role);

  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const activeAnnouncements = filteredAnnouncements.filter(
    (a) => !a.is_archived
  );
  const archivedAnnouncements = filteredAnnouncements.filter(
    (a) => a.is_archived
  );
  const urgentAnnouncements = activeAnnouncements.filter(
    (a) => a.priority === "urgent"
  );

  const averageEngagement =
    announcements.length > 0
      ? Math.round(
          announcements.reduce((sum, a) => {
            const rate =
              a.total_recipients > 0
                ? (a.read_count / a.total_recipients) * 100
                : 0;
            return sum + rate;
          }, 0) / announcements.length
        )
      : 0;

  const handleCreateBroadcast = async (announcementData: any) => {
    const { error } = await createBroadcastAnnouncement(announcementData);

    if (!error) {
      toast({
        title: "Success",
        description: "Broadcast announcement sent successfully",
      });
      setIsCreateOpen(false);
    } else {
      toast({
        title: "Error",
        description: "Failed to send broadcast announcement",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Communication data has been updated",
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality coming soon",
    });
  };

  const handleBulkArchive = () => {
    // TODO: Implement bulk archive functionality
    toast({
      title: "Bulk Archive",
      description: "Bulk archive functionality coming soon",
    });
  };

  // PHASE 3: Admin Communication handlers
  const handleCreateAdminComm = async () => {
    if (
      !adminCommForm.title ||
      !adminCommForm.message ||
      adminCommForm.target_roles.length === 0
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCommunication({
      title: adminCommForm.title,
      message: adminCommForm.message,
      priority: adminCommForm.priority,
      target_roles: adminCommForm.target_roles,
      expires_at: adminCommForm.expires_at || undefined,
      dismissible: adminCommForm.dismissible,
    });

    // Reset form
    setAdminCommForm({
      title: "",
      message: "",
      priority: "medium",
      target_roles: [],
      expires_at: "",
      dismissible: true,
    });
    setIsAdminCommCreateOpen(false);
  };

  const handleDeleteAdminComm = (commId: string) => {
    deleteCommunication(commId);
  };

  const handleRoleToggle = (role: string) => {
    setAdminCommForm((prev) => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter((r) => r !== role)
        : [...prev.target_roles, role],
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const availableRoles = [
    "school_director",
    "principal",
    "teacher",
    "parent",
    "finance_officer",
    "edufam_admin",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading communication center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            EduFam Communication Center
          </h1>
          <p className="text-muted-foreground">
            Broadcast updates and manage communications across all schools
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {canCreateBroadcast && (
            <BroadcastAnnouncementDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              onSubmit={handleCreateBroadcast}
            >
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Send className="w-4 h-4 mr-2" />
                Create Broadcast
              </Button>
            </BroadcastAnnouncementDialog>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <AnnouncementMetrics announcements={announcements} />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Announcements ({activeAnnouncements.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archived ({archivedAnnouncements.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search announcements by title, content, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <AnnouncementFiltersComponent
              filters={filters}
              onFiltersChange={(newFilters) =>
                setFilters({ ...newFilters, is_archived: false })
              }
            />
          </div>

          <AnnouncementsList
            announcements={activeAnnouncements}
            onMarkAsRead={markAsRead}
            onArchive={archiveAnnouncement}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search archived announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <AnnouncementFiltersComponent
              filters={filters}
              onFiltersChange={(newFilters) =>
                setFilters({ ...newFilters, is_archived: true })
              }
            />
          </div>

          <AnnouncementsList
            announcements={archivedAnnouncements}
            onMarkAsRead={markAsRead}
            onArchive={archiveAnnouncement}
            getPriorityColor={getPriorityColor}
            isArchived={true}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Recipients
                    </span>
                    <span className="font-semibold">
                      {announcements
                        .reduce((sum, a) => sum + a.total_recipients, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Reads
                    </span>
                    <span className="font-semibold text-green-600">
                      {announcements
                        .reduce((sum, a) => sum + a.read_count, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Average Read Rate
                    </span>
                    <span className="font-semibold text-purple-600">
                      {announcements.length > 0
                        ? Math.round(
                            (announcements.reduce(
                              (sum, a) => sum + a.read_count,
                              0
                            ) /
                              announcements.reduce(
                                (sum, a) => sum + a.total_recipients,
                                0
                              )) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["urgent", "high", "medium", "low"].map((priority) => {
                    const count = announcements.filter(
                      (a) => a.priority === priority && !a.is_archived
                    ).length;
                    const percentage =
                      announcements.length > 0
                        ? (count /
                            announcements.filter((a) => !a.is_archived)
                              .length) *
                          100
                        : 0;

                    return (
                      <div key={priority} className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            priority
                          )}`}
                        ></div>
                        <span className="text-sm capitalize flex-1">
                          {priority}
                        </span>
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground w-12">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {announcements.filter((a) => !a.is_archived).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Active Announcements
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {
                        announcements.filter(
                          (a) => a.priority === "urgent" && !a.is_archived
                        ).length
                      }
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Urgent Messages
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {announcements.filter((a) => a.is_global).length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Global Broadcasts
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {announcements.filter((a) => a.is_archived).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Archived</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenterModule;
