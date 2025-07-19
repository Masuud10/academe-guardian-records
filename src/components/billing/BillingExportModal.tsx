
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  Building2,
  DollarSign,
} from "lucide-react";
import { useBillingActions } from "@/hooks/useBillingActions";
import { useAllSchools } from "@/hooks/useBillingManagement";

interface BillingData {
  schools: Array<{
    id: string;
    name: string;
    email: string;
    setupCost: number;
    subscriptionCost: number;
    totalPaid: number;
    outstandingBalance: number;
    studentCount: number;
  }>;
  stats: {
    totalBilledSchools: number;
    totalSetupRevenue: number;
    totalSubscriptionRevenue: number;
    outstandingBalances: number;
    totalRevenue: number;
    pendingInvoices: number;
    paidInvoices: number;
    setupFees: number;
    totalInvoices: number;
  };
}

interface BillingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (format: string) => void;
  data?: BillingData;
}

const BillingExportModal: React.FC<BillingExportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  data,
}) => {
  const [exportOptions, setExportOptions] = useState({
    format: "excel" as "pdf" | "excel",
    school_id: "all",
    status: "all",
    billing_type: "all",
    date_from: "",
    date_to: "",
  });

  const [isExporting, setIsExporting] = useState(false);

  const { exportBillingData } = useBillingActions();
  const { data: schools, isLoading: schoolsLoading } = useAllSchools();

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const filters: Record<string, string> = {};

      if (exportOptions.school_id !== "all") {
        filters.school_id = exportOptions.school_id;
      }
      if (exportOptions.status !== "all") {
        filters.status = exportOptions.status;
      }
      if (exportOptions.billing_type !== "all") {
        filters.billing_type = exportOptions.billing_type;
      }
      if (exportOptions.date_from) {
        filters.date_from = exportOptions.date_from;
      }
      if (exportOptions.date_to) {
        filters.date_to = exportOptions.date_to;
      }

      await exportBillingData.mutateAsync({
        format: exportOptions.format,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });

      onSuccess(exportOptions.format);
    } catch (error) {
      console.error("Failed to export billing data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (key: string, value: string) => {
    setExportOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getExportSummary = () => {
    if (!data) return null;

    const { schools: filteredSchools, stats } = data;
    const totalRecords = stats?.totalInvoices || 0;
    const totalRevenue = stats?.totalRevenue || 0;
    const pendingInvoices = stats?.pendingInvoices || 0;

    return {
      totalSchools: filteredSchools?.length || 0,
      totalRecords,
      totalRevenue,
      pendingInvoices,
    };
  };

  const summary = getExportSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Billing Data
          </DialogTitle>
          <DialogDescription>
            Export billing records in your preferred format with optional
            filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Summary */}
          {summary && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div>
                    <strong>Export Summary:</strong>
                  </div>
                  <div>• {summary.totalSchools} schools</div>
                  <div>• {summary.totalRecords} billing records</div>
                  <div>
                    • KES {summary.totalRevenue.toLocaleString()} total revenue
                  </div>
                  <div>• {summary.pendingInvoices} pending invoices</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Export Format */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />
              Export Format
            </Label>
            <Select
              value={exportOptions.format}
              onValueChange={(value: "pdf" | "excel") =>
                handleOptionChange("format", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h4 className="font-medium">Export Filters (Optional)</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  School
                </Label>
                <Select
                  value={exportOptions.school_id}
                  onValueChange={(value) =>
                    handleOptionChange("school_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All schools" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Schools</SelectItem>
                    {schoolsLoading ? (
                      <SelectItem value="" disabled>
                        Loading schools...
                      </SelectItem>
                    ) : (
                      schools?.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Status
                </Label>
                <Select
                  value={exportOptions.status}
                  onValueChange={(value) => handleOptionChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Billing Type Filter */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Billing Type
                </Label>
                <Select
                  value={exportOptions.billing_type}
                  onValueChange={(value) =>
                    handleOptionChange("billing_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="setup_fee">Setup Fees</SelectItem>
                    <SelectItem value="subscription_fee">
                      Subscription Fees
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    placeholder="From"
                    value={exportOptions.date_from}
                    onChange={(e) =>
                      handleOptionChange("date_from", e.target.value)
                    }
                  />
                  <Input
                    type="date"
                    placeholder="To"
                    value={exportOptions.date_to}
                    onChange={(e) =>
                      handleOptionChange("date_to", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Export Options Info */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div>
                  <strong>Export will include:</strong>
                </div>
                <div>• School information (name, email, status)</div>
                <div>• Billing details (amount, type, status, dates)</div>
                <div>• Payment information (method, dates)</div>
                <div>• Summary statistics</div>
                {exportOptions.format === "excel" && (
                  <div>• Multiple sheets for different data types</div>
                )}
                {exportOptions.format === "pdf" && (
                  <div>• Formatted report with charts and summaries</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {exportOptions.format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillingExportModal;
