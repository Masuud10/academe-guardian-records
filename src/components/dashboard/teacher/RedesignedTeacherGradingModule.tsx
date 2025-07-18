import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileSpreadsheet,
  Save,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
  Loader2,
  RefreshCw,
  Download,
  Printer,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
  Filter,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCurriculumDisplayName } from "@/utils/curriculum-detector";
import { CurriculumBasedGradingRouter } from "@/components/grading/CurriculumBasedGradingRouter";
import { useAcademicFilters } from "@/hooks/useAcademicFilters";
import GradeSheetSummaryReport from "@/components/grading/GradeSheetSummaryReport";
import { useGradeReports } from "@/hooks/useGradeReports";

interface Student {
  id: string;
  name: string;
  admission_number?: string;
  roll_number?: string;
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

interface GradeValue {
  student_id: string;
  subject_id: string;
  score?: number | null;
  letter_grade?: string | null;
  cbc_performance_level?: string | null;
  percentage?: number | null;
  teacher_remarks?: string;
  status?: string;
  is_locked?: boolean;
  // CBC specific fields
  formative_score?: number;
  summative_score?: number;
  total_score?: number;
  competency_grade?: "EE" | "ME" | "AE" | "BE";
  strand_scores?: Record<string, string>;
  // IGCSE specific fields
  coursework_score?: number;
  exam_score?: number;
  component_scores?: Record<string, number>;
  // Standard specific fields
  position?: number;
  stream_position?: number;
  conduct?: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor";
  is_absent?: boolean;
}

interface ClassOption {
  id: string;
  name: string;
  curriculum_type?: string;
}

interface AcademicYear {
  id: string;
  year_name: string;
  is_current: boolean;
}

interface AcademicTerm {
  id: string;
  term_name: string;
  is_current: boolean;
}

const RedesignedTeacherGradingModule: React.FC = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  // Academic filters
  const {
    academicYears,
    academicTerms,
    activeExamTypes,
    currentAcademicYear,
    currentAcademicTerm,
    isLoading: academicLoading,
  } = useAcademicFilters(schoolId);

  // Grade reports hook
  const {
    generateGradePDF,
    generateGradeExcel,
    printGradeReport,
    isGenerating,
  } = useGradeReports();

  // State management
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");

  // Grading state
  const [grades, setGrades] = useState<
    Record<string, Record<string, GradeValue>>
  >({});
  const [loading, setLoading] = useState(false);
  const [showGradeSheet, setShowGradeSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // UI state
  const [showGradingSheet, setShowGradingSheet] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  // Curriculum detection - now handled by CurriculumBasedGradingRouter
  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
  } = useClassCurriculum(selectedClass);

