
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateUuid, validateSchoolAccess } from '@/utils/uuidValidation';

interface FinanceOfficerAnalyticsData {
  keyMetrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingAmount: number;
    totalMpesaPayments: number;
    collectionRate: number;
    totalStudents: number;
    defaultersCount: number;
  };
  feeCollectionData: Array<{
    class: string;
    collected: number;
    expected: number;
    percentage: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    amount: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  defaultersList: Array<{
    student_name: string;
    admission_number: string;
    outstanding_amount: number;
    class_name: string;
    days_overdue: number;
  }>;
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['finance-officer-analytics', user?.school_id, filters],
    queryFn: async (): Promise<FinanceOfficerAnalyticsData> => {
      // CRITICAL SECURITY FIX: Enhanced authorization validation
      if (!user) {
        throw new Error('User authentication required');
      }

      // Enhanced role validation for finance officers
      if (!['finance_officer', 'principal', 'school_director', 'hr', 'elimisha_admin', 'edufam_admin'].includes(user.role)) {
        throw new Error('Insufficient permissions to view financial analytics');
      }

      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      
      // CRITICAL: Validate finance officer authorization using server-side function
      const { data: authResult, error: authError } = await supabase.rpc(
        'is_finance_officer_authorized_for_school', 
        { p_school_id: validSchoolId }
      );

      if (authError || !authResult) {
        throw new Error('Unauthorized access to financial data');
      }

      console.log('🔍 Finance Analytics: Fetching data for school:', validSchoolId);

      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        // Use Promise.allSettled for parallel execution with better error handling
        const [
          feesResult,
          mpesaResult,
          studentsResult,
          expensesResult
        ] = await Promise.allSettled([
          // Simplified fees query to avoid relationship issues
          supabase
            .from('fees')
            .select(`
              id,
              amount,
              paid_amount,
              due_date,
              status,
              category,
              student_id,
              class_id
            `)
            .eq('school_id', validSchoolId)
            .not('amount', 'is', null)
            .not('id', 'is', null)
            .limit(500),

          // Simple MPESA query
          supabase
            .from('mpesa_transactions')
            .select('amount_paid, transaction_date, transaction_status')
            .eq('school_id', validSchoolId)
            .eq('transaction_status', 'Success')
            .not('amount_paid', 'is', null)
            .limit(200),

          // Students count only
          supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', validSchoolId)
            .eq('is_active', true),

          // Simple expenses query
          supabase
            .from('expenses')
            .select('category, amount, date')
            .eq('school_id', validSchoolId)
            .not('amount', 'is', null)
            .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .limit(100)
        ]);

        clearTimeout(timeoutId);

        // Process results with safe fallbacks
        const fees = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];
        const mpesaTransactions = mpesaResult.status === 'fulfilled' ? mpesaResult.value.data || [] : [];
        const studentsCount = studentsResult.status === 'fulfilled' ? studentsResult.value.count || 0 : 0;
        const expenses = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];

        // Get student and class data separately to avoid relationship issues
        const studentIds = [...new Set(fees.map(fee => fee.student_id).filter(Boolean))];
        const classIds = [...new Set(fees.map(fee => fee.class_id).filter(Boolean))];

        const [studentsData, classesData] = await Promise.allSettled([
          studentIds.length > 0 ? supabase
            .from('students')
            .select('id, name, admission_number, class_id')
            .in('id', studentIds)
            .eq('school_id', validSchoolId)
            .limit(200) : Promise.resolve({ data: [] }),
          
          classIds.length > 0 ? supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds)
            .eq('school_id', validSchoolId)
            .limit(50) : Promise.resolve({ data: [] })
        ]);

        const students = studentsData.status === 'fulfilled' ? studentsData.value.data || [] : [];
        const classes = classesData.status === 'fulfilled' ? classesData.value.data || [] : [];

        // Create lookup maps
        const studentMap = new Map(students.map(s => [s.id, s]));
        const classMap = new Map(classes.map(c => [c.id, c]));

        // Calculate metrics efficiently
        const totalRevenue = fees.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
        const totalCollected = fees.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
        const outstandingAmount = Math.max(0, totalRevenue - totalCollected);
        const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => sum + (Number(txn.amount_paid) || 0), 0);
        const collectionRate = totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0;

        // Calculate defaulters efficiently
        const today = new Date();
        const defaultersList = fees
          .filter(fee => {
            if (!fee.due_date || !fee.amount) return false;
            
            try {
              const dueDate = new Date(fee.due_date);
              const isPastDue = dueDate < today;
              const feeAmount = Number(fee.amount || 0);
              const paidAmount = Number(fee.paid_amount || 0);
              return isPastDue && feeAmount > paidAmount;
            } catch {
              return false;
            }
          })
          .slice(0, 10)
          .map(fee => {
            const student = studentMap.get(fee.student_id);
            const studentClass = classMap.get(fee.class_id);
            
            return {
              student_name: student?.name || 'Unknown Student',
              admission_number: student?.admission_number || 'N/A',
              outstanding_amount: Number(fee.amount || 0) - Number(fee.paid_amount || 0),
              class_name: studentClass?.name || 'Unknown Class',
              days_overdue: Math.floor((today.getTime() - new Date(fee.due_date!).getTime()) / (1000 * 60 * 60 * 24))
            };
          });

        // Process fee collection by class
        const classCollectionMap = new Map<string, { collected: number; expected: number }>();
        fees.forEach(fee => {
          const studentClass = classMap.get(fee.class_id);
          const className = studentClass?.name || 'Unknown Class';
          const current = classCollectionMap.get(className) || { collected: 0, expected: 0 };
          
          current.expected += Number(fee.amount || 0);
          current.collected += Number(fee.paid_amount || 0);
          
          classCollectionMap.set(className, current);
        });

        const feeCollectionData = Array.from(classCollectionMap.entries())
          .slice(0, 10)
          .map(([className, data]) => ({
            class: className,
            collected: data.collected,
            expected: data.expected,
            percentage: data.expected > 0 ? Math.round((data.collected / data.expected) * 100) : 0
          }));

        // Process daily transactions (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyMap = new Map<string, number>();
        mpesaTransactions
          .filter(txn => {
            if (!txn.transaction_date) return false;
            const txnDate = new Date(txn.transaction_date);
            return txnDate >= thirtyDaysAgo;
          })
          .forEach(txn => {
            const dateKey = new Date(txn.transaction_date!).toISOString().split('T')[0];
            const current = dailyMap.get(dateKey) || 0;
            dailyMap.set(dateKey, current + Number(txn.amount_paid || 0));
          });

        const dailyTransactions = Array.from(dailyMap.entries())
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-30);

        // Process expense breakdown
        const expenseMap = new Map<string, number>();
        expenses.forEach(expense => {
          const category = expense.category || 'Other';
          const current = expenseMap.get(category) || 0;
          expenseMap.set(category, current + Number(expense.amount || 0));
        });

        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
        const totalExpenses = Array.from(expenseMap.values()).reduce((sum, amount) => sum + amount, 0);
        const expenseBreakdown = Array.from(expenseMap.entries())
          .slice(0, 6)
          .map(([category, amount], index) => ({
            category,
            amount,
            percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
            color: colors[index % colors.length]
          }));

        return {
          keyMetrics: {
            totalRevenue,
            totalCollected,
            outstandingAmount,
            totalMpesaPayments,
            collectionRate: Math.min(100, Math.max(0, collectionRate)),
            totalStudents: studentsCount,
            defaultersCount: defaultersList.length
          },
          feeCollectionData,
          dailyTransactions,
          expenseBreakdown,
          defaultersList
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    enabled: !!(user?.school_id),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: false, // Disable automatic refetching
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.message.includes('Invalid') || error.message.includes('null')) {
        return false;
      }
      return failureCount < 1; // Only retry once
    },
  });
};
