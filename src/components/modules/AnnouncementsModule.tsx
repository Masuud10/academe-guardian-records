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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Megaphone, Calendar, User } from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import CommunicationCenterModule from "./CommunicationCenterModule";

const AnnouncementsModule = () => {
  const { announcements, loading, createAnnouncement } = useAnnouncements();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    target_audience: [] as string[],
    expiry_date: "",
    is_global: false,
  });

  const canCreateAnnouncement =
    user?.role &&
    ["principal", "school_director", "edufam_admin"].includes(user.role);
  const isEduFamAdmin = user?.role === "edufam_admin";

  // If user is EduFam admin, show the Communication Center instead
  if (isEduFamAdmin) {
    return <CommunicationCenterModule />;
  }

  const getAudienceOptions = () => {
    if (user?.role === "edufam_admin") {
      return ["principals", "school_directors", "parents", "teachers"];
    }
    if (user?.role === "principal") {
      return ["teachers", "parents"];
    }
    if (user?.role === "school_director") {
      return ["principals", "teachers", "parents"];
    }
    return [];
  };

  const handleCreateAnnouncement = async () => {
    if (
      !newAnnouncement.title ||
      !newAnnouncement.content ||
      newAnnouncement.target_audience.length === 0
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const { error } = await createAnnouncement({
      ...newAnnouncement,
      is_global: user?.role === "edufam_admin",
    });

    if (!error) {
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
      setIsCreateOpen(false);
      setNewAnnouncement({
        title: "",
        content: "",
        target_audience: [],
        expiry_date: "",
        is_global: false,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handleAudienceChange = (value: string) => {
    if (!newAnnouncement.target_audience.includes(value)) {
      setNewAnnouncement((prev) => ({
        ...prev,
        target_audience: [...prev.target_audience, value],
      }));
    }
  };

  const removeAudience = (audience: string) => {
    setNewAnnouncement((prev) => ({
      ...prev,
      target_audience: prev.target_audience.filter((a) => a !== audience),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-muted-foreground">Manage and view announcements</p>
        </div>

        <div className="flex gap-2">
          {canCreateAnnouncement && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title
                    </label>
                    <Input
                      value={newAnnouncement.title}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter announcement title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Content
                    </label>
                    <Textarea
                      value={newAnnouncement.content}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="Enter announcement content"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Target Audience
                    </label>
                    <Select onValueChange={handleAudienceChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAudienceOptions().map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience.charAt(0).toUpperCase() +
                              audience.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newAnnouncement.target_audience.map((audience) => (
                        <Badge
                          key={audience}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeAudience(audience)}
                        >
                          {audience} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Expiry Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={newAnnouncement.expiry_date}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          expiry_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAnnouncement}>
                      Create Announcement
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-muted-foreground">
                There are no announcements to display.
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {announcement.creator_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {announcement.is_global && (
                    <Badge variant="outline" className="ml-2">
                      Global
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{announcement.content}</p>
                <div className="flex flex-wrap gap-2">
                  {announcement.target_audience.map((audience) => (
                    <Badge key={audience} variant="secondary">
                      {audience}
                    </Badge>
                  ))}
                </div>
                {announcement.expiry_date && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Expires:{" "}
                    {new Date(announcement.expiry_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsModule;
