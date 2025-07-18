import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Loader2,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { SystemIntegrationService } from "@/services/integration/SystemIntegrationService";
import { supabase } from "@/integrations/supabase/client";

interface FeeStructure {
  id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  school_id: string;
  // These properties are accessed in the code but may not exist in the database
  term_id?: string;
  academic_year_id?: string;
  academic_terms?: { term_name: string };
  academic_years?: { year_name: string };
  classes?: { name: string; curriculum_type?: string };
  category?: string;
  amount?: number;
  due_date?: string;
}

interface StudentFee {
  id: string;
  student_id: string;
  school_id: string;
  fee_id: string;
  class_id: string;
  amount: number;
  amount_paid: number;
  status: string;
  due_date: string;
  academic_year: string;
  term: string;
  created_at: string;
  updated_at: string;
  // These properties are accessed in the code but may not exist in the database
  students?: { name: string; admission_number: string };
  classes?: { name: string };
}

const EnhancedFeeManagement = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("structures");

  // Get current academic period
  const { data: currentPeriod, isLoading: loadingPeriod } = useQuery({
    queryKey: ["currentAcademicPeriod", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      return await SystemIntegrationService.getCurrentAcademicPeriod(schoolId);
    },
    enabled: !!schoolId,
  });

  // Fetch fee structures
  const {
    data: feeStructures,
    isLoading: loadingStructures,
    error: structuresError,
  } = useQuery({
    queryKey: ["feeStructures", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("fee_structures")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch student fees
  const {
    data: studentFees,
    isLoading: loadingStudentFees,
    error: studentFeesError,
  } = useQuery({
    queryKey: ["studentFees", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("student_fees")
        .select(
          `
          id,
          student_id,
          school_id,
          fee_id,
          class_id,
          amount,
          amount_paid,
          status,
          due_date,
          academic_year,
          term,
          created_at,
          updated_at
        `
        )
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Fetch available classes
  const { data: availableClasses } = useQuery({
    queryKey: ["availableClasses", schoolId, currentPeriod?.year?.id],
    queryFn: async () => {
      if (!schoolId) return [];
      const result = await SystemIntegrationService.getAvailableClasses(
        schoolId,
        currentPeriod?.year?.id
      );
      return result.classes || [];
    },
    enabled: !!schoolId && !!currentPeriod?.year?.id,
  });

  // Check permissions
  const canManageFees =
    user?.role &&
    ["principal", "finance_officer", "school_director"].includes(user.role);

  if (!canManageFees) {
    return (
      <div className="p-8 text-center text-red-600">
        <Alert className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only principals, finance officers, and school
            directors can manage fees.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Filter fee structures
  const filteredFeeStructures =
    feeStructures?.filter((structure) => {
      const matchesSearch =
        structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        structure.academic_year
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        structure.term.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTerm = termFilter === "all" || structure.term === termFilter;
      const matchesYear =
        yearFilter === "all" || structure.academic_year === yearFilter;

      return matchesSearch && matchesTerm && matchesYear;
    }) || [];

  // Type guard for StudentFee
  function isStudentFee(fee: unknown): fee is StudentFee {
    return (
      typeof fee === "object" &&
      fee !== null &&
      typeof (fee as StudentFee).id === "string" &&
      typeof (fee as StudentFee).amount === "number" &&
      typeof (fee as StudentFee).amount_paid === "number"
    );
  }

  // Filter student fees
  const filteredStudentFees =
    studentFees?.filter((fee) => {
      if (!isStudentFee(fee)) return false;
      const matchesSearch = searchTerm === "";
      const matchesClass =
        classFilter === "all" || fee.class_id === classFilter;
      const matchesTerm = termFilter === "all" || fee.term === termFilter;
      const matchesYear =
        yearFilter === "all" || fee.academic_year === yearFilter;
      return matchesSearch && matchesClass && matchesTerm && matchesYear;
    }) || [];

  // Calculate statistics
  const totalFeeAmount =
    studentFees?.reduce(
      (sum, fee) => (isStudentFee(fee) ? sum + (fee.amount || 0) : sum),
      0
    ) || 0;
  const totalPaidAmount =
    studentFees?.reduce(
      (sum, fee) => (isStudentFee(fee) ? sum + (fee.amount_paid || 0) : sum),
      0
    ) || 0;
  const totalOutstanding = totalFeeAmount - totalPaidAmount;
  const collectionRate =
    totalFeeAmount > 0 ? (totalPaidAmount / totalFeeAmount) * 100 : 0;

  const pendingFees =
    studentFees?.filter((fee) => isStudentFee(fee) && fee.status === "unpaid")
      .length || 0;
  const paidFees =
    studentFees?.filter((fee) => isStudentFee(fee) && fee.status === "paid")
      .length || 0;
  const overdueFees =
    studentFees?.filter((fee) => {
      if (!isStudentFee(fee)) return false;
      const dueDate = new Date(fee.due_date);
      const now = new Date();
      return dueDate < now && fee.status !== "paid";
    }).length || 0;

  if (loadingPeriod || loadingStructures || loadingStudentFees) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading fee management data...
          </p>
        </div>
      </div>
    );
  }

  if (structuresError || studentFeesError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading fee data:{" "}
            {structuresError?.message || studentFeesError?.message}
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
          <h1 className="text-3xl font-bold">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage fee structures, student fees, and payment tracking
          </p>
        </div>
        <Button onClick={() => setActiveTab("structures")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Fee Structure
        </Button>
      </div>

      {/* Current Academic Period Info */}
      {currentPeriod && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              Current Academic Period
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {currentPeriod.year?.year_name || "Year not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {currentPeriod.term?.term_name || "Term not set"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">
                  {availableClasses?.length || 0} Available Classes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning if no current period */}
      {(!currentPeriod?.year?.id || !currentPeriod?.term?.id) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> No current academic year or term is set.
            Please set a current academic year and term in Academic Settings
            before managing fees.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-xl font-bold">
                  KES {totalFeeAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-xl font-bold">
                  KES {totalPaidAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-bold">
                  KES {totalOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-xl font-bold">
                  {collectionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Fees</p>
                <p className="text-xl font-bold">{pendingFees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Fees</p>
                <p className="text-xl font-bold">{paidFees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue Fees</p>
                <p className="text-xl font-bold">{overdueFees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "structures" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("structures")}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          Fee Structures
        </Button>
        <Button
          variant={activeTab === "studentFees" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("studentFees")}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          Student Fees
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${
                    activeTab === "structures"
                      ? "fee structures"
                      : "student fees"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Classes</option>
                {availableClasses?.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Term</label>
              <select
                value={termFilter}
                onChange={(e) => setTermFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Terms</option>
                {feeStructures?.map((structure) => (
                  <option key={structure.term} value={structure.term}>
                    {structure.term}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Years</option>
                {feeStructures?.map((structure) => (
                  <option
                    key={structure.academic_year}
                    value={structure.academic_year}
                  >
                    {structure.academic_year}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "structures" && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="tuition">Tuition</option>
                  <option value="transport">Transport</option>
                  <option value="meals">Meals</option>
                  <option value="activities">Activities</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Structures Tab */}
      {activeTab === "structures" && (
        <Card>
          <CardHeader>
            <CardTitle>Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFeeStructures.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {feeStructures?.length === 0
                    ? "No fee structures found"
                    : "No fee structures match your filters"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feeStructures?.length === 0
                    ? "Create your first fee structure to get started."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeeStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>
                        <div className="font-medium">{structure.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>Class info not available</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">General</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          Amount not available
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{structure.term}</div>
                          <div className="text-muted-foreground">
                            {structure.academic_year}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">Due date not available</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            structure.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {structure.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Fees Tab */}
      {activeTab === "studentFees" && (
        <Card>
          <CardHeader>
            <CardTitle>Student Fees</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudentFees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {studentFees?.length === 0
                    ? "No student fees found"
                    : "No student fees match your filters"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {studentFees?.length === 0
                    ? "Student fees will appear here once fee structures are assigned to students."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudentFees.map((fee) => {
                    if (!isStudentFee(fee)) return null;
                    const balance = fee.amount - fee.amount_paid;
                    const isOverdue =
                      new Date(fee.due_date) < new Date() &&
                      fee.status !== "paid";

                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              Student info not available
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {fee.student_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>Class info not available</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            KES {fee.amount.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600">
                            KES {fee.amount_paid.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              balance > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            KES {balance.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`text-sm ${
                              isOverdue ? "text-red-600" : ""
                            }`}
                          >
                            {new Date(fee.due_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              fee.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : isOverdue
                                ? "bg-red-100 text-red-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {fee.status === "paid"
                              ? "Paid"
                              : isOverdue
                              ? "Overdue"
                              : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {balance > 0 && (
                              <Button variant="ghost" size="sm">
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFeeManagement;
