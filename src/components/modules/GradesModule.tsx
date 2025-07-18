import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { usePermissions } from "@/utils/permissions";
import { useSchoolCurriculum } from "@/hooks/useSchoolCurriculum";
import { UserRole } from "@/types/user";
import GradesAdminSummary from "./GradesAdminSummary";
import ParentGradesView from "../grades/ParentGradesView";
import TeacherGradesModule from "./TeacherGradesModule";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import BulkGradingModal from "../grading/BulkGradingModal";
import NoGradebookPermission from "../grades/NoGradebookPermission";
import BulkGradingQuickAction from "../dashboard/principal/BulkGradingQuickAction";
import PrincipalGradesModule from "./PrincipalGradesModule";
import { Loader2, AlertTriangle } from "lucide-react";

const GradesModule: React.FC = () => {
  const { user } = useAuth();
  const {
    curriculumType,
    loading: curriculumLoading,
    error: curriculumError,
  } = useSchoolCurriculum();
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { hasPermission } = usePermissions(
    user?.role as UserRole,
    user?.school_id
  );

  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [gradesSummary, setGradesSummary] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  // Caching and optimization refs
  const dataFetchedRef = useRef(false);
  const summaryCache = useRef<
    Map<
      string,
      {
        summary: Record<string, unknown> | null;
        schools: { id: string; name: string }[];
      }
    >
  >(new Map());
  const schoolsCache = useRef<{ id: string; name: string }[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

  // Memoize role check to avoid recalculation
  const isSummaryRole = useMemo(() => {
    return (
      user?.role &&
      ["edufam_admin", "principal", "school_director"].includes(user.role)
    );
  }, [user?.role]);

  // Optimized data fetching with proper async/await
  const fetchGradesData = async () => {
    if (!isSummaryRole || !user) {
      setLoadingSummary(false);
      return;
    }

    const now = Date.now();
    const effectiveSchoolId =
      user.role === "edufam_admin" ? schoolFilter : user.school_id;
    const cacheKey = `${user.role}_${effectiveSchoolId || "all"}`;

    // Check cache first
    if (
      summaryCache.current.has(cacheKey) &&
      now - lastFetchTime.current < CACHE_DURATION
    ) {
      console.log("🎓 GradesModule: Using cached data for", cacheKey);
      const cachedData = summaryCache.current.get(cacheKey);
      setGradesSummary(cachedData.summary);
      setSchools(cachedData.schools);
      setLoadingSummary(false);
      return;
    }

    setLoadingSummary(true);
    setErrorSummary(null);

    try {
      console.log("🎓 GradesModule: Fetching fresh data for", cacheKey);

      let schoolsData = schoolsCache.current;
      let summaryData = null;

      // Fetch schools if admin and not cached
      if (user.role === "edufam_admin" && schoolsCache.current.length === 0) {
        const { data: schoolsResponse, error: schoolsError } = await supabase
          .from("schools")
          .select("id, name")
          .order("name");

        if (schoolsError) {
          console.error("🚫 Schools fetch error:", schoolsError);
          throw new Error("Failed to fetch schools list.");
        }
        schoolsData = schoolsResponse || [];
        schoolsCache.current = schoolsData;
      }

      // Fetch grades summary if school is selected
      if (effectiveSchoolId) {
        try {
          const { data: summaryResponse, error: summaryError } = await supabase
            .from("school_grades_summary")
            .select("*")
            .eq("school_id", effectiveSchoolId)
            .maybeSingle();

          if (summaryError) {
            console.error("🚫 Grades summary fetch error:", summaryError);
            // Don't throw error, just set summaryData to null
            summaryData = null;
          } else {
            summaryData = summaryResponse;
          }
        } catch (error) {
          console.error("🚫 Grades summary fetch exception:", error);
          summaryData = null;
        }
      }

      // Cache the results
      summaryCache.current.set(cacheKey, {
        summary: summaryData,
        schools: schoolsData,
      });
      lastFetchTime.current = now;

      setSchools(schoolsData);
      setGradesSummary(summaryData);
    } catch (error: unknown) {
      console.error("🎓 GradesModule: Error fetching data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load grades data.";
      setErrorSummary(errorMessage);
      setGradesSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Only fetch data when dependencies change and avoid duplicate calls
  useEffect(() => {
    if (!user || dataFetchedRef.current) return;

    dataFetchedRef.current = true;
    fetchGradesData();
  }, [isSummaryRole, user?.role, user?.school_id]);

  // Handle school filter changes (only for admins)
  useEffect(() => {
    if (user?.role === "edufam_admin" && dataFetchedRef.current) {
      fetchGradesData();
    }
  }, [schoolFilter]);

  // Reset data fetch flag when user changes
  useEffect(() => {
    dataFetchedRef.current = false;
    summaryCache.current.clear();
    lastFetchTime.current = 0;
  }, [user?.id]);

  const renderForSummaryRole = () => {
    if (loadingSummary) {
      return (
        <div className="p-6 flex items-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading summary...</span>
        </div>
      );
    }
    if (errorSummary) {
      return (
        <Alert variant="destructive" className="my-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Could not load summary</AlertTitle>
          <AlertDescription>{errorSummary}</AlertDescription>
        </Alert>
      );
    }
    if (user?.role === "edufam_admin" && !schoolFilter && schools.length > 0) {
      return (
        <GradesAdminSummary
          schools={schools}
          schoolFilter={schoolFilter}
          setSchoolFilter={setSchoolFilter}
          gradesSummary={null}
          loading={false}
          error={null}
        />
      );
    }
    if (!gradesSummary) {
      const message =
        user?.role === "edufam_admin" && schools.length === 0
          ? "No schools found."
          : "There is no grades summary available for this school.";
      return (
        <Alert className="my-8">
          <AlertTitle>No Summary Data</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }
    return (
      <GradesAdminSummary
        loading={loadingSummary}
        error={null}
        gradesSummary={{
          avg_grade: gradesSummary.average_grade ?? null,
          most_improved_school: "—",
          declining_alerts: 0,
        }}
        schools={schools}
        schoolFilter={schoolFilter}
        setSchoolFilter={setSchoolFilter}
      />
    );
  };

  // Show loading while detecting curriculum
  if (curriculumLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading curriculum settings...</span>
      </div>
    );
  }

  // Show curriculum error if any
  if (curriculumError) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Curriculum Detection Error</AlertTitle>
          <AlertDescription>
            {curriculumError}. Using standard curriculum as fallback.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) return <div>Loading...</div>;

  if (user.role !== "parent" && !hasPermission("view_gradebook")) {
    return <NoGradebookPermission role={user.role} hasPermission={false} />;
  }

  const getCurriculumBadgeColor = () => {
    switch (curriculumType) {
      case "cbc":
        return "bg-green-100 text-green-800 border-green-200";
      case "igcse":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getCurriculumDisplayName = () => {
    switch (curriculumType) {
      case "cbc":
        return "CBC (Competency-Based Curriculum)";
      case "igcse":
        return "IGCSE (International General Certificate)";
      default:
        return "Standard Curriculum";
    }
  };

  console.log(
    "🎓 GradesModule: Rendering with curriculum:",
    curriculumType,
    "for role:",
    user.role
  );

  switch (user.role) {
    case "edufam_admin":
    case "school_director":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              className={`text-xs font-medium ${getCurriculumBadgeColor()}`}
            >
              {getCurriculumDisplayName()}
            </Badge>
          </div>
          {renderForSummaryRole()}
        </div>
      );
    case "principal":
      return <PrincipalGradesModule />;
    case "teacher":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              className={`text-xs font-medium ${getCurriculumBadgeColor()}`}
            >
              {getCurriculumDisplayName()}
            </Badge>
          </div>
          <TeacherGradesModule />
        </div>
      );
    case "parent":
      return <ParentGradesView />;
    default:
      return (
        <div className="p-8">
          <Alert>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access the grades module.
            </AlertDescription>
          </Alert>
        </div>
      );
  }
};

export default GradesModule;
