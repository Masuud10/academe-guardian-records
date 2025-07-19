import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, Send, Loader2, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { supabase } from "@/integrations/supabase/client";

interface Student {
  id: string;
  name: string;
  admission_number?: string;
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
  marks?: number;
  // IGCSE specific fields
  coursework_score?: number | null;
  exam_score?: number | null;
  total_score?: number | null;
}

interface CleanGradingSheetProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeValue>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: GradeValue
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
  curriculumType?: string;
  // New props for displaying names
  className?: string;
  termName?: string;
  academicYearName?: string;
  // Save and submit functions
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  saving?: boolean;
  submitting?: boolean;
}

const CBC_PERFORMANCE_LEVELS = [
  { level: "EM", name: "Emerging", color: "bg-red-100 text-red-800" },
  { level: "AP", name: "Approaching", color: "bg-yellow-100 text-yellow-800" },
  { level: "PR", name: "Proficient", color: "bg-blue-100 text-blue-800" },
  { level: "EX", name: "Exemplary", color: "bg-green-100 text-green-800" },
];

// IGCSE Grade Boundaries
const IGCSE_GRADE_BOUNDARIES = {
  "A*": 90,
  A: 80,
  B: 70,
  C: 60,
  D: 50,
  E: 40,
  F: 30,
  G: 20,
  U: 0,
};

// IGCSE Grade Colors
const IGCSE_GRADE_COLORS = {
  "A*": "bg-purple-100 text-purple-800 border-purple-200",
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200",
  D: "bg-orange-100 text-orange-800 border-orange-200",
  E: "bg-red-100 text-red-800 border-red-200",
  F: "bg-red-100 text-red-800 border-red-200",
  G: "bg-red-100 text-red-800 border-red-200",
  U: "bg-gray-100 text-gray-800 border-gray-200",
};

