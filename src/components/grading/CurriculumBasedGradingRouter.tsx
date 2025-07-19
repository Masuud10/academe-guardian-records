import React, { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, BookOpen, Target, Award } from "lucide-react";
import { useClassCurriculum } from "@/hooks/useClassCurriculum";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { validateCurriculumType } from "@/utils/curriculum-validator";
import { CleanGradingSheet } from "./CleanGradingSheet";

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

interface GradeData {
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

interface CurriculumBasedGradingRouterProps {
  students: Student[];
  subjects: Subject[];
  grades: Record<string, Record<string, GradeData>>;
  onGradeChange: (
    studentId: string,
    subjectId: string,
    value: GradeData
  ) => void;
  isReadOnly?: boolean;
  selectedClass: string;
  selectedTerm: string;
  selectedExamType: string;
  isPrincipal?: boolean;
  isViewOnly?: boolean;
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

export const CurriculumBasedGradingRouter: React.FC<
  CurriculumBasedGradingRouterProps
> = ({
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
  className,
  termName,
  academicYearName,
  onSaveDraft,
  onSubmitForApproval,
  saving,
  submitting,
}) => {
  const { schoolId } = useSchoolScopedData();

  // Curriculum detection
  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
  } = useClassCurriculum(selectedClass);

  // Validate curriculum type
  const curriculumValidation = useMemo(() => {
    return validateCurriculumType(curriculumType);
  }, [curriculumType]);

  // Debug logging
  useEffect(() => {
    console.log("🎓 CurriculumBasedGradingRouter Debug:", {
      selectedClass,
      curriculumType,
      curriculumLoading,
      curriculumError,
      validation: curriculumValidation,
      isValid: curriculumValidation.isValid,
    });
  }, [
    selectedClass,
    curriculumType,
    curriculumLoading,
    curriculumError,
    curriculumValidation,
  ]);

  // Show loading while detecting curriculum
  if (curriculumLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">
                Detecting Curriculum Type
              </h3>
              <p className="text-sm text-gray-600">
                Analyzing class configuration for grading system...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle curriculum validation errors
  if (!curriculumValidation.isValid) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            Curriculum Configuration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">
              Curriculum Type Issue
            </AlertTitle>
            <AlertDescription className="text-red-700">
              {curriculumValidation.error}
            </AlertDescription>
          </Alert>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              Valid Curriculum Types:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">CBC</span>
                </div>
                <p className="text-xs text-green-700">
                  Competency-Based Curriculum (Kenyan)
                </p>
                <p className="text-xs text-green-600">
                  Performance Levels: EE, ME, AE, BE
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">IGCSE</span>
                </div>
                <p className="text-xs text-purple-700">
                  International General Certificate
                </p>
                <p className="text-xs text-purple-600">
                  Letter Grades: A*, A, B, C, D, E, F, G, U
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Standard</span>
                </div>
                <p className="text-xs text-blue-700">
                  Traditional 8-4-4 System
                </p>
                <p className="text-xs text-blue-600">
                  Letter Grades: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, E
                </p>
              </div>
            </div>
          </div>

          {curriculumValidation.suggestions && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Suggestions:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {curriculumValidation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">
              Debug Information:
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Class ID:</strong> {selectedClass}
              </p>
              <p>
                <strong>Detected Curriculum:</strong> {curriculumType || "None"}
              </p>
              <p>
                <strong>Term:</strong> {selectedTerm}
              </p>
              <p>
                <strong>Exam Type:</strong> {selectedExamType}
              </p>
              <p>
                <strong>School ID:</strong> {schoolId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Route to appropriate grading sheet based on curriculum type
  const renderGradingSheet = () => {
    return (
      <CleanGradingSheet
        students={students}
        subjects={subjects}
        grades={grades}
        onGradeChange={onGradeChange}
        isReadOnly={isReadOnly}
        selectedClass={selectedClass}
        selectedTerm={selectedTerm}
        selectedExamType={selectedExamType}
        isPrincipal={isPrincipal}
        isViewOnly={isViewOnly}
        curriculumType={curriculumType}
        className={className}
        termName={termName}
        academicYearName={academicYearName}
        onSaveDraft={onSaveDraft}
        onSubmitForApproval={onSubmitForApproval}
        saving={saving}
        submitting={submitting}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Render the appropriate grading sheet */}
      {renderGradingSheet()}
    </div>
  );
};