  // Load teacher's classes with enhanced authorization
  const loadTeacherClasses = useCallback(async () => {
    if (!user?.id || !schoolId) return;

    try {
      setLoading(true);
      console.log("Loading teacher classes for:", user.id, schoolId);

      // CRITICAL: Enhanced query with proper authorization check
      const { data, error } = await supabase
        .from("subject_teacher_assignments")
        .select(
          `
          class_id,
          subject_id,
          classes!inner(id, name, curriculum_type),
          subjects!inner(id, name, code)
        `
        )
        .eq("teacher_id", user.id)
        .eq("school_id", schoolId)
        .eq("is_active", true)
        .not("class_id", "is", null);

      if (error) {
        console.error("Error loading teacher classes:", error);
        throw error;
      }

      console.log("Raw class data from database:", data);

      // CRITICAL: Validate that user is actually a teacher
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, school_id")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error validating user profile:", profileError);
        throw new Error("Failed to validate user permissions");
      }

      if (
        userProfile.role !== "teacher" &&
        userProfile.role !== "principal" &&
        userProfile.role !== "school_director" &&
        userProfile.role !== "edufam_admin" &&
        userProfile.role !== "elimisha_admin"
      ) {
        throw new Error(
          "Access denied: Insufficient permissions for grade management"
        );
      }

      if (
        userProfile.school_id !== schoolId &&
        !["edufam_admin", "elimisha_admin"].includes(userProfile.role)
      ) {
        throw new Error("Access denied: School assignment mismatch");
      }

      const uniqueClasses =
        data
          ?.filter(
            (item: {
              classes?: { id: string; name: string; curriculum_type?: string };
            }) => item.classes
          )
          .map(
            (item: {
              classes: { id: string; name: string; curriculum_type?: string };
            }) => ({
              id: item.classes.id,
              name: item.classes.name,
              curriculum_type: item.classes.curriculum_type || "standard",
            })
          )
          .filter(
            (cls, index, self) =>
              index === self.findIndex((c) => c.id === cls.id)
          ) || [];

      console.log("Loaded classes with curriculum:", uniqueClasses);
      setClasses(uniqueClasses);

      if (uniqueClasses.length === 0) {
        toast({
          title: "No Classes Assigned",
          description:
            "You are not assigned to any classes. Please contact your administrator.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading teacher classes:", error);
      toast({
        title: "Error Loading Classes",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load your assigned classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, schoolId, toast]);

  // Initialize current selections from academic filters
  useEffect(() => {
    if (currentAcademicYear && !selectedAcademicYear) {
      setSelectedAcademicYear(currentAcademicYear.id);
      console.log("Set current academic year:", currentAcademicYear.year_name);
    }
  }, [currentAcademicYear, selectedAcademicYear]);

  useEffect(() => {
    if (currentAcademicTerm && !selectedTerm) {
      setSelectedTerm(currentAcademicTerm.term_name); // Use term_name for consistency
      console.log("Set current academic term:", currentAcademicTerm.term_name);
    }
  }, [currentAcademicTerm, selectedTerm]);

  // Auto-select first available exam type if none selected
  useEffect(() => {
    if (activeExamTypes.length > 0 && !selectedExamType) {
      setSelectedExamType(activeExamTypes[0].exam_type);
      console.log("Set default exam type:", activeExamTypes[0].session_name);
    }
  }, [activeExamTypes, selectedExamType]);

  // Load subjects for selected class with enhanced validation
  const loadClassSubjects = useCallback(async () => {
    if (!selectedClass || !user?.id) {
      setSubjects([]);
      return;
    }

    try {
      console.log("Loading subjects for class:", selectedClass);

      // CRITICAL: Enhanced query with proper authorization validation
      const { data, error } = await supabase
        .from("subject_teacher_assignments")
        .select(
          `
          subject:subjects(id, name, code),
          class_id,
          teacher_id,
          school_id
        `
        )
        .eq("teacher_id", user.id)
        .eq("class_id", selectedClass)
        .eq("school_id", schoolId)
        .eq("is_active", true);

      if (error) {
        console.error("Error loading subjects:", error);
        throw error;
      }

      // CRITICAL: Validate that all assignments belong to the current teacher and school
      const invalidAssignments = data?.filter(
        (item) => item.teacher_id !== user.id || item.school_id !== schoolId
      );

      if (invalidAssignments && invalidAssignments.length > 0) {
        console.error(
          "Invalid subject assignments detected:",
          invalidAssignments
        );
        throw new Error("Access denied: Invalid subject assignments detected");
      }

      const subjectsList =
        data
          ?.map(
            (item: { subject?: { id: string; name: string; code?: string } }) =>
              item.subject
          )
          .filter(Boolean) || [];

      console.log("Loaded subjects:", subjectsList);
      setSubjects(subjectsList);

      if (subjectsList.length === 0) {
        toast({
          title: "No Subjects Found",
          description:
            "No subjects assigned for this class. Please contact your administrator.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({
        title: "Error Loading Subjects",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load subjects for this class.",
        variant: "destructive",
      });
    }
  }, [selectedClass, user?.id, schoolId, toast]);

  // Load students for selected class
  const loadClassStudents = useCallback(async () => {
    if (!selectedClass || !schoolId) {
      setStudents([]);
      return;
    }

    try {
      console.log("Loading students for class:", selectedClass);

      const { data, error } = await supabase
        .from("students")
        .select("id, name, admission_number, roll_number")
        .eq("school_id", schoolId)
        .eq("class_id", selectedClass)
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error loading students:", error);
        throw error;
      }

      console.log("Loaded students:", data);
      setStudents(data || []);
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error Loading Students",
        description: "Failed to load students for this class.",
        variant: "destructive",
      });
    }
  }, [selectedClass, schoolId, toast]);

  // Load existing grades
  const loadExistingGrades = useCallback(async () => {
    if (!selectedClass || !selectedTerm || !selectedExamType || !schoolId) {
      setGrades({});
      return;
    }

    try {
      console.log("Loading existing grades for:", {
        classId: selectedClass,
        term: selectedTerm,
        examType: selectedExamType,
      });

      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("school_id", schoolId)
        .eq("class_id", selectedClass)
        .eq("term", selectedTerm)
        .eq("exam_type", selectedExamType)
        .eq(
          "academic_year",
          (
            selectedAcademicYear ||
            currentAcademicYear?.year_name ||
            new Date().getFullYear().toString()
          ).slice(0, 4)
        );

      if (error) {
        console.error("Error loading grades:", error);
        throw error;
      }

      // Initialize grades structure
      const gradesStructure: Record<string, Record<string, GradeValue>> = {};
      students.forEach((student) => {
        gradesStructure[student.id] = {};
        subjects.forEach((subject) => {
          const existingGrade = data?.find(
            (g) => g.student_id === student.id && g.subject_id === subject.id
          );
          gradesStructure[student.id][subject.id] = {
            student_id: student.id,
            subject_id: subject.id,
            score: existingGrade?.score || null,
            letter_grade: existingGrade?.letter_grade || null,
            cbc_performance_level: existingGrade?.cbc_performance_level || null,
            percentage: existingGrade?.percentage || null,
            teacher_remarks: existingGrade?.comments || "",
            status: existingGrade?.status || "draft",
            is_locked:
              existingGrade?.status === "released" ||
              existingGrade?.status === "approved",
            // IGCSE specific fields
            coursework_score: existingGrade?.coursework_score || null,
            exam_score: existingGrade?.exam_score || null,
            total_score: existingGrade?.score || null,
          };
        });
      });

      setGrades(gradesStructure);
      console.log("Loaded grades:", gradesStructure);
    } catch (error) {
      console.error("Error loading grades:", error);
      toast({
        title: "Error Loading Grades",
        description: "Failed to load existing grades.",
        variant: "destructive",
      });
    }
  }, [
    selectedClass,
    selectedTerm,
    selectedExamType,
    schoolId,
    students,
    subjects,
    toast,
  ]);

  // Initialize data
  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  // Load subjects when class changes
  useEffect(() => {
    loadClassSubjects();
  }, [loadClassSubjects]);

  // Load students when class changes
  useEffect(() => {
    loadClassStudents();
  }, [loadClassStudents]);

  // Load grades when selections change
  useEffect(() => {
    if (students.length > 0 && subjects.length > 0) {
      loadExistingGrades();
    }
  }, [loadExistingGrades, students.length, subjects.length]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveGrades();
      }, 3000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [hasUnsavedChanges, autoSaveEnabled]);

