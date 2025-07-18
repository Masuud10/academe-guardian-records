import React, { useState, useEffect } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import {
  Headphones,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Eye,
  FileText,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at?: string;
  user_id?: string;
  school_id: string;
  assigned_to?: string;
  resolution?: string;
  type?: string;
  resolved_at?: string;
  created_by?: string;
  attachments?: string[];
}

const SchoolOwnerSupportModule: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newTicket, setNewTicket] = useState<{
    title: string;
    description: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
  }>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["school-director-support-tickets", user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return [];

      // @ts-ignore - Deep type instantiation issue with Supabase
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error loading support tickets:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id && !!schoolId && ['school_director', 'principal', 'hr'].includes(user.role),
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: typeof newTicket) => {
      if (!user?.id || !schoolId) throw new Error("User or school not found");

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority,
          status: "open",
          user_id: user.id,
          school_id: schoolId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["school-owner-support-tickets"],
      });
      setIsCreateDialogOpen(false);
      setNewTicket({
        title: "",
        description: "",
        category: "",
        priority: "medium",
      });
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(newTicket);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const categories = [
    "Technical Issue",
    "Account Access",
    "Data Management",
    "Feature Request",
    "Billing Question",
    "General Inquiry",
    "Bug Report",
    "Training Request",
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load support tickets. Please try again later.
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Headphones className="h-8 w-8 text-blue-600" />
            Support Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Submit and track support tickets for your school
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title *
                </label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.title}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category *
                </label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) =>
                    setNewTicket({ ...newTicket, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Priority
                </label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => 
                    setNewTicket({ ...newTicket, priority: value as "low" | "medium" | "high" | "urgent" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description *
                </label>
                <Textarea
                  placeholder="Please provide detailed information about your issue..."
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTicket}
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t) => t.status === "open").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t) => t.status === "in_progress").length ||
                    0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">
                  {tickets?.filter((t) => t.status === "resolved").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Loading tickets...</span>
            </div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Headphones className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
              <p>You haven't submitted any support tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.title}</h3>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority.charAt(0).toUpperCase() +
                              ticket.priority.slice(1)}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status
                              .replace("_", " ")
                              .charAt(0)
                              .toUpperCase() +
                              ticket.status.replace("_", " ").slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {ticket.description.length > 100
                            ? `${ticket.description.substring(0, 100)}...`
                            : ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Category: {ticket.category}</span>
                          <span>Created: {formatDate(ticket.created_at)}</span>
                          {ticket.resolved_at && ticket.resolved_at !== ticket.created_at && (
                            <span>
                              Updated: {formatDate(ticket.resolved_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <Dialog
                        open={
                          isViewDialogOpen && selectedTicket?.id === ticket.id
                        }
                        onOpenChange={(open) => {
                          setIsViewDialogOpen(open);
                            if (open) setSelectedTicket({
                              ...ticket,
                              updated_at: ticket.resolved_at || ticket.created_at,
                              user_id: ticket.created_by || user?.id || '',
                              priority: ticket.priority as "low" | "medium" | "high" | "urgent",
                              status: ticket.status as "open" | "in_progress" | "resolved" | "closed",
                              resolution: ''
                            });
                           else setSelectedTicket(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Support Ticket Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Title
                              </label>
                              <p className="text-sm">{ticket.title}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Category
                              </label>
                              <p className="text-sm">{ticket.category}</p>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Priority
                              </label>
                              <Badge
                                className={getPriorityColor(ticket.priority)}
                              >
                                {ticket.priority.charAt(0).toUpperCase() +
                                  ticket.priority.slice(1)}
                              </Badge>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Status
                              </label>
                              <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status
                                  .replace("_", " ")
                                  .charAt(0)
                                  .toUpperCase() +
                                  ticket.status.replace("_", " ").slice(1)}
                              </Badge>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-2 block">
                                Description
                              </label>
                              <p className="text-sm whitespace-pre-wrap">
                                {ticket.description}
                              </p>
                            </div>

                            {selectedTicket?.resolution && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Resolution
                                </label>
                                <p className="text-sm whitespace-pre-wrap">
                                  {selectedTicket.resolution}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                Created: {formatDate(ticket.created_at)}
                              </span>
                              <span>
                                Updated: {formatDate(ticket.resolved_at || ticket.created_at)}
                              </span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolOwnerSupportModule;
