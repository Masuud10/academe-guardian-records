import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlusCircle,
  MessageSquare,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import CreateSupportTicketForm from "../CreateSupportTicketForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  created_at: string;
  school_name?: string;
  creator_name?: string;
}

interface SupportTicketManagementProps {
  showCreateButton?: boolean;
  title?: string;
  description?: string;
}

const SupportTicketManagement: React.FC<SupportTicketManagementProps> = ({
  showCreateButton = true,
  title = "Support Center",
  description = "Manage all support tickets across the system.",
}) => {
  const { tickets, loading, error, refetch, updateTicketStatus } =
    useSupportTickets();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  const isAdmin = user?.role === "edufam_admin";

  // Filter tickets based on status and priority
  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch =
      statusFilter === "all" || ticket.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "resolved":
        return "outline";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "secondary";
      case "high":
        return "default";
      case "urgent":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    if (!isAdmin) return;

    setIsUpdating(ticketId);
    try {
      const { error } = await updateTicketStatus(ticketId, newStatus);
      if (error) {
        toast({
          title: "Error updating ticket",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ticket updated",
          description: "Ticket status updated successfully.",
        });
      }
    } finally {
      setIsUpdating(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2">Loading your tickets...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Tickets</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredTickets.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {tickets.length === 0
              ? "No Support Tickets Found"
              : "No tickets match your filters"}
          </h3>
          <p className="text-muted-foreground mt-1">
            {tickets.length === 0
              ? showCreateButton
                ? "Get started by creating your first support ticket."
                : "No tickets to display."
              : "Try adjusting your filters to see more tickets."}
          </p>
          {showCreateButton && tickets.length === 0 && (
            <Button
              className="mt-4"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Ticket
            </Button>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {isAdmin && <TableHead>School</TableHead>}
            {isAdmin && <TableHead>Created By</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.title}</TableCell>
              {isAdmin && <TableCell>{ticket.school_name || "N/A"}</TableCell>}
              {isAdmin && (
                <TableCell>{ticket.creator_name || "Unknown"}</TableCell>
              )}
              <TableCell>
                <Badge variant="outline">
                  {ticket.type?.replace("_", " ") || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityVariant(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(ticket.status)}>
                  {ticket.status?.replace("_", " ") || "Unknown"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(ticket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Dialog
                    open={selectedTicket?.id === ticket.id}
                    onOpenChange={(open) => !open && setSelectedTicket(null)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {selectedTicket?.id === ticket.id && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{selectedTicket.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            {isAdmin && (
                              <>
                                <div>
                                  <Label>School</Label>
                                  <p className="text-sm">
                                    {selectedTicket.school_name || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <Label>Created By</Label>
                                  <p className="text-sm">
                                    {selectedTicket.creator_name || "Unknown"}
                                  </p>
                                </div>
                              </>
                            )}
                            <div>
                              <Label>Type</Label>
                              <p className="text-sm">
                                {selectedTicket.type?.replace("_", " ") ||
                                  "Unknown"}
                              </p>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Badge
                                variant={getPriorityVariant(
                                  selectedTicket.priority
                                )}
                              >
                                {selectedTicket.priority}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-md">
                              {selectedTicket.description}
                            </p>
                          </div>
                          {isAdmin && (
                            <div>
                              <Label>Update Status</Label>
                              <Select
                                value={selectedTicket.status}
                                onValueChange={(value) =>
                                  handleStatusUpdate(selectedTicket.id, value)
                                }
                                disabled={isUpdating === selectedTicket.id}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="resolved">
                                    Resolved
                                  </SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {!isAdmin && (
                            <div>
                              <Label>Current Status</Label>
                              <Badge
                                variant={getStatusVariant(
                                  selectedTicket.status
                                )}
                                className="mt-2"
                              >
                                {selectedTicket.status?.replace("_", " ") ||
                                  "Unknown"}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                  {isAdmin && (
                    <Select
                      value={ticket.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(ticket.id, value)
                      }
                      disabled={isUpdating === ticket.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      {showCreateButton && (
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Ticket
          </Button>
        </div>
      )}

      <Card>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      {showCreateButton && (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create a New Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CreateSupportTicketForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetch();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SupportTicketManagement;
