
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { validateUuid, validateSchoolAccess, createUuidError } from '@/utils/uuidValidation';

interface SecureFinanceMetrics {
  totalRevenue: number;
  totalCollected: number;
  outstandingAmount: number;
  totalMpesaPayments: number;
  collectionRate: number;
  totalStudents: number;
  defaultersCount: number;
}

export const useSecureFinanceMetrics = () => {
  const [metrics, setMetrics] = useState<SecureFinanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSecureMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔒 Starting secure finance metrics fetch');

      // GUARD CLAUSE 1: Validate user authentication
      if (!user) {
        throw new Error('Authentication required to access finance metrics');
      }

      // GUARD CLAUSE 2: Validate school access
      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw createUuidError('Finance Metrics Access', schoolValidation);
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      console.log('✅ Finance metrics school access validated:', validSchoolId);

      // GUARD CLAUSE 3: Verify school exists
      const { data: schoolCheck, error: schoolCheckError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('id', validSchoolId)
        .single();

      if (schoolCheckError || !schoolCheck) {
        console.error('School verification failed:', schoolCheckError);
        throw new Error('School not found or access denied');
      }

      console.log('✅ School verified for finance metrics:', schoolCheck.name);

      // Secure fees data fetch with proper UUID
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('amount, paid_amount, due_date, status')
        .eq('school_id', validSchoolId);

      if (feesError) {
        console.error('Error fetching fees with validated UUID:', feesError);
        throw new Error(`Failed to fetch fees data: ${feesError.message}`);
      }

      // Secure students count fetch
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', validSchoolId)
        .eq('is_active', true);

      if (studentsError) {
        console.warn('Students fetch warning:', studentsError);
      }

      // Secure MPESA transactions fetch
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .eq('school_id', validSchoolId)
        .eq('payment_method', 'mpesa');

      if (mpesaError) {
        console.warn('MPESA data fetch warning:', mpesaError);
      }

      // Calculate metrics with safe defaults
      const fees = feesData || [];
      const students = studentsData || [];
      const mpesaTransactions = mpesaData || [];

      const totalFees = fees.reduce((sum, fee) => {
        const amount = Number(fee.amount || 0);
        return sum + amount;
      }, 0);

      const totalPaid = fees.reduce((sum, fee) => {
        const paidAmount = Number(fee.paid_amount || 0);
        return sum + paidAmount;
      }, 0);

      const outstandingAmount = totalFees - totalPaid;
      
      const totalMpesaPayments = mpesaTransactions.reduce((sum, txn) => {
        const amount = Number(txn.amount || 0);
        return sum + amount;
      }, 0);

      const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;
      const totalStudents = students.length;

      // Calculate defaulters safely
      const today = new Date();
      const defaultersList = fees.filter(fee => {
        if (!fee.due_date) return false;
        const dueDate = new Date(fee.due_date);
        const isPastDue = dueDate < today;
        const feeAmount = Number(fee.amount || 0);
        const paidAmount = Number(fee.paid_amount || 0);
        const hasOutstanding = feeAmount > paidAmount;
        return isPastDue && hasOutstanding;
      });

      const calculatedMetrics = {
        totalRevenue: totalFees,
        totalCollected: totalPaid,
        outstandingAmount,
        totalMpesaPayments,
        collectionRate,
        totalStudents,
        defaultersCount: defaultersList.length
      };

      console.log('✅ Secure finance metrics calculated successfully:', calculatedMetrics);
      setMetrics(calculatedMetrics);

    } catch (err: any) {
      console.error('Secure finance metrics error:', err);
      setError(err);
      // Set safe default metrics on error
      setMetrics({
        totalRevenue: 0,
        totalCollected: 0,
        outstandingAmount: 0,
        totalMpesaPayments: 0,
        collectionRate: 0,
        totalStudents: 0,
        defaultersCount: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecureMetrics();
  }, [user?.school_id]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchSecureMetrics
  };
};
