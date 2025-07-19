
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TeacherAnalyticsSummaryData {
  avgGrade: number | null;
  gradesSubmitted: number | null;
  gradesExpected: number | null;
  attendanceRate: number | null;
}

const fetchTeacherAnalyticsSummary = async (userId: string | undefined, schoolId: string | null): Promise<TeacherAnalyticsSummaryData> => {
  if (!userId || !schoolId) {
    return {
      avgGrade: null,
      gradesSubmitted: null,
      gradesExpected: null,
      attendanceRate: null,
    };
  }

  try {
    // Fetch teacher's assigned classes from subject_teacher_assignments
    const { data: teacherAssignments, error: tcErr } = await supabase
      .from("subject_teacher_assignments")
      .select("class_id")
      .eq("teacher_id", userId)
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .not("class_id", "is", null);
      
    if (tcErr) {
      console.error("Teacher assignments fetch error:", tcErr);
      throw new Error("Failed to load class assignments.");
    }
    
    if (!teacherAssignments || teacherAssignments.length === 0) {
        return { avgGrade: null, gradesSubmitted: null, gradesExpected: null, attendanceRate: null };
    }

    const classIds = [...new Set(teacherAssignments.map(row => row.class_id))];

    // Fetch analytics data from actual grades and attendance tables
    const [
        gradesRes,
        attendanceRes
    ] = await Promise.all([
        supabase
          .from("grades")
          .select("percentage, status, submitted_by")
          .in("class_id", classIds)
          .eq('school_id', schoolId)
          .in('status', ['approved', 'released', 'submitted']),
        supabase
          .from("attendance")
          .select("status, class_id")
          .in("class_id", classIds)
          .eq('school_id', schoolId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
    ]);

    if (gradesRes.error) {
      console.error("Grades fetch error:", gradesRes.error);
      throw new Error("Failed to fetch grades data.");
    }
    
    if (attendanceRes.error) {
      console.error("Attendance fetch error:", attendanceRes.error);
      throw new Error("Failed to fetch attendance data.");
    }

    // Calculate average grade from actual grades
    let avgGrade: number | null = null;
    const validGrades = gradesRes.data?.filter(g => g.percentage !== null && !isNaN(Number(g.percentage))) || [];
    if (validGrades.length > 0) {
        const total = validGrades.reduce((sum, g) => sum + Number(g.percentage), 0);
        avgGrade = Math.round(total / validGrades.length);
    }

    // Count grades submitted by this teacher vs expected
    const teacherGrades = gradesRes.data?.filter(g => g.submitted_by === userId) || [];
    const submittedCount = teacherGrades.filter(g => ['submitted', 'approved', 'released'].includes(g.status)).length;
    
    // Calculate attendance rate
    let attendanceRate: number | null = null;
    const attendanceData = attendanceRes.data || [];
    if (attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        attendanceRate = Math.round((presentCount / attendanceData.length) * 100);
    }

    return {
        avgGrade,
        gradesSubmitted: submittedCount,
        gradesExpected: gradesRes.data?.length || 0,
        attendanceRate,
    };
  } catch (err: any) {
    console.error("Error fetching teacher analytics summary:", err);
    throw err;
  }
};


export const useTeacherAnalyticsSummary = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data, isLoading, error } = useQuery<TeacherAnalyticsSummaryData, Error>({
    queryKey: ['teacherAnalyticsSummary', user?.id, schoolId],
    queryFn: () => fetchTeacherAnalyticsSummary(user?.id, schoolId),
    enabled: !!user?.id && !!schoolId,
  });

  return { 
    summary: data ?? { avgGrade: null, gradesSubmitted: null, gradesExpected: null, attendanceRate: null }, 
    loading: isLoading, 
    error: error?.message || null 
  };
};
