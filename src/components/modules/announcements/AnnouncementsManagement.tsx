import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Send, Eye, Archive } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const AnnouncementsManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_audience: [] as string[],
    priority: "medium",
    is_global: true,
    expiry_date: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("announcements").insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("announcements")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setEditingAnnouncement(null);
      resetForm();
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_audience: [],
      priority: "medium",
      is_global: true,
      expiry_date: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    const data = {
      ...formData,
      target_audience:
        formData.target_audience.length > 0
          ? formData.target_audience
          : ["all"],
      expiry_date: formData.expiry_date || null,
    };

    if (editingAnnouncement) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncement.id, data });
    } else {
      createAnnouncementMutation.mutate(data);
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience || [],
      priority: announcement.priority,
      is_global: announcement.is_global,
      expiry_date: announcement.expiry_date || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleAudienceChange = (role: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        target_audience: [...prev.target_audience, role],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        target_audience: prev.target_audience.filter((r) => r !== role),
      }));
    }
  };

  const roleOptions = [
    { value: "all", label: "All Users" },
    { value: "principal", label: "Principals" },
    { value: "teacher", label: "Teachers" },
    { value: "parent", label: "Parents" },
    { value: "school_director", label: "School Directors" },
    { value: "finance_officer", label: "Finance Officers" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Communication Center
          </h2>
          <p className="text-muted-foreground">
            Create and manage system-wide announcements
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingAnnouncement(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Create New Announcement"}
              </DialogTitle>
              <DialogDescription>
                Create announcements that will be visible to selected user
                groups.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Announcement content"
                  rows={4}
                />
              </div>

              <div>
                <Label>Target Audience</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {roleOptions.map((role) => (
                    <div
                      key={role.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={role.value}
                        checked={formData.target_audience.includes(role.value)}
                        onCheckedChange={(checked) =>
                          handleAudienceChange(role.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={role.value} className="text-sm">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        expiry_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_global"
                  checked={formData.is_global}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_global: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="is_global">
                  Global Announcement (visible to all schools)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                  setEditingAnnouncement(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createAnnouncementMutation.isPending ||
                  updateAnnouncementMutation.isPending
                }
              >
                {createAnnouncementMutation.isPending ||
                updateAnnouncementMutation.isPending
                  ? "Saving..."
                  : editingAnnouncement
                  ? "Update Announcement"
                  : "Create Announcement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Loading announcements...
              </p>
            </CardContent>
          </Card>
        ) : announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {announcement.title}
                      <Badge
                        variant={
                          announcement.priority === "critical"
                            ? "destructive"
                            : announcement.priority === "high"
                            ? "default"
                            : announcement.priority === "medium"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                      {announcement.is_global && (
                        <Badge variant="outline">Global</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(announcement.created_at).toLocaleDateString()}
                      {announcement.expiry_date && (
                        <>
                          {" "}
                          • Expires:{" "}
                          {new Date(
                            announcement.expiry_date
                          ).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this announcement?"
                          )
                        ) {
                          deleteAnnouncementMutation.mutate(announcement.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{announcement.content}</p>
                {announcement.target_audience &&
                  announcement.target_audience.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        Target audience:
                      </p>
                      <div className="flex gap-1 mt-1">
                        {announcement.target_audience.map((role: string) => (
                          <Badge
                            key={role}
                            variant="outline"
                            className="text-xs"
                          >
                            {roleOptions.find((r) => r.value === role)?.label ||
                              role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No announcements created yet. Click "New Announcement" to get
                started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsManagement;
