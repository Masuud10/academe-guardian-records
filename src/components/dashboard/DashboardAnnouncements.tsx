import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, AlertCircle } from "lucide-react";
import { useEnhancedAnnouncements } from "@/hooks/useEnhancedAnnouncements";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const DashboardAnnouncements = () => {
  const { user } = useAuth();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Get announcements with error handling
  const { announcements, markAsRead, loading, error } =
    useEnhancedAnnouncements({
      is_archived: false,
    });

  // Only show for school users
  if (!user) {
    return null;
  }

  // Wait for announcements to load
  if (loading) {
    return null;
  }

  // Handle errors gracefully
  if (error) {
    console.warn(
      "🔔 DashboardAnnouncements: Error loading announcements:",
      error
    );
    return null;
  }

  // Safely filter announcements with better error handling
  const relevantAnnouncements = (announcements || []).filter((announcement) => {
    try {
      // Check basic requirements
      if (
        !announcement ||
        !announcement.is_global ||
        announcement.is_archived
      ) {
        return false;
      }

      // Check if dismissed
      if (dismissedIds.includes(announcement.id)) {
        return false;
      }

      // Check target audience safely
      const targetAudience = Array.isArray(announcement.target_audience)
        ? announcement.target_audience
        : [];

      if (targetAudience.length === 0) {
        return false;
      }

      // Map user role to target audience format with fallbacks
      let userRole = user.role;

      // Convert role to target audience format
      switch (user.role) {
        case "school_director":
          userRole = "school_directors";
          break;
        case "principal":
          userRole = "principals";
          break;
        case "teacher":
          userRole = "teachers";
          break;
        case "parent":
          userRole = "parents";
          break;
        case "finance_officer":
          userRole = "finance_officers";
          break;
        default:
          userRole = user.role;
      }

      return targetAudience.includes(userRole);
    } catch (error) {
      console.warn(
        "🔔 DashboardAnnouncements: Error filtering announcement:",
        error
      );
      return false;
    }
  });

  const handleDismiss = async (announcementId: string) => {
    try {
      // Dismiss locally first for immediate UI feedback
      setDismissedIds((prev) => [...prev, announcementId]);

      // Mark as read in database
      if (markAsRead) {
        await markAsRead(announcementId);
      }
    } catch (error) {
      console.warn(
        "🔔 DashboardAnnouncements: Error dismissing announcement:",
        error
      );
      // Keep local dismissal even if database update fails
    }
  };

  if (relevantAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {relevantAnnouncements.map((announcement) => (
        <Card
          key={announcement.id}
          className="border-l-4 border-l-blue-500 bg-gradient-to-r from-yellow-50 via-green-50 to-blue-50 shadow-md"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {announcement.priority === "urgent" ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {announcement.title || "Untitled"}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                      System
                    </span>
                    {announcement.priority === "urgent" && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {announcement.content || "No content"}
                  </p>

                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      {announcement.created_at
                        ? format(
                            new Date(announcement.created_at),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "Unknown date"}
                    </span>
                    {announcement.expiry_date && (
                      <span className="ml-4">
                        Expires:{" "}
                        {format(
                          new Date(announcement.expiry_date),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardAnnouncements;
