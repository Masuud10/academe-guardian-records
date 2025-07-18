import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useUserGrowthData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-analytics-user-growth'],
    queryFn: () => Promise.resolve([]), // Mock data - returns empty array for school app
    enabled: false, // Disabled for school application
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user growth analytics'
    }
  });
};

export const useSchoolGrowthData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-analytics-school-growth'],
    queryFn: () => Promise.resolve([]), // Mock data - returns empty array for school app
    enabled: false, // Disabled for school application
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load school growth analytics'
    }
  });
};

export const useEnrollmentBySchoolData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-enrollment-by-school'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load enrollment analytics'
    }
  });
};

export const useUserRoleDistributionData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-user-role-distribution'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load user role analytics'
    }
  });
};

export const useCurriculumDistributionData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-curriculum-distribution'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load curriculum analytics'
    }
  });
};

export const useFinancialSummaryData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-financial-summary'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load financial analytics'
    }
  });
};

export const useSystemGrowthTrends = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-system-growth-trends'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load system growth trends'
    }
  });
};

export const usePlatformUsageTrends = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-platform-usage-trends'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load platform usage trends'
    }
  });
};

export const useRevenueAnalytics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-revenue-analytics'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load revenue analytics'
    }
  });
};

export const usePerformanceInsights = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-analytics-performance-insights'],
    queryFn: () => Promise.resolve({ data: [] }), // Mock data
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 2,
    meta: {
      errorMessage: 'Failed to load performance insights'
    }
  });
};
