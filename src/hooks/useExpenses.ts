
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  expensesService, 
  Expense, 
  CreateExpenseData, 
  UpdateExpenseData, 
  ExpenseFilters 
} from '@/services/expensesService';

export const useExpenses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    categoryBreakdown: {} as Record<string, number>,
  });

  // Load expenses with filters
  const loadExpenses = useCallback(async (filters?: ExpenseFilters) => {
    if (!user || user.role !== 'finance_officer') {
      setError('Access denied: Only finance officers can view expenses');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await expensesService.getExpenses(filters);
      setExpenses(data);

      // Calculate stats
      const totalExpenses = data.length;
      const totalAmount = data.reduce((sum, expense) => sum + expense.amount, 0);
      const categoryBreakdown: Record<string, number> = {};
      data.forEach(expense => {
        categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.amount;
      });

      setStats({
        totalExpenses,
        totalAmount,
        categoryBreakdown,
      });
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create expense
  const createExpense = useCallback(async (expenseData: CreateExpenseData) => {
    if (!user || user.role !== 'finance_officer') {
      throw new Error('Access denied: Only finance officers can create expenses');
    }

    try {
      const newExpense = await expensesService.createExpense(expenseData, user.school_id!);
      setExpenses(prev => [newExpense, ...prev]);
      
      // Update stats
      setStats(prev => ({
        totalExpenses: prev.totalExpenses + 1,
        totalAmount: prev.totalAmount + newExpense.amount,
        categoryBreakdown: {
          ...prev.categoryBreakdown,
          [newExpense.category]: (prev.categoryBreakdown[newExpense.category] || 0) + newExpense.amount,
        },
      }));

      toast({
        title: 'Success',
        description: 'Expense created successfully',
      });

      return newExpense;
    } catch (err) {
      console.error('Error creating expense:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create expense',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Update expense
  const updateExpense = useCallback(async (id: string, updateData: UpdateExpenseData) => {
    if (!user || user.role !== 'finance_officer') {
      throw new Error('Access denied: Only finance officers can update expenses');
    }

    try {
      const updatedExpense = await expensesService.updateExpense(id, updateData);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));

      // Update stats if amount or category changed
      if (updateData.amount !== undefined || updateData.category !== undefined) {
        setStats(prev => {
          const oldExpense = expenses.find(e => e.id === id);
          if (!oldExpense) return prev;

          const oldAmount = oldExpense.amount;
          const newAmount = updateData.amount ?? oldExpense.amount;
          const oldCategory = oldExpense.category;
          const newCategory = updateData.category ?? oldExpense.category;

          const newCategoryBreakdown = { ...prev.categoryBreakdown };
          
          // Remove from old category
          if (oldCategory !== newCategory) {
            newCategoryBreakdown[oldCategory] = (newCategoryBreakdown[oldCategory] || 0) - oldAmount;
          }
          
          // Add to new category
          newCategoryBreakdown[newCategory] = (newCategoryBreakdown[newCategory] || 0) + newAmount;

          return {
            ...prev,
            totalAmount: prev.totalAmount - oldAmount + newAmount,
            categoryBreakdown: newCategoryBreakdown,
          };
        });
      }

      toast({
        title: 'Success',
        description: 'Expense updated successfully',
      });

      return updatedExpense;
    } catch (err) {
      console.error('Error updating expense:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update expense',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast, expenses]);

  // Delete expense
  const deleteExpense = useCallback(async (id: string) => {
    if (!user || user.role !== 'finance_officer') {
      throw new Error('Access denied: Only finance officers can delete expenses');
    }

    try {
      await expensesService.deleteExpense(id);
      
      // Remove from state and update stats
      setExpenses(prev => {
        const expenseToDelete = prev.find(e => e.id === id);
        if (!expenseToDelete) return prev;

        setStats(prevStats => ({
          totalExpenses: prevStats.totalExpenses - 1,
          totalAmount: prevStats.totalAmount - expenseToDelete.amount,
          categoryBreakdown: {
            ...prevStats.categoryBreakdown,
            [expenseToDelete.category]: (prevStats.categoryBreakdown[expenseToDelete.category] || 0) - expenseToDelete.amount,
          },
        }));

        return prev.filter(e => e.id !== id);
      });

      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting expense:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete expense',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Export expenses
  const exportExpenses = useCallback(async (format: 'excel' | 'pdf', filters?: ExpenseFilters) => {
    if (!user || user.role !== 'finance_officer') {
      throw new Error('Access denied: Only finance officers can export expenses');
    }

    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'excel') {
        blob = await expensesService.exportToExcel(filters);
        filename = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        blob = await expensesService.exportToPDF(filters);
        filename = `expenses-${new Date().toISOString().split('T')[0]}.pdf`;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: `Expenses exported to ${format.toUpperCase()} successfully`,
      });
    } catch (err) {
      console.error('Error exporting expenses:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to export expenses',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Submit expense for approval
  const submitExpenseForApproval = useCallback(async (expenseData: CreateExpenseData) => {
    if (!user || user.role !== 'finance_officer') {
      throw new Error('Access denied: Only finance officers can submit expenses for approval');
    }

    try {
      const newExpense = await expensesService.submitExpenseForApproval(expenseData, user.school_id!);
      setExpenses(prev => [newExpense, ...prev]);
      
      // Update stats
      setStats(prev => ({
        totalExpenses: prev.totalExpenses + 1,
        totalAmount: prev.totalAmount + newExpense.amount,
        categoryBreakdown: {
          ...prev.categoryBreakdown,
          [newExpense.category]: (prev.categoryBreakdown[newExpense.category] || 0) + newExpense.amount,
        },
      }));

      return newExpense;
    } catch (err) {
      console.error('Error submitting expense for approval:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to submit expense for approval',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Get pending expenses (for School Director)
  const getPendingExpenses = useCallback(async () => {
    if (!user || !['school_director', 'principal'].includes(user.role)) {
      throw new Error('Access denied: Only school directors/owners can view pending expenses');
    }

    try {
      const data = await expensesService.getPendingExpenses();
      return data;
    } catch (err) {
      console.error('Error getting pending expenses:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to get pending expenses',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Approve expense (for School Director)
  const approveExpense = useCallback(async (id: string) => {
    if (!user || !['school_director', 'principal'].includes(user.role)) {
      throw new Error('Access denied: Only school directors/owners can approve expenses');
    }

    try {
      const updatedExpense = await expensesService.approveExpense(id);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));

      toast({
        title: 'Success',
        description: 'Expense approved successfully',
      });

      return updatedExpense;
    } catch (err) {
      console.error('Error approving expense:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to approve expense',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  // Reject expense (for School Director)
  const rejectExpense = useCallback(async (id: string, rejectionReason: string) => {
    if (!user || !['school_director', 'principal'].includes(user.role)) {
      throw new Error('Access denied: Only school directors/owners can reject expenses');
    }

    try {
      const updatedExpense = await expensesService.rejectExpense(id, rejectionReason);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));

      toast({
        title: 'Success',
        description: 'Expense rejected successfully',
      });

      return updatedExpense;
    } catch (err) {
      console.error('Error rejecting expense:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to reject expense',
        variant: 'destructive',
      });
      throw err;
    }
  }, [user, toast]);

  return {
    expenses,
    loading,
    error,
    stats,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    exportExpenses,
    submitExpenseForApproval,
    getPendingExpenses,
    approveExpense,
    rejectExpense,
  };
};
