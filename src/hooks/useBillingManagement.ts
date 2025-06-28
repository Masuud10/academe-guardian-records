import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BillingManagementService } from '@/services/billing/billingManagementService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useBillingRecords = (filters?: {
  status?: string;
  school_name?: string;
  month?: string;
  year?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-records', filters],
    queryFn: async () => {
      console.log('🔄 useBillingRecords: Starting fetch with filters:', filters);
      
      try {
        const result = await BillingManagementService.getAllBillingRecords(filters);
        console.log('✅ useBillingRecords: Service returned:', { success: !result.error, dataLength: result.data?.length });
        
        if (result.error) {
          const errorMessage = typeof result.error === 'string' 
            ? result.error 
            : result.error?.message || 'Failed to fetch billing records';
          console.error('❌ useBillingRecords: Service error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        console.log('✅ useBillingRecords: Successfully processed data');
        return result.data || [];
      } catch (error) {
        console.error('❌ useBillingRecords: Query function error:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`🔄 useBillingRecords: Retry attempt ${failureCount}`, error);
      // Don't retry timeout errors more than once
      if (error?.message?.includes('timed out') && failureCount >= 1) {
        return false;
      }
      return failureCount < 2; // Limit retry attempts
    },
    refetchInterval: false,
    // Add timeout handling at query level
    meta: {
      timeout: 30000 // 30 second timeout
    }
  });
};

export const useSchoolBillingRecords = (schoolId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-records', schoolId],
    queryFn: async () => {
      if (!schoolId) throw new Error('School ID is required');
      const result = await BillingManagementService.getSchoolBillingRecords(schoolId);
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to fetch school billing records';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin' && !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useBillingStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      const result = await BillingManagementService.getBillingStats();
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to fetch billing statistics';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes for stats
    refetchOnWindowFocus: false,
    retry: 2,
    refetchInterval: false,
  });
};

export const useSchoolBillingSummaries = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['school-billing-summaries'],
    queryFn: async () => {
      const result = await BillingManagementService.getSchoolBillingSummaries();
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to fetch school billing summaries';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const usePaymentHistory = (schoolId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-history', schoolId],
    queryFn: async () => {
      const result = await BillingManagementService.getPaymentHistory(schoolId);
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to fetch payment history';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useAllSchools = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['all-schools'],
    queryFn: async () => {
      const result = await BillingManagementService.getAllSchools();
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to fetch schools';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 10 * 60 * 1000, // 10 minutes - schools don't change often
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useInvoiceData = (recordId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invoice-data', recordId],
    queryFn: async () => {
      if (!recordId) throw new Error('Record ID is required');
      const result = await BillingManagementService.generateInvoiceData(recordId);
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to generate invoice data';
        throw new Error(errorMessage);
      }
      return result.data;
    },
    enabled: user?.role === 'edufam_admin' && !!recordId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useBillingActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBillingStatus = useMutation({
    mutationFn: async ({ recordId, status, paymentMethod }: { recordId: string; status: string; paymentMethod?: string }) => {
      const result = await BillingManagementService.updateBillingStatus(recordId, status, paymentMethod);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to update billing status';
        throw new Error(errorMessage);
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Billing record status has been updated successfully.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
      queryClient.invalidateQueries({ queryKey: ['payment-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing status.",
        variant: "destructive",
      });
    },
    // Add timeout for mutations
    meta: {
      timeout: 30000
    }
  });

  const createSetupFee = useMutation({
    mutationFn: async (schoolId: string) => {
      const result = await BillingManagementService.createSetupFee(schoolId);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to create setup fee';
        throw new Error(errorMessage);
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Setup Fee Created",
        description: "Setup fee has been created for the school.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Setup Fee Creation Failed",
        description: error.message || "Failed to create setup fee.",
        variant: "destructive",
      });
    },
    meta: {
      timeout: 30000
    }
  });

  const createMonthlySubscriptions = useMutation({
    mutationFn: async () => {
      const result = await BillingManagementService.createMonthlySubscriptions();
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to create monthly subscriptions';
        throw new Error(errorMessage);
      }
      return result;
    },
    onSuccess: (result) => {
      // Fixed: Add proper null check and safer property access
      const recordsCreated = result && typeof result === 'object' && 'recordsCreated' in result 
        ? Number(result.recordsCreated) || 0 
        : 0;
      toast({
        title: "Subscription Fees Created",
        description: `Created ${recordsCreated} subscription fee records.`,
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Subscriptions",
        description: error.message || "Failed to create monthly subscription fees.",
        variant: "destructive",
      });
    },
    meta: {
      timeout: 30000
    }
  });

  const updateBillingRecord = useMutation({
    mutationFn: async ({ recordId, updates }: { recordId: string; updates: any }) => {
      const result = await BillingManagementService.updateBillingRecord(recordId, updates);
      if (!result.success) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'Failed to update billing record';
        throw new Error(errorMessage);
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Record Updated",
        description: "Billing record has been updated successfully.",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-records'] });
      queryClient.invalidateQueries({ queryKey: ['school-billing-summaries'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update billing record.",
        variant: "destructive",
      });
    },
    meta: {
      timeout: 30000
    }
  });

  return {
    updateBillingStatus,
    createSetupFee,
    createMonthlySubscriptions,
    updateBillingRecord
  };
};