export const CleanGradingSheet: React.FC<CleanGradingSheetProps> = ({
  students,
  subjects,
  grades,
  onGradeChange,
  isReadOnly = false,
  selectedClass,
  selectedTerm,
  selectedExamType,
  isPrincipal = false,
  isViewOnly = false,
  curriculumType = "standard",
  className,
  termName,
  academicYearName,
  onSaveDraft,
  onSubmitForApproval,
  saving: savingProp,
  submitting: submittingProp,
}) => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [existingGradeData, setExistingGradeData] = useState<{
    status?: string;
    submitted_by?: string;
  }>({});

  // Debug logging for curriculum type
  useEffect(() => {
    console.log("🎓 CleanGradingSheet Debug:", {
      curriculumType,
      selectedClass,
      selectedTerm,
      selectedExamType,
      isPrincipal,
      isViewOnly,
      studentsCount: students.length,
      subjectsCount: subjects.length,
    });
  }, [
    curriculumType,
    selectedClass,
    selectedTerm,
    selectedExamType,
    isPrincipal,
    isViewOnly,
    students.length,
    subjects.length,
  ]);

  // Load existing grade metadata for permission checking
  useEffect(() => {
    const loadGradeMetadata = async () => {
      if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType)
        return;

      try {
        const { data: existingGrades } = await supabase
          .from("grades")
          .select("status, submitted_by")
          .eq("class_id", selectedClass)
          .eq("term", selectedTerm)
          .eq("exam_type", selectedExamType)
          .eq("school_id", schoolId)
          .limit(1)
          .maybeSingle();

        if (existingGrades) {
          setExistingGradeData({
            status: existingGrades.status,
            submitted_by: existingGrades.submitted_by,
          });
        }
      } catch (error) {
        console.error("Error loading grade metadata:", error);
      }
    };

    loadGradeMetadata();
  }, [schoolId, selectedClass, selectedTerm, selectedExamType]);

  // Check if current user can edit grades based on status and ownership
  const canEditGrades = () => {
    // If no existing grades, teachers can create new ones
    if (!existingGradeData.status && !existingGradeData.submitted_by) {
      return user?.role === "teacher" || isPrincipal;
    }

    // For teachers: can only edit if they own the grade and it's in draft status
    if (user?.role === "teacher") {
      return (
        existingGradeData.status === "draft" &&
        existingGradeData.submitted_by === user.id
      );
    }

    // Principals can edit any grade except released ones
    if (isPrincipal) {
      return existingGradeData.status !== "released";
    }

    return false;
  };

  // Convert marks to performance level for CBC
  const getPerformanceLevelFromMarks = (marks: number): string => {
    if (marks >= 80) return "EX";
    if (marks >= 60) return "PR";
    if (marks >= 40) return "AP";
    return "EM";
  };

  // Get performance level color
  const getPerformanceLevelColor = (level: string): string => {
    const levelInfo = CBC_PERFORMANCE_LEVELS.find((l) => l.level === level);
    return levelInfo?.color || "bg-gray-100 text-gray-800";
  };

  // Calculate IGCSE letter grade
  const calculateIGCSEGrade = (percentage: number): string => {
    if (percentage >= IGCSE_GRADE_BOUNDARIES["A*"]) return "A*";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.A) return "A";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.B) return "B";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.C) return "C";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.D) return "D";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.E) return "E";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.F) return "F";
    if (percentage >= IGCSE_GRADE_BOUNDARIES.G) return "G";
    return "U";
  };

  // Get IGCSE grade color
  const getIGCSEGradeColor = (grade: string): string => {
    return (
      IGCSE_GRADE_COLORS[grade as keyof typeof IGCSE_GRADE_COLORS] ||
      "bg-gray-100 text-gray-800"
    );
  };

  // Handle grade change
  const handleGradeChange = (
    studentId: string,
    subjectId: string,
    field: keyof GradeValue,
    value: string | number | null
  ) => {
    const currentGrade = grades[studentId]?.[subjectId] || {
      student_id: studentId,
      subject_id: subjectId,
      score: null,
      letter_grade: null,
      cbc_performance_level: null,
      percentage: null,
      teacher_remarks: "",
      status: "draft",
      marks: 0,
      coursework_score: null,
      exam_score: null,
      total_score: null,
    };

    const updatedGrade = {
      ...currentGrade,
      [field]: value,
    };

    // Auto-calculate performance level for CBC when marks change
    if (
      field === "marks" &&
      curriculumType === "cbc" &&
      typeof value === "number"
    ) {
      updatedGrade.cbc_performance_level = getPerformanceLevelFromMarks(value);
    }

    // Auto-calculate percentage for standard curriculum
    if (
      field === "score" &&
      curriculumType === "standard" &&
      typeof value === "number"
    ) {
      updatedGrade.percentage = value ? Math.round((value / 100) * 100) : null;
    }

    // Auto-calculate IGCSE total score and letter grade
    if (
      (field === "coursework_score" || field === "exam_score") &&
      curriculumType === "igcse"
    ) {
      const courseworkScore =
        field === "coursework_score" ? value : currentGrade.coursework_score;
      const examScore =
        field === "exam_score" ? value : currentGrade.exam_score;

      if (
        typeof courseworkScore === "number" &&
        typeof examScore === "number"
      ) {
        // Default weighting: 30% coursework, 70% exam
        const totalScore = Math.round(courseworkScore * 0.3 + examScore * 0.7);
        const percentage = totalScore;
        const letterGrade = calculateIGCSEGrade(percentage);

        updatedGrade.total_score = totalScore;
        updatedGrade.percentage = percentage;
        updatedGrade.letter_grade = letterGrade;
      }
    }

    onGradeChange(studentId, subjectId, updatedGrade);
  };

  // Save grades
  const handleSave = async () => {
    if (onSaveDraft) {
      onSaveDraft();
      return;
    }

    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are selected.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const gradesToSave = [];

      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (
            grade.score !== null ||
            grade.cbc_performance_level ||
            grade.coursework_score !== null ||
            grade.exam_score !== null
          ) {
            gradesToSave.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              academic_year: new Date().getFullYear().toString().slice(0, 4),
              score: grade.score || grade.total_score,
              letter_grade: grade.letter_grade,
              cbc_performance_level: grade.cbc_performance_level,
              percentage: grade.percentage,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              status: "draft",
              curriculum_type: curriculumType,
              // IGCSE specific fields
              coursework_score: grade.coursework_score,
              exam_score: grade.exam_score,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      if (gradesToSave.length > 0) {
        const { error } = await supabase.from("grades").upsert(gradesToSave, {
          onConflict:
            "school_id,student_id,subject_id,class_id,term,exam_type,submitted_by",
        });

        if (error) throw error;

        toast({
          title: "Draft Saved",
          description: `${gradesToSave.length} grades have been saved as draft. You can continue editing or submit for approval when ready.`,
        });
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save grades",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Submit grades
  const handleSubmit = async () => {
    if (onSubmitForApproval) {
      onSubmitForApproval();
      return;
    }

    if (!schoolId || !selectedClass || !selectedTerm || !selectedExamType) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are selected.",
        variant: "destructive",
      });
      return;
    }

    // Check if there are any grades to submit
    const hasAnyGrades = Object.values(grades).some((studentGrades) =>
      Object.values(studentGrades).some(
        (grade) =>
          grade.score !== null ||
          grade.cbc_performance_level !== null ||
          grade.coursework_score !== null ||
          grade.exam_score !== null
      )
    );

    if (!hasAnyGrades) {
      toast({
        title: "No Grades to Submit",
        description:
          "Please enter at least one grade before submitting for approval.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const gradesToSubmit = [];

      for (const studentId in grades) {
        for (const subjectId in grades[studentId]) {
          const grade = grades[studentId][subjectId];
          if (
            grade.score !== null ||
            grade.cbc_performance_level !== null ||
            grade.coursework_score !== null ||
            grade.exam_score !== null
          ) {
            gradesToSubmit.push({
              school_id: schoolId,
              student_id: studentId,
              class_id: selectedClass,
              subject_id: subjectId,
              term: selectedTerm,
              exam_type: selectedExamType,
              academic_year: new Date().getFullYear().toString().slice(0, 4),
              score: grade.score || grade.total_score,
              letter_grade: grade.letter_grade,
              cbc_performance_level: grade.cbc_performance_level,
              percentage: grade.percentage,
              teacher_remarks: grade.teacher_remarks,
              teacher_id: user?.id,
              submitted_by: user?.id,
              submitted_at: new Date().toISOString(),
              status: "submitted",
              curriculum_type: curriculumType,
              // IGCSE specific fields
              coursework_score: grade.coursework_score,
              exam_score: grade.exam_score,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      if (gradesToSubmit.length > 0) {
        const { error } = await supabase.from("grades").upsert(gradesToSubmit, {
          onConflict:
            "school_id,student_id,subject_id,class_id,term,exam_type,submitted_by",
        });

        if (error) throw error;

        toast({
          title: "Grades Submitted",
          description: `${gradesToSubmit.length} grades have been submitted for principal approval.`,
        });
      }
    } catch (error) {
      console.error("Error submitting grades:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit grades",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setExportLoading(true);

      // Create CSV content
      const headers = [
        "Student Name",
        "Admission Number",
        ...subjects.map((subject) => subject.name),
        "Remarks",
      ];

      const csvRows = [headers.join(",")];

      students.forEach((student) => {
        const row = [
          student.name,
          student.admission_number || "",
          ...subjects.map((subject) => {
            const grade = grades[student.id]?.[subject.id];
            if (curriculumType === "cbc") {
              return grade?.marks || grade?.cbc_performance_level || "";
            } else {
              return grade?.score || "";
            }
          }),
          subjects
            .map((subject) => {
              const grade = grades[student.id]?.[subject.id];
              return grade?.teacher_remarks || "";
            })
            .join("; "),
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `grades_${className}_${termName}_${selectedExamType}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "CSV Export",
        description: "Grades exported to CSV successfully.",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setExportLoading(true);

      const currentDate = new Date().toLocaleDateString();
      const curriculumInfo = curriculumType.toUpperCase();

      const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Grade Sheet - ${className} - ${termName} ${selectedExamType}</title>
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
                <p><strong>Academic Year:</strong> ${
                  academicYearName || "N/A"
                }</p>
                <p><strong>Term:</strong> ${termName || "N/A"}</p>
                <p><strong>Class:</strong> ${className || "N/A"}</p>
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
                  <th>Admission No.</th>
                  ${subjects
                    .map((subject) => `<th>${subject.name}</th>`)
                    .join("")}
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${students
                  .map(
                    (student) => `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.admission_number || "N/A"}</td>
                    ${subjects
                      .map((subject) => {
                        const grade = grades[student.id]?.[subject.id];
                        if (curriculumType === "cbc") {
                          return `<td>${
                            grade?.marks ||
                            grade?.cbc_performance_level ||
                            "N/A"
                          }</td>`;
                        } else {
                          return `<td>${grade?.score || "N/A"}</td>`;
                        }
                      })
                      .join("")}
                    <td>${
                      subjects
                        .map((subject) => {
                          const grade = grades[student.id]?.[subject.id];
                          return grade?.teacher_remarks || "";
                        })
                        .filter((remark) => remark)
                        .join("; ") || "N/A"
                    }</td>
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
  };

  if (students.length === 0 || subjects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <p>No students or subjects available for grading.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Academic Information Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-4 text-sm">
                {academicYearName && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">
                      Academic Year:
                    </span>
                    <span className="text-blue-700">{academicYearName}</span>
                  </div>
                )}
                {termName && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Term:</span>
                    <span className="text-blue-700">{termName}</span>
                  </div>
                )}
                {className && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-blue-900">Class:</span>
                    <span className="text-blue-700">{className}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="font-medium text-blue-900">Exam:</span>
                  <span className="text-blue-700">{selectedExamType}</span>
                </div>
              </div>
              <div className="text-xs text-blue-600">
                {students.length} students • {subjects.length} subjects
              </div>
            </div>
            {!isReadOnly && !isViewOnly && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportToCSV}
                  disabled={exportLoading}
                  className="bg-white hover:bg-green-50 border-green-200 text-green-700"
                >
                  {exportLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportToPDF}
                  disabled={exportLoading}
                  className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                >
                  {exportLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
                {canEditGrades() && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log("Save Draft clicked", {
                          onSaveDraft: !!onSaveDraft,
                        });
                        if (onSaveDraft) {
                          onSaveDraft();
                        } else {
                          handleSave();
                        }
                      }}
                      disabled={savingProp || saving || !canEditGrades()}
                      className="bg-white hover:bg-blue-50"
                    >
                      {savingProp || saving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Draft
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log("Submit for Approval clicked", {
                          onSubmitForApproval: !!onSubmitForApproval,
                        });
                        if (onSubmitForApproval) {
                          onSubmitForApproval();
                        } else {
                          handleSubmit();
                        }
                      }}
                      disabled={
                        submittingProp || submitting || !canEditGrades()
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submittingProp || submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Submit for Approval
                    </Button>
                  </>
                )}
                {!canEditGrades() && existingGradeData.status && (
                  <div className="text-sm text-muted-foreground">
                    {existingGradeData.status === "submitted" && (
                      <span className="text-amber-600">
                        ⚠️ Grades already submitted - only principals can edit
                      </span>
                    )}
                    {existingGradeData.status === "approved" && (
                      <span className="text-green-600">
                        ✅ Grades approved - only principals can edit
                      </span>
                    )}
                    {existingGradeData.status === "released" && (
                      <span className="text-purple-600">
                        🔒 Grades released - cannot be edited
                      </span>
                    )}
                    {existingGradeData.submitted_by &&
                      existingGradeData.submitted_by !== user?.id && (
                        <span className="text-red-600">
                          🔒 These grades were created by another teacher
                        </span>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clean Grading Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Student</TableHead>
                  {subjects.map((subject) => (
                    <TableHead
                      key={subject.id}
                      className="text-center min-w-32"
                    >
                      <div className="font-medium">{subject.name}</div>
                      {subject.code && (
                        <div className="text-xs text-gray-500 font-normal">
                          {subject.code}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      {student.admission_number && (
                        <div className="text-sm text-gray-500">
                          {student.admission_number}
                        </div>
                      )}
                    </TableCell>
                    {subjects.map((subject) => {
                      const grade = grades[student.id]?.[subject.id] || {
                        student_id: student.id,
                        subject_id: subject.id,
                        score: null,
                        marks: 0,
                        cbc_performance_level: "EM",
                        teacher_remarks: "",
                        status: "draft",
                        coursework_score: null,
                        exam_score: null,
                        total_score: null,
                      };

                      return (
                        <TableCell key={subject.id} className="text-center">
                          <div className="space-y-2">
                            {/* Input Field */}
                            {curriculumType === "cbc" ? (
                              <div className="space-y-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={grade.marks || 0}
                                  onChange={(e) => {
                                    const marks = parseInt(e.target.value) || 0;
                                    handleGradeChange(
                                      student.id,
                                      subject.id,
                                      "marks",
                                      marks
                                    );
                                  }}
                                  disabled={
                                    isReadOnly || isViewOnly || !canEditGrades()
                                  }
                                  className="w-16 text-center"
                                  placeholder="0-100"
                                />
                                <Badge
                                  className={getPerformanceLevelColor(
                                    grade.cbc_performance_level || "EM"
                                  )}
                                >
                                  {grade.cbc_performance_level || "EM"}
                                </Badge>
                              </div>
                            ) : curriculumType === "igcse" ? (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-500">
                                  Coursework
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={grade.coursework_score || ""}
                                  onChange={(e) => {
                                    const courseworkScore =
                                      parseInt(e.target.value) || null;
                                    handleGradeChange(
                                      student.id,
                                      subject.id,
                                      "coursework_score",
                                      courseworkScore
                                    );
                                  }}
                                  disabled={
                                    isReadOnly || isViewOnly || !canEditGrades()
                                  }
                                  className="w-16 text-center"
                                  placeholder="0-100"
                                />
                                <div className="text-xs text-gray-500">
                                  Exam
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={grade.exam_score || ""}
                                  onChange={(e) => {
                                    const examScore =
                                      parseInt(e.target.value) || null;
                                    handleGradeChange(
                                      student.id,
                                      subject.id,
                                      "exam_score",
                                      examScore
                                    );
                                  }}
                                  disabled={
                                    isReadOnly || isViewOnly || !canEditGrades()
                                  }
                                  className="w-16 text-center"
                                  placeholder="0-100"
                                />
                                <div className="text-xs text-gray-500">
                                  Total
                                </div>
                                <Badge
                                  className={getIGCSEGradeColor(
                                    grade.letter_grade || "U"
                                  )}
                                >
                                  {grade.total_score || 0} (
                                  {grade.letter_grade || "U"})
                                </Badge>
                              </div>
                            ) : (
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={grade.score || ""}
                                onChange={(e) => {
                                  const score =
                                    parseInt(e.target.value) || null;
                                  handleGradeChange(
                                    student.id,
                                    subject.id,
                                    "score",
                                    score
                                  );
                                }}
                                disabled={
                                  isReadOnly || isViewOnly || !canEditGrades()
                                }
                                className="w-16 text-center"
                                placeholder="0-100"
                              />
                            )}

                            {/* Remarks */}
                            <Textarea
                              value={grade.teacher_remarks || ""}
                              onChange={(e) =>
                                handleGradeChange(
                                  student.id,
                                  subject.id,
                                  "teacher_remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Remarks..."
                              disabled={
                                isReadOnly || isViewOnly || !canEditGrades()
                              }
                              className="w-full text-xs min-h-[40px] resize-none"
                            />
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