  // Handle grade change
  const handleGradeChange = useCallback(
    (studentId: string, subjectId: string, value: Partial<GradeValue>) => {
      setGrades((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [subjectId]: {
            ...prev[studentId]?.[subjectId],
            student_id: studentId,
            subject_id: subjectId,
            ...value,
          },
        },
      }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Save grades as draft
  const saveGrades = useCallback(async () => {
    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please select class, term, and exam type before saving.",
        variant: "destructive",
      });
      return;
    }

    // Auto-set academic year if not selected
    const academicYearToUse =
      selectedAcademicYear ||
      currentAcademicYear?.year_name ||
      new Date().getFullYear().toString();
    if (!academicYearToUse) {
      toast({
        title: "Missing Academic Year",
        description: "Please select an academic year before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Saving grades as draft...");

      const gradesToSave = Object.entries(grades).flatMap(
        ([studentId, studentGrades]) =>
          Object.entries(studentGrades).map(([subjectId, gradeData]) => ({
            school_id: schoolId,
            class_id: selectedClass,
            student_id: studentId,
            subject_id: subjectId,
            term: selectedTerm,
            exam_type: selectedExamType,
            academic_year: academicYearToUse,
            score: gradeData.score || gradeData.total_score,
            letter_grade: gradeData.letter_grade,
            cbc_performance_level: gradeData.cbc_performance_level,
            percentage: gradeData.percentage,
            comments: gradeData.teacher_remarks,
            status: "draft",
            submitted_by: user?.id,
            curriculum_type: curriculumType,
            max_score:
              gradeData.coursework_score && gradeData.exam_score
                ? 100
                : gradeData.score
                ? 100
                : null,
            // IGCSE specific fields
            coursework_score: gradeData.coursework_score,
            exam_score: gradeData.exam_score,
          }))
      );

      // Use proper onConflict specification
      const { error } = await supabase.from("grades").upsert(gradesToSave, {
        onConflict:
          "school_id,student_id,subject_id,class_id,term,exam_type,submitted_by",
        ignoreDuplicates: false,
      });

      if (error) throw error;

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaving(false);

      toast({
        title: "Grades Saved",
        description: "Grades have been saved as draft successfully.",
      });

      // Show grade sheet summary after saving
      setShowGradeSheet(true);

      console.log("Draft saved:", {
        classId: selectedClass,
        term: selectedTerm,
        examType: selectedExamType,
        gradeCount: gradesToSave.length,
      });

      // Reload existing grades to reflect updated status
      loadExistingGrades();
    } catch (error) {
      console.error("Error saving grades:", error);
      setSaving(false);
      toast({
        title: "Save Failed",
        description: "Failed to save grades. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    schoolId,
    selectedClass,
    selectedTerm,
    selectedExamType,
    selectedAcademicYear,
    currentAcademicYear,
    grades,
    user?.id,
    curriculumType,
    toast,
    loadExistingGrades,
  ]);

  // Submit grades for approval
  const submitGrades = useCallback(async () => {
    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description:
          "Please select class, term, and exam type before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Auto-set academic year if not selected
    const academicYearToUse =
      selectedAcademicYear ||
      currentAcademicYear?.year_name ||
      new Date().getFullYear().toString();
    if (!academicYearToUse) {
      toast({
        title: "Missing Academic Year",
        description: "Please select an academic year before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log("Submitting grades for approval...");

      // Check if there are any grades to submit
      const hasAnyGrades = Object.values(grades).some((studentGrades) =>
        Object.values(studentGrades).some(
          (grade) =>
            grade.score !== null || grade.cbc_performance_level !== null
        )
      );

      if (!hasAnyGrades) {
        toast({
          title: "No Grades to Submit",
          description: "Please enter at least one grade before submitting.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const gradesToSubmit = Object.entries(grades).flatMap(
        ([studentId, studentGrades]) =>
          Object.entries(studentGrades)
            .filter(
              ([_, gradeData]) =>
                gradeData.score !== null ||
                gradeData.cbc_performance_level !== null ||
                (gradeData.coursework_score !== null &&
                  gradeData.exam_score !== null)
            )
            .map(([subjectId, gradeData]) => ({
              school_id: schoolId,
              class_id: selectedClass,
              student_id: studentId,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              academic_year: academicYearToUse,
              score: gradeData.score || gradeData.total_score,
              letter_grade: gradeData.letter_grade,
              cbc_performance_level: gradeData.cbc_performance_level,
              percentage: gradeData.percentage,
              comments: gradeData.teacher_remarks,
              status: "submitted",
              submitted_by: user?.id,
              submitted_at: new Date().toISOString(),
              curriculum_type: curriculumType,
              max_score:
                gradeData.coursework_score && gradeData.exam_score
                  ? 100
                  : gradeData.score
                  ? 100
                  : null,
              // IGCSE specific fields
              coursework_score: gradeData.coursework_score,
              exam_score: gradeData.exam_score,
            }))
      );

      // Use proper onConflict specification with all required fields
      const { error } = await supabase.from("grades").upsert(gradesToSubmit, {
        onConflict:
          "school_id,student_id,subject_id,class_id,term,exam_type,submitted_by",
        ignoreDuplicates: false,
      });

      if (error) throw error;

      setHasUnsavedChanges(false);
      setSubmitting(false);

      toast({
        title: "Grades Submitted",
        description: "Grades have been submitted for principal approval.",
      });

      // Show grade sheet summary after submission
      setShowGradeSheet(true);

      // Also set after successful save
      setLastSaved(new Date());

      console.log("Grades submitted:", {
        classId: selectedClass,
        term: selectedTerm,
        examType: selectedExamType,
        gradeCount: gradesToSubmit.length,
      });

      // Reload existing grades to reflect submitted status
      loadExistingGrades();
    } catch (error) {
      console.error("Error submitting grades:", error);
      setSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "Failed to submit grades. Please try again.",
        variant: "destructive",
      });
    }
  }, [
    schoolId,
    selectedClass,
    selectedTerm,
    selectedExamType,
    selectedAcademicYear,
    currentAcademicYear,
    grades,
    user?.id,
    curriculumType,
    toast,
    loadExistingGrades,
  ]);

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    try {
      setExportLoading(true);

      const currentDate = new Date().toLocaleDateString();
      const curriculumInfo = getCurriculumDisplayName(curriculumType);

      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Grade Sheet - ${selectedClass} - ${selectedTerm} ${selectedExamType}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .school-info { margin-bottom: 20px; }
              .grade-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              .grade-table th { background-color: #f5f5f5; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Grade Sheet</h1>
              <div class="school-info">
                <p><strong>Class:</strong> ${selectedClass}</p>
                <p><strong>Term:</strong> ${selectedTerm}</p>
                <p><strong>Exam Type:</strong> ${selectedExamType}</p>
                <p><strong>Curriculum:</strong> ${curriculumInfo}</p>
                <p><strong>Date:</strong> ${currentDate}</p>
                <p><strong>Teacher:</strong> ${user?.name || "N/A"}</p>
              </div>
            </div>
            
            <table class="grade-table">
              <thead>
                <tr>
                  <th>Student</th>
                  ${subjects
                    .map((subject) => `<th>${subject.name}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${students
                  .map(
                    (student) => `
                  <tr>
                    <td>${student.name}</td>
                    ${subjects
                      .map((subject) => {
                        const grade = grades[student.id]?.[subject.id];
                        const gradeValue =
                          grade?.score || grade?.cbc_performance_level || "N/A";
                        return `<td>${gradeValue}</td>`;
                      })
                      .join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Powered by Edufam</p>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "PDF Export",
        description: "PDF export initiated. Check your print dialog.",
      });

      console.log("PDF exported:", {
        classId: selectedClass,
        term: selectedTerm,
        examType: selectedExamType,
        studentCount: students.length,
        subjectCount: subjects.length,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  }, [
    students,
    subjects,
    grades,
    selectedClass,
    selectedTerm,
    selectedExamType,
    curriculumType,
    user?.name,
    toast,
  ]);

  // Print sheet
  const printSheet = useCallback(async () => {
    try {
      setPrintLoading(true);

      const currentDate = new Date().toLocaleDateString();
      const curriculumInfo = getCurriculumDisplayName(curriculumType);

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Grade Sheet - ${selectedClass} - ${selectedTerm} ${selectedExamType}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .school-info { margin-bottom: 20px; }
              .grade-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              .grade-table th { background-color: #f5f5f5; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
              @media print { 
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Grade Sheet</h1>
              <div class="school-info">
                <p><strong>Class:</strong> ${selectedClass}</p>
                <p><strong>Term:</strong> ${selectedTerm}</p>
                <p><strong>Exam Type:</strong> ${selectedExamType}</p>
                <p><strong>Curriculum:</strong> ${curriculumInfo}</p>
                <p><strong>Date:</strong> ${currentDate}</p>
                <p><strong>Teacher:</strong> ${user?.name || "N/A"}</p>
              </div>
            </div>
            
            <table class="grade-table">
              <thead>
                <tr>
                  <th>Student</th>
                  ${subjects
                    .map((subject) => `<th>${subject.name}</th>`)
                    .join("")}
                </tr>
              </thead>
              <tbody>
                ${students
                  .map(
                    (student) => `
                  <tr>
                    <td>${student.name}</td>
                    ${subjects
                      .map((subject) => {
                        const grade = grades[student.id]?.[subject.id];
                        const gradeValue =
                          grade?.score || grade?.cbc_performance_level || "N/A";
                        return `<td>${gradeValue}</td>`;
                      })
                      .join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Powered by Edufam</p>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "Print",
        description: "Print dialog opened.",
      });

      console.log("Sheet printed:", {
        classId: selectedClass,
        term: selectedTerm,
        examType: selectedExamType,
      });
    } catch (error) {
      console.error("Error printing:", error);
      toast({
        title: "Print Failed",
        description: "Failed to print. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPrintLoading(false);
    }
  }, [
    students,
    subjects,
    grades,
    selectedClass,
    selectedTerm,
    selectedExamType,
    curriculumType,
    user?.name,
    toast,
  ]);

  // Get curriculum-specific grade input
  const getGradeInput = useCallback(
    (studentId: string, subjectId: string, grade: GradeValue) => {
      const isLocked = grade.is_locked;

      if (curriculumType === "cbc") {
        return (
          <Select
            value={grade.cbc_performance_level || ""}
            onValueChange={(value) =>
              handleGradeChange(studentId, subjectId, {
                cbc_performance_level: value,
              })
            }
            disabled={isLocked}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EM">EM</SelectItem>
              <SelectItem value="AP">AP</SelectItem>
              <SelectItem value="PR">PR</SelectItem>
              <SelectItem value="EX">EX</SelectItem>
            </SelectContent>
          </Select>
        );
      } else {
        return (
          <Input
            type="number"
            min="0"
            max="100"
            value={grade.score || ""}
            onChange={(e) =>
              handleGradeChange(studentId, subjectId, {
                score: parseFloat(e.target.value) || null,
              })
            }
            disabled={isLocked}
            className="h-8 w-16 text-center"
            placeholder="0-100"
          />
        );
      }
    },
    [curriculumType, handleGradeChange]
  );

  // Get curriculum badge

  // Check if all required selections are made
  const isReadyToGrade =
    selectedClass &&
    selectedTerm &&
    selectedExamType &&
    students.length > 0 &&
    subjects.length > 0;

  // Show loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading grading module...</span>
        </CardContent>
      </Card>
    );
  }

  // Show no classes assigned
  if (classes.length === 0 && !loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Classes Assigned
          </h3>
          <p className="text-gray-600 mb-4">
            You don't have any classes assigned to you yet. Please contact your
            administrator.
          </p>
          <Button onClick={loadTeacherClasses} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                My Class Grades
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={loadTeacherClasses}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Panel */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h4 className="font-medium text-blue-900 mb-4">
            {curriculumType === "cbc"
              ? "Assessment Configuration"
              : "Grade Sheet Configuration"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <span>{cls.name}</span>
                        {cls.curriculum_type && (
                          <Badge variant="outline" className="text-xs">
                            {cls.curriculum_type.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">
                Academic Year
              </label>
              <Select
                value={selectedAcademicYear}
                onValueChange={setSelectedAcademicYear}
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year_name} {year.is_current && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Term Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {academicTerms.map((term) => (
                    <SelectItem key={term.id} value={term.term_name}>
                      {term.term_name} {term.is_current && "(Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">
                Exam Type
              </label>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {activeExamTypes.map((exam) => (
                    <SelectItem key={exam.id} value={exam.exam_type}>
                      {exam.session_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-800">
                Subject Filter
              </label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="h-10 bg-white">
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Information */}
          <div className="mt-4 text-sm text-blue-700 space-y-1">
            <p>
              <strong>Students:</strong> {students.length}
            </p>
            <p>
              <strong>Subjects:</strong> {subjects.length}
            </p>
            <p>
              <strong>Curriculum:</strong>{" "}
              {getCurriculumDisplayName(curriculumType)}
            </p>
            {lastSaved && (
              <p className="text-green-600">
                <strong>Last saved:</strong> {lastSaved.toLocaleTimeString()}
              </p>
            )}
            {hasUnsavedChanges && (
              <p className="text-orange-600">
                <strong>⚠️ Unsaved changes</strong>
              </p>
            )}
            {saving && (
              <p className="text-blue-600">
                <strong>Saving...</strong>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Tools */}
      {isReadyToGrade && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Grading Tools</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="default"
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white h-16"
                onClick={() => setShowGradingSheet(true)}
              >
                <FileSpreadsheet className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="font-medium">
                    Open{" "}
                    {curriculumType === "cbc"
                      ? "Assessment Sheet"
                      : "Grade Sheet"}
                  </div>
                  <div className="text-sm opacity-90">
                    {selectedTerm} - {selectedExamType}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-blue-100 text-blue-800"
                >
                  Recommended
                </Badge>
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className="flex items-center gap-1"
                >
                  {autoSaveEnabled ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Auto-save {autoSaveEnabled ? "On" : "Off"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowKeyboardShortcuts(!showKeyboardShortcuts)
                  }
                  className="flex items-center gap-1"
                >
                  <Info className="h-3 w-3" />
                  Shortcuts
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  disabled={exportLoading}
                  className="flex items-center gap-1"
                >
                  {exportLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                  Export
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={printSheet}
                  disabled={printLoading}
                  className="flex items-center gap-1"
                >
                  {printLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Printer className="h-3 w-3" />
                  )}
                  Print
                </Button>
              </div>
            </div>

            {/* Keyboard shortcuts help */}
            {showKeyboardShortcuts && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Keyboard Shortcuts</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>Tab:</strong> Move to next cell
                    </div>
                    <div>
                      <strong>Shift+Tab:</strong> Move to previous cell
                    </div>
                    <div>
                      <strong>Enter:</strong> Edit cell / Move to next row
                    </div>
                    <div>
                      <strong>Escape:</strong> Cancel editing
                    </div>
                    <div>
                      <strong>Ctrl+S:</strong> Save draft
                    </div>
                    <div>
                      <strong>Ctrl+Enter:</strong> Submit grades
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grading Sheet Dialog */}
      {showGradingSheet && isReadyToGrade && (
        <Dialog open={showGradingSheet} onOpenChange={setShowGradingSheet}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Grade Sheet
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-auto max-h-[70vh] p-4">
              {/* Curriculum-Based Grading Sheet */}
              <div className="w-full">
                <CurriculumBasedGradingRouter
                  students={students}
                  subjects={subjects.filter(
                    (subject) =>
                      selectedSubject === "all" ||
                      subject.id === selectedSubject
                  )}
                  grades={grades}
                  onGradeChange={handleGradeChange}
                  isReadOnly={false}
                  selectedClass={selectedClass}
                  selectedTerm={selectedTerm}
                  selectedExamType={selectedExamType}
                  isPrincipal={false}
                  isViewOnly={false}
                  className={classes.find((c) => c.id === selectedClass)?.name}
                  termName={
                    academicTerms.find((t) => t.id === selectedTerm)?.term_name
                  }
                  academicYearName={
                    academicYears.find((y) => y.id === selectedAcademicYear)
                      ?.year_name
                  }
                  onSaveDraft={saveGrades}
                  onSubmitForApproval={submitGrades}
                  saving={saving}
                  submitting={submitting}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Error Display */}
      {curriculumError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Curriculum Error</AlertTitle>
          <AlertDescription>{curriculumError}</AlertDescription>
        </Alert>
      )}

      {/* Grade Sheet Summary Report - Show after grades are saved or submitted */}
      {showGradeSheet && students.length > 0 && subjects.length > 0 && (
        <div className="mt-6">
          <GradeSheetSummaryReport
            className={
              classes.find((c) => c.id === selectedClass)?.name ||
              "Unknown Class"
            }
            curriculumType={curriculumType}
            term={selectedTerm}
            examType={selectedExamType}
            academicYear={
              academicYears.find((y) => y.id === selectedAcademicYear)
                ?.year_name || ""
            }
            gradeRecords={students.map((student) => ({
              student_id: student.id,
              student_name: student.name,
              admission_number: student.admission_number,
              subjects: subjects.reduce((acc, subject) => {
                const grade = grades[student.id]?.[subject.id];
                if (grade) {
                  acc[subject.id] = {
                    subject_name: subject.name,
                    score: grade.score,
                    max_score: 100,
                    percentage: grade.percentage,
                    letter_grade: grade.letter_grade,
                    performance_level: grade.cbc_performance_level,
                    coursework_score: grade.coursework_score,
                    exam_score: grade.exam_score,
                  };
                }
                return acc;
              }, {} as any),
              total_score: Object.values(grades[student.id] || {}).reduce(
                (sum, grade) => sum + (grade.score || 0),
                0
              ),
              total_possible: subjects.length * 100,
              overall_percentage:
                Object.values(grades[student.id] || {}).reduce(
                  (sum, grade) => sum + (grade.percentage || 0),
                  0
                ) / subjects.length,
              overall_grade: "A",
              overall_position: 1,
            }))}
            subjects={subjects}
            onExportPDF={() => {
              const className =
                classes.find((c) => c.id === selectedClass)?.name ||
                "Unknown Class";
              const academicYear =
                academicYears.find((y) => y.id === selectedAcademicYear)
                  ?.year_name || "";
              const gradeData = students.map((student) => ({
                student_id: student.id,
                student_name: student.name,
                admission_number: student.admission_number,
                subjects: subjects.reduce((acc, subject) => {
                  const grade = grades[student.id]?.[subject.id];
                  if (grade) {
                    acc[subject.id] = {
                      subject_name: subject.name,
                      score: grade.score,
                      max_score: 100,
                      percentage: grade.percentage,
                      letter_grade: grade.letter_grade,
                      performance_level: grade.cbc_performance_level,
                      coursework_score: grade.coursework_score,
                      exam_score: grade.exam_score,
                    };
                  }
                  return acc;
                }, {} as any),
                total_score: Object.values(grades[student.id] || {}).reduce(
                  (sum, grade) => sum + (grade.score || 0),
                  0
                ),
                total_possible: subjects.length * 100,
                overall_percentage:
                  Object.values(grades[student.id] || {}).reduce(
                    (sum, grade) => sum + (grade.percentage || 0),
                    0
                  ) / subjects.length,
                overall_grade: "A",
                overall_position: 1,
              }));
              generateGradePDF(
                className,
                curriculumType,
                selectedTerm,
                selectedExamType,
                academicYear,
                gradeData,
                subjects
              );
            }}
            onExportExcel={() => {
              const className =
                classes.find((c) => c.id === selectedClass)?.name ||
                "Unknown Class";
              const academicYear =
                academicYears.find((y) => y.id === selectedAcademicYear)
                  ?.year_name || "";
              const gradeData = students.map((student) => ({
                student_id: student.id,
                student_name: student.name,
                admission_number: student.admission_number,
                subjects: subjects.reduce((acc, subject) => {
                  const grade = grades[student.id]?.[subject.id];
                  if (grade) {
                    acc[subject.id] = {
                      subject_name: subject.name,
                      score: grade.score,
                      max_score: 100,
                      percentage: grade.percentage,
                      letter_grade: grade.letter_grade,
                      performance_level: grade.cbc_performance_level,
                      coursework_score: grade.coursework_score,
                      exam_score: grade.exam_score,
                    };
                  }
                  return acc;
                }, {} as any),
                total_score: Object.values(grades[student.id] || {}).reduce(
                  (sum, grade) => sum + (grade.score || 0),
                  0
                ),
                total_possible: subjects.length * 100,
                overall_percentage:
                  Object.values(grades[student.id] || {}).reduce(
                    (sum, grade) => sum + (grade.percentage || 0),
                    0
                  ) / subjects.length,
                overall_grade: "A",
                overall_position: 1,
              }));
              generateGradeExcel(
                className,
                curriculumType,
                selectedTerm,
                selectedExamType,
                academicYear,
                gradeData,
                subjects
              );
            }}
            onPrint={() => {
              const className =
                classes.find((c) => c.id === selectedClass)?.name ||
                "Unknown Class";
              const academicYear =
                academicYears.find((y) => y.id === selectedAcademicYear)
                  ?.year_name || "";
              const gradeData = students.map((student) => ({
                student_id: student.id,
                student_name: student.name,
                admission_number: student.admission_number,
                subjects: subjects.reduce((acc, subject) => {
                  const grade = grades[student.id]?.[subject.id];
                  if (grade) {
                    acc[subject.id] = {
                      subject_name: subject.name,
                      score: grade.score,
                      max_score: 100,
                      percentage: grade.percentage,
                      letter_grade: grade.letter_grade,
                      performance_level: grade.cbc_performance_level,
                      coursework_score: grade.coursework_score,
                      exam_score: grade.exam_score,
                    };
                  }
                  return acc;
                }, {} as any),
                total_score: Object.values(grades[student.id] || {}).reduce(
                  (sum, grade) => sum + (grade.score || 0),
                  0
                ),
                total_possible: subjects.length * 100,
                overall_percentage:
                  Object.values(grades[student.id] || {}).reduce(
                    (sum, grade) => sum + (grade.percentage || 0),
                    0
                  ) / subjects.length,
                overall_grade: "A",
                overall_position: 1,
              }));
              printGradeReport(
                className,
                curriculumType,
                selectedTerm,
                selectedExamType,
                academicYear,
                gradeData,
                subjects
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RedesignedTeacherGradingModule;
