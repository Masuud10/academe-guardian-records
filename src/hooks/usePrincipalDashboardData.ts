import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PrincipalStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  totalParents: number;
  pendingApprovals: number;
  totalCertificates: number;
  attendanceRate: number;
  revenueThisMonth: number;
  outstandingFees: number;
  recentGrades: Array<{
    id: string;
    status: string;
    created_at: string;
  }>;
}

// Export alias for backward compatibility
export type StatsType = PrincipalStats;

export const usePrincipalDashboardData = (schoolId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<PrincipalStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    totalParents: 0,
    pendingApprovals: 0,
    totalCertificates: 0,
    attendanceRate: 0,
    revenueThisMonth: 0,
    outstandingFees: 0,
    recentGrades: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Refs for cleanup and abort control
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const fetchDashboardData = useCallback(async () => {
    if (!schoolId || !user?.id) {
      console.log('🔍 usePrincipalDashboardData: Missing schoolId or user');
      setLoading(false);
      setError(null);
      setLoadingTimeout(false);
      return;
    }

    // CRITICAL SECURITY: Validate user is a principal or school director for this school
    if (!['principal', 'school_director'].includes(user.role) || user.school_id !== schoolId) {
      console.error('🔍 usePrincipalDashboardData: Access denied - user is not principal/school_director for this school');
      setError('Access denied: You are not authorized to view this school\'s data');
      setLoading(false);
      setLoadingTimeout(false);
      return;
    }

    // Validate school ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(schoolId)) {
      console.error('🔍 usePrincipalDashboardData: Invalid school ID format:', schoolId);
      setError('Invalid school ID format');
      setLoading(false);
      setLoadingTimeout(false);
      return;
    }

    // Clean up previous requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutRef.current !== null) {
      clearTimeout(Number(timeoutRef.current));
    }

    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        setLoading(true);
        setError(null);
        setLoadingTimeout(false);
        
        console.log('🔍 usePrincipalDashboardData: Fetching data for school:', schoolId);

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        // Set timeout for loading state
        timeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current) {
            setLoadingTimeout(true);
            console.warn('🔍 Principal dashboard data loading timeout - showing partial data');
          }
        }, 8000); // Increased to 8 seconds for better reliability

        // Enhanced queries with explicit school validation for security
        const queries = {
          students: supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .abortSignal(abortControllerRef.current.signal),
          teachers: supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'teacher')
            .eq('status', 'active')
            .abortSignal(abortControllerRef.current.signal),
          parents: supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'parent')
            .eq('status', 'active')
            .abortSignal(abortControllerRef.current.signal),
          classes: supabase
            .from('classes')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .abortSignal(abortControllerRef.current.signal),
          subjects: supabase
            .from('subjects')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .abortSignal(abortControllerRef.current.signal),
          grades: supabase
            .from('grades')
            .select('id, status, created_at')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })
            .limit(10)
            .abortSignal(abortControllerRef.current.signal),
          certificates: supabase
            .from('certificates')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .abortSignal(abortControllerRef.current.signal),
          attendance: supabase
            .from('attendance')
            .select('status')
            .eq('school_id', schoolId)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
            .limit(1000)
            .abortSignal(abortControllerRef.current.signal),
          fees: supabase
            .from('fees')
            .select('amount, paid_amount, status')
            .eq('school_id', schoolId)
            .limit(100) // Reduced limit for better performance
            .abortSignal(abortControllerRef.current.signal)
        };

        const results = await Promise.allSettled([
          queries.students,
          queries.teachers, 
          queries.parents,
          queries.classes,
          queries.subjects,
          queries.grades,
          queries.certificates,
          queries.attendance,
          queries.fees
        ]);

        // Clear timeout
        if (timeoutRef.current !== null) {
          clearTimeout(Number(timeoutRef.current));
          timeoutRef.current = null;
        }

        // Check if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        // Process results safely with enhanced error handling
        const [studentsResult, teachersResult, parentsResult, classesResult, subjectsResult, gradesResult, certificatesResult, attendanceResult, feesResult] = results;
        
        // ENHANCED: Check for security errors in each result
        for (const result of results) {
          if (result.status === 'rejected' && result.reason?.message?.includes('policy')) {
            throw new Error('Access denied: Insufficient permissions to view school data');
          }
        }
        
        const totalStudents = studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0;
        const totalTeachers = teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0;
        const totalParents = parentsResult.status === 'fulfilled' ? (parentsResult.value.count || 0) : 0;
        const totalClasses = classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0;
        const totalSubjects = subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0;
        const totalCertificates = certificatesResult.status === 'fulfilled' ? (certificatesResult.value.count || 0) : 0;

        // Calculate pending approvals with enhanced validation
        const pendingApprovals = gradesResult.status === 'fulfilled' && gradesResult.value.data 
          ? gradesResult.value.data.filter((grade: { status: string }) => grade.status === 'submitted').length 
          : 0;

        // Calculate attendance rate with better data handling
        const attendanceData = attendanceResult.status === 'fulfilled' && attendanceResult.value.data ? attendanceResult.value.data : [];
        const presentCount = attendanceData.filter((record: { status: string }) => record.status === 'present').length;
        const attendanceRate = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

        // Calculate financial data with better error handling and validation
        const feesData = feesResult.status === 'fulfilled' && feesResult.value.data ? feesResult.value.data : [];
        const totalFees = feesData.reduce((sum: number, fee: { amount: number | null }) => {
          const amount = parseFloat(String(fee.amount || 0));
          return isNaN(amount) ? sum : sum + amount;
        }, 0);
        const totalPaid = feesData.reduce((sum: number, fee: { paid_amount: number | null }) => {
          const paid = parseFloat(String(fee.paid_amount || 0));
          return isNaN(paid) ? sum : sum + paid;
        }, 0);
        const outstandingFees = Math.max(0, totalFees - totalPaid);

        // Get recent grades with validation
        const recentGrades = gradesResult.status === 'fulfilled' && gradesResult.value.data ? gradesResult.value.data : [];

        const newStats: PrincipalStats = {
          totalStudents,
          totalTeachers,
          totalParents,
          totalClasses,
          totalSubjects,
          pendingApprovals,
          totalCertificates,
          attendanceRate,
          revenueThisMonth: totalPaid,
          outstandingFees,
          recentGrades
        };

        console.log('✅ usePrincipalDashboardData: Fetched stats:', newStats);
        
        if (isMountedRef.current) {
          setStats(newStats);
          setLoading(false);
          setLoadingTimeout(false);
        }
        return; // Success, exit loop
      } catch (error: unknown) {
        attempts++;
        const isNetwork = error instanceof Error && error.message && (
          error.message.includes('Network') || error.message.includes('timeout')
        );
        const isAccess = error instanceof Error && error.message.includes('Access denied');
        
        // Don't retry access denied errors
        if (isAccess) {
          console.error('❌ usePrincipalDashboardData: Access denied:', error);
          if (isMountedRef.current) {
            setError(error instanceof Error ? error.message : 'Access denied');
            setLoading(false);
            setLoadingTimeout(false);
          }
          break;
        }
        
        if (attempts < maxAttempts && isNetwork) {
          console.warn(`Retrying dashboard data fetch (attempt ${attempts + 1})`);
          await new Promise(res => setTimeout(res, 500 * attempts));
          continue;
        }
        console.error('❌ usePrincipalDashboardData: Error fetching data:', error);
        
        // Clear timeout
        if (timeoutRef.current !== null) {
          clearTimeout(Number(timeoutRef.current));
          timeoutRef.current = null;
        }

        if (isMountedRef.current) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
          setError(errorMessage);
          setLoading(false);
          setLoadingTimeout(false);
          
          // Only show toast for non-timeout errors
          if (error instanceof Error && error.name !== 'AbortError' && !isAccess) {
            toast({
              title: "Error",
              description: "Failed to load dashboard data. Please try again.",
              variant: "destructive"
            });
          }
        }
        break;
      }
    }
    
    // Ensure loading is set to false if we somehow exit the loop without setting it
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [schoolId, user?.id, user?.role, user?.school_id, toast]);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Only fetch if we have both schoolId and user
    if (schoolId && user?.id) {
      fetchDashboardData();
    } else {
      // Reset state when dependencies are missing
      setLoading(false);
      setError(null);
      setLoadingTimeout(false);
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalSubjects: 0,
        totalParents: 0,
        pendingApprovals: 0,
        totalCertificates: 0,
        attendanceRate: 0,
        revenueThisMonth: 0,
        outstandingFees: 0,
        recentGrades: []
      });
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current !== null) {
        clearTimeout(Number(timeoutRef.current));
      }
    };
  }, [schoolId, user?.id, fetchDashboardData]);

  return { 
    stats, 
    loading: loading && !loadingTimeout, 
    error: error || null, 
    loadingTimeout,
    refetch: fetchDashboardData 
  };
};