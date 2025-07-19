import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useSchoolCurriculum } from "@/hooks/useSchoolCurriculum";
import { getGradingPermissions } from "@/utils/grading-permissions";
import { UserRole } from "@/types/user";
import GradeActionButtons from "./GradeActionButtons";
import { useGradeSubmissionMutation } from "@/hooks/useOptimizedGradeQuery";
import GradeModalHeader from "./grades/GradeModalHeader";
import GradeFormFields from "./grades/GradeFormFields";
import PrincipalStatusSelector from "./grades/PrincipalStatusSelector";
import CurriculumModalSwitcher from "./grades/CurriculumModalSwitcher";
import GradeDataLoader from "./grades/GradeDataLoader";

interface GradesModalProps {
  onClose: () => void;
  userRole: string;
}

const GRADING_ROLES: UserRole[] = [
  "school_director",
  "principal",
  "teacher",
  "parent",
  "finance_officer",
];

const getValidUserRole = (role: string | undefined): UserRole => {
  return GRADING_ROLES.includes(role as UserRole)
    ? (role as UserRole)
    : "teacher";
};

const GradesModal = ({ onClose, userRole }: GradesModalProps) => {
  const { user } = useAuth();
  const { curriculumType, loading: curriculumLoading } = useSchoolCurriculum();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [status, setStatus] = useState<
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "released"
  >("draft");
  const [cbcLevel, setCbcLevel] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { toast } = useToast();

  const resolvedUserRole = getValidUserRole(user?.role);
  const permissions = getGradingPermissions(resolvedUserRole);

  const gradeSubmissionMutation = useGradeSubmissionMutation();

  // Show loading while detecting curriculum
  if (curriculumLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span>Loading curriculum settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle curriculum-specific modals - FIXED: Use correct curriculum routing
  if (curriculumType && curriculumType !== "standard") {
    console.log("🎓 Routing to curriculum-specific modal:", curriculumType);
    return (
      <CurriculumModalSwitcher
        curriculumType={curriculumType}
        onClose={onClose}
        userRole={resolvedUserRole}
      />
    );
  }

  const resetForm = () => {
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedTerm("");
    setSelectedExamType("");
    setScore("");
    setMaxScore("100");
    setSelectedStudent("");
    setStatus("draft");
    setCbcLevel("");
    setFormError(null);
  };

  const validateForm = () => {
    const isCBC = curriculumType === "cbc";

    if (!selectedClass) {
      setFormError("Please select a class");
      return false;
    }
    if (!selectedSubject) {
      setFormError("Please select a subject");
      return false;
    }
    if (!selectedTerm) {
      setFormError("Please select a term");
      return false;
    }
    if (!selectedExamType) {
      setFormError("Please select an exam type");
      return false;
    }
    if (!selectedStudent) {
      setFormError("Please select a student");
      return false;
    }
    if (isCBC && !cbcLevel) {
      setFormError("Please select a CBC performance level");
      return false;
    }
    if (!isCBC && !score) {
      setFormError("Please enter a score");
      return false;
    }
    if (!isCBC && (!maxScore || parseFloat(maxScore) <= 0)) {
      setFormError("Please enter a valid maximum score");
      return false;
    }
    if (!isCBC && parseFloat(score) > parseFloat(maxScore)) {
      setFormError("Score cannot be greater than maximum score");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    // Check permissions
    if (!(permissions.canCreateGrades || permissions.canEditGrades)) {
      setFormError("You don't have permission to create or edit grades.");
      return;
    }

    setLoading(true);

    try {
      const isCBC = curriculumType === "cbc";

      const gradeData = {
        student_id: selectedStudent,
        subject_id: selectedSubject,
        class_id: selectedClass,
        term: selectedTerm,
        exam_type: selectedExamType,
        status: resolvedUserRole === "teacher" ? "submitted" : status,
        curriculum_type: curriculumType || "standard",
        ...(isCBC
          ? {
              cbc_performance_level: cbcLevel,
              score: null,
              max_score: null,
              percentage: null,
            }
          : {
              score: parseFloat(score),
              max_score: parseFloat(maxScore),
              percentage: (parseFloat(score) / parseFloat(maxScore)) * 100,
            }),
      };

      await gradeSubmissionMutation.mutateAsync(gradeData);

      toast({
        title: "Success",
        description: `Grade submitted successfully using ${
          curriculumType?.toUpperCase() || "STANDARD"
        } curriculum.`,
      });

      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error submitting grade:", error);
      setFormError(
        error.message || "Failed to submit grade. Please try again."
      );

      toast({
        title: "Error",
        description:
          error.message || "Failed to submit grade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = () => {
    toast({
      title: "Release Results",
      description: "Release logic would go here.",
    });
  };

  const isTeacher = resolvedUserRole === "teacher";
  const isPrincipal = resolvedUserRole === "principal";

  const canOverride = permissions.canOverrideGrades && isPrincipal;
  const canRelease = permissions.canReleaseResults && isPrincipal;
  const canApprove = permissions.canApproveGrades && isPrincipal;
  const canSubmit = isTeacher || isPrincipal;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <GradeModalHeader
          curriculumType={curriculumType || "standard"}
          isTeacher={isTeacher}
          isPrincipal={isPrincipal}
          permissions={{
            canSubmitGrades: permissions.canSubmitGrades,
            canApproveGrades: permissions.canApproveGrades,
            canOverrideGrades: permissions.canOverrideGrades,
            canReleaseResults: permissions.canReleaseResults,
          }}
        />

        <div className="space-y-6">
          {formError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <GradeDataLoader
            user={user}
            selectedClass={selectedClass}
            setClasses={setClasses}
            setSubjects={setSubjects}
            setStudents={setStudents}
            setFormError={setFormError}
          />

          <GradeFormFields
            curriculumType={curriculumType}
            classes={classes}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            subjects={subjects}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            students={students}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            selectedTerm={selectedTerm}
            setSelectedTerm={setSelectedTerm}
            selectedExamType={selectedExamType}
            setSelectedExamType={setSelectedExamType}
            score={score}
            setScore={setScore}
            maxScore={maxScore}
            setMaxScore={setMaxScore}
            cbcLevel={cbcLevel}
            setCbcLevel={setCbcLevel}
            canInput={canSubmit}
            isPrincipal={isPrincipal}
            canOverride={canOverride}
          />

          {isPrincipal && (
            <PrincipalStatusSelector
              status={status}
              setStatus={setStatus}
              canRelease={canRelease}
            />
          )}
        </div>

        <DialogFooter>
          <GradeActionButtons
            onClose={onClose}
            onSubmit={handleSubmit}
            loading={loading}
            permissions={{
              canInput: canSubmit,
              canSubmit: permissions.canSubmitGrades,
              canApprove: canApprove,
              canRelease: canRelease,
              canOverride: canOverride,
            }}
            role={isTeacher ? "teacher" : "principal"}
            isPrincipal={isPrincipal}
            isTeacher={isTeacher}
            canRelease={canRelease}
            handleRelease={handleRelease}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradesModal;
