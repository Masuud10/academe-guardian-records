import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Expense } from "@/services/expensesService";

const SchoolDirectorExpenseApproval: React.FC = () => {
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { getPendingExpenses, approveExpense, rejectExpense } = useExpenses();
  const { toast } = useToast();
  const { user } = useAuth();

  // Only allow school directors, principals, and school owners
  const hasApprovalAccess =
    user && ["school_director", "principal"].includes(user.role);

  useEffect(() => {
    if (hasApprovalAccess) {
      loadPendingExpenses();
    }
  }, [hasApprovalAccess]);

  const loadPendingExpenses = async () => {
    try {
      setLoading(true);
      const expenses = await getPendingExpenses();
      setPendingExpenses(expenses);
    } catch (error) {
      console.error("Error loading pending expenses:", error);
      toast({
        title: "Error",
        description: "Failed to load pending expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: string) => {
    try {
      await approveExpense(expenseId);
      setPendingExpenses((prev) =>
        prev.filter((expense) => expense.id !== expenseId)
      );
      toast({
        title: "Success",
        description: "Expense approved successfully",
      });
    } catch (error) {
      console.error("Error approving expense:", error);
      toast({
        title: "Error",
        description: "Failed to approve expense",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedExpenseId || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await rejectExpense(selectedExpenseId, rejectionReason);
      setPendingExpenses((prev) =>
        prev.filter((expense) => expense.id !== selectedExpenseId)
      );
      setRejectDialogOpen(false);
      setRejectionReason("");
      setSelectedExpenseId(null);
      toast({
        title: "Success",
        description: "Expense rejected successfully",
      });
    } catch (error) {
      console.error("Error rejecting expense:", error);
      toast({
        title: "Error",
        description: "Failed to reject expense",
        variant: "destructive",
      });
    }
  };

  const openRejectDialog = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setRejectDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (!hasApprovalAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Only school directors, principals, and school owners can approve
            expenses.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Expense Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading pending expenses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Expense Approvals
        </CardTitle>
        <CardDescription>
          Review and approve expense requests from your finance team
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingExpenses.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No pending expense approvals
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingExpenses.map((expense) => (
              <div
                key={expense.id}
                className="border rounded-lg p-4 space-y-3 bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expense.title}</h3>
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-600"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium text-lg">
                          {formatCurrency(expense.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="capitalize">{expense.category}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p>{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Requested:
                        </span>
                        <p>
                          {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {expense.description && (
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Description:
                        </span>
                        <p className="text-sm">{expense.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(expense.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => openRejectDialog(expense.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Expense Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting this expense request. This
                will help the finance officer understand what needs to be
                corrected.
              </p>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectDialogOpen(false);
                    setRejectionReason("");
                    setSelectedExpenseId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SchoolDirectorExpenseApproval;
