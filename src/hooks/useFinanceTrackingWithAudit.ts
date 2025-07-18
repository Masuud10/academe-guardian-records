
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { usePaymentAuditLogger } from './usePaymentAuditLogger';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFinanceTrackingWithAudit = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackFinanceTransaction } = useAnalyticsTracking();
  const { logPaymentProcessing } = usePaymentAuditLogger();
  const { user } = useAuth();

  const processPayment = async (paymentData: any) => {
    // CRITICAL SECURITY FIX: Enhanced authentication and authorization
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Enhanced role validation
    if (!['finance_officer', 'principal', 'school_director', 'hr', 'elimisha_admin', 'edufam_admin'].includes(user.role)) {
      return { success: false, error: 'Insufficient permissions to process payments' };
    }

    // Check rate limiting for MPESA transactions
    const rateLimit = rateLimiter.checkLimit({
      ...RateLimiter.MPESA_TRANSACTION_LIMIT,
      identifier: `mpesa_${user.id}`
    });

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      const error = `Rate limit exceeded. Please wait ${resetMinutes} minutes before processing another payment.`;
      
      // Log failed attempt
      await logPaymentProcessing(paymentData, false, error);
      return { success: false, error };
    }

    setIsProcessing(true);
    try {
      // Enhanced validation
      if (!paymentData.student_id) {
        throw new Error("student_id is required to process a payment");
      }

      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error("Valid payment amount is required");
      }
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('school_id')
        .eq('id', paymentData.student_id)
        .single();

      if (studentError) throw studentError;
      if (!studentData?.school_id) throw new Error("Could not find school for the student");

      // CRITICAL: Validate finance officer authorization for this school
      const { data: authResult, error: authError } = await supabase.rpc(
        'is_finance_officer_authorized_for_school', 
        { p_school_id: studentData.school_id }
      );

      if (authError || !authResult) {
        throw new Error('Unauthorized access to process payments for this school');
      }

      // Enhanced validation using server-side function
      const validationData = {
        school_id: studentData.school_id,
        amount: paymentData.amount,
        student_id: paymentData.student_id
      };

      const { data: validationResult, error: validationError } = await supabase.rpc(
        'validate_finance_officer_transaction', 
        { p_transaction_data: validationData }
      );

      if (validationError || !(validationResult as any)?.valid) {
        throw new Error((validationResult as any)?.error || 'Transaction validation failed');
      }

      const completePaymentData = {
        ...paymentData,
        school_id: studentData.school_id,
        processed_at: new Date().toISOString(),
        processed_by: user.id,
      };

      // Process payment in database
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert(completePaymentData)
        .select()
        .single();

      if (error) throw error;

      // Track the finance transaction event
      await trackFinanceTransaction({
        student_id: paymentData.student_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_type: paymentData.transaction_type
      });

      // Log successful transaction
      await logPaymentProcessing(completePaymentData, true);

      return { success: true, data };
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      
      // Log failed transaction
      await logPaymentProcessing(paymentData, false, error.message);
      
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    isProcessing
  };
};
