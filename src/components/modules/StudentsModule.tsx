import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Search,
  Plus,
  Edit,
  Eye,
  Users,
  GraduationCap,
  UserCheck,
  UserX,
  RefreshCw,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStudents } from "@/hooks/useStudents";
import StudentIdCardGenerator from "@/components/id_cards/StudentIdCardGenerator";

// Import Student type from the hook
interface Student {
  id: string;
  name: string;
  admission_number: string;
  class_id: string;
  school_id: string;
  parent_id?: string;
  roll_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  parent_contact?: string;
  is_active: boolean;
  created_at: string;
}
import { useClasses } from "@/hooks/useClasses";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import StudentAdmissionModal from "@/components/modals/StudentAdmissionModal";
import StudentDetailModal from "@/components/modals/StudentDetailModal";
import { useParents } from "@/hooks/useParents";
import { useAuth } from "@/contexts/AuthContext";

const StudentsModule = () => {
  const [activeTab, setActiveTab] = useState("management");
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [admitStudentOpen, setAdmitStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { user } = useAuth();
  const { isReady } = useSchoolScopedData();
  const {
    students,
    loading: studentsLoading,
    error: studentsError,
    retry: retryStudents,
  } = useStudents(classFilter !== "all" ? classFilter : undefined);
  const {
    classes,
    loading: classesLoading,
    error: classesError,
    retry: retryClasses,
  } = useClasses();
  const { parents, loadingParents } = useParents(admitStudentOpen);

  const loading = studentsLoading || classesLoading || !isReady;
  const hasError = studentsError || classesError;

  const canAddStudents =
    user?.role &&
    ["principal", "school_director", "edufam_admin"].includes(user.role);

  // Refetch data when ready state changes
  useEffect(() => {
    if (isReady) {
      retryStudents();
      retryClasses();
    }
  }, [isReady, retryStudents, retryClasses]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && student.is_active) ||
      (statusFilter === "inactive" && !student.is_active);
    return matchesSearch && matchesStatus;
  });

  // Helper function to get class name by ID
  const getClassName = (classId: string) => {
    const classItem = classes.find((cls) => cls.id === classId);
    return classItem?.name || "N/A";
  };

  const studentStats = {
    total: students.length,
    active: students.filter((s) => s.is_active).length,
    inactive: students.filter((s) => !s.is_active).length,
    newThisMonth: students.filter((s) => {
      const createdDate = new Date(s.created_at);
      const now = new Date();
      return (
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  const handleRetry = () => {
    retryStudents();
    retryClasses();
  };

  // Handler for successful student admission
  const handleAdmissionSuccess = () => {
    setAdmitStudentOpen(false);
    retryStudents();
  };

  // Handler for viewing student details
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setDetailModalOpen(true);
  };

  // Handler for closing detail modal
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Management
          </h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Error loading data:</strong>{" "}
              {studentsError || classesError}
              <br />
              <span className="text-sm">
                Please check your connection and try again.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-muted-foreground">
            Manage student records, information, and ID cards
          </p>
        </div>
        {canAddStudents && activeTab === "management" && (
          <Button onClick={() => setAdmitStudentOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Management
          </TabsTrigger>
          <TabsTrigger value="id-cards" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            ID Card Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentStats.total}</div>
                <p className="text-xs text-muted-foreground">All registered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Students
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {studentStats.active}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently enrolled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {studentStats.inactive}
                </div>
                <p className="text-xs text-muted-foreground">Not active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New This Month
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {studentStats.newThisMonth}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent admissions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No students found
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    classFilter !== "all"
                      ? "Try adjusting your search criteria."
                      : "Start by adding your first student."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.admission_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell>{getClassName(student.class_id)}</TableCell>
                        <TableCell>{student.roll_number || "N/A"}</TableCell>
                        <TableCell>{student.parent_contact || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.is_active ? "default" : "secondary"
                            }
                          >
                            {student.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewStudent(student)}
                              title="View Student Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              title="Edit Student (Coming Soon)"
                              disabled
                            >
                              <Edit className="w-4 h-4" />
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
        </TabsContent>

        <TabsContent value="id-cards">
          <StudentIdCardGenerator />
        </TabsContent>
      </Tabs>

      {/* Student Admission Modal */}
      <StudentAdmissionModal
        open={admitStudentOpen}
        onClose={() => setAdmitStudentOpen(false)}
        onSuccess={handleAdmissionSuccess}
        classes={classes}
        parents={parents}
        loadingParents={classesLoading || loadingParents}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={detailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
};

export default StudentsModule;
