import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Conversation {
  id: string;
  other_participant: {
    id: string;
    name: string;
    role: string;
  };
  last_message_preview?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onConversationCreated,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const searchUsers = async (term: string) => {
    if (!user || !term.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      // Use edge function for strict multi-tenant user listing
      const { data, error } = await supabase.functions.invoke(
        "get-school-users",
        {
          body: {
            search: term,
            limit: 10,
          },
        }
      );

      if (error) {
        console.error("Error searching users:", error);
        toast({
          title: "Error",
          description: "Failed to search users from your school",
          variant: "destructive",
        });
        return;
      }

      const users = data?.users || [];
      setUsers(users);

      console.log(
        `Found ${users.length} users in school for search: "${term}"`
      );
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  const handleCreateConversation = async (recipientId: string) => {
    if (!user || creating) return;

    setCreating(recipientId);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-conversation",
        {
          body: { recipient_id: recipientId },
        }
      );

      if (error) {
        console.error("Error creating conversation:", error);
        toast({
          title: "Error",
          description: "Failed to create conversation",
          variant: "destructive",
        });
        return;
      }

      // If conversation already exists or was created, get the full conversation data
      const { data: conversations, error: fetchError } =
        await supabase.functions.invoke("get-conversations");

      if (fetchError) {
        console.error("Error fetching conversations:", fetchError);
        return;
      }

      const newConversation = conversations.conversations.find(
        (conv: any) => conv.id === data.conversation_id
      );

      if (newConversation) {
        onConversationCreated(newConversation);
        toast({
          title: "Success",
          description: data.existing
            ? "Conversation opened"
            : "Conversation created",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setCreating(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "principal":
        return "bg-purple-100 text-purple-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "parent":
        return "bg-green-100 text-green-800";
      case "finance_officer":
        return "bg-orange-100 text-orange-800";
      case "school_director":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            New Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Users List */}
          {!loading && searchTerm && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No users found</p>
                  <p className="text-sm">Try searching with a different term</p>
                </div>
              ) : (
                users.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(selectedUser.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {selectedUser.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {selectedUser.email}
                          </p>
                          <span
                            className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getRoleColor(
                              selectedUser.role
                            )}`}
                          >
                            {selectedUser.role.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleCreateConversation(selectedUser.id)
                        }
                        disabled={creating === selectedUser.id}
                        size="sm"
                        className="ml-2"
                      >
                        {creating === selectedUser.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          "Chat"
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Initial State */}
          {!searchTerm && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Search for users to start a conversation</p>
              <p className="text-sm">You can search by name or email</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
