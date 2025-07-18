import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { EnhancedReportService, EnhancedReportData, ReportFilters, ExportOptions } from '@/services/enhancedReportService';

export interface ReportType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  requiresFilters?: boolean;
  availableForRoles: string[];
}

export const useEnhancedReportGeneration = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  
  const [reportData, setReportData] = useState<EnhancedReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Role-based report type configurations
  const getReportTypes = useCallback((): Record<string, ReportType[]> => {
    if (!user?.role) return {};

    const baseReportTypes: Record<string, ReportType[]> = {
      academic: [
        {
          id: 'academic-performance',
          name: 'Academic Performance Report',
          description: 'Comprehensive analysis of student academic performance',
          category: 'academic',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        },
        {
          id: 'student-progress',
          name: 'Student Progress Report',
          description: 'Individual student progress tracking and analysis',
          category: 'academic',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher', 'parent']
        },
        {
          id: 'class-performance',
          name: 'Class Performance Report',
          description: 'Class-wise academic performance analysis',
          category: 'academic',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        },
        {
          id: 'subject-analysis',
          name: 'Subject Analysis Report',
          description: 'Subject-wise performance breakdown',
          category: 'academic',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        },
        {
          id: 'exam-results',
          name: 'Exam Results Summary',
          description: 'Comprehensive exam results analysis',
          category: 'academic',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        }
      ],
      attendance: [
        {
          id: 'attendance-summary',
          name: 'Attendance Summary',
          description: 'School-wide attendance statistics and trends',
          category: 'attendance',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        },
        {
          id: 'class-attendance',
          name: 'Class Attendance Report',
          description: 'Class-specific attendance tracking',
          category: 'attendance',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher']
        },
        {
          id: 'student-attendance',
          name: 'Student Attendance Report',
          description: 'Individual student attendance records',
          category: 'attendance',
          requiresFilters: true,
          availableForRoles: ['principal', 'teacher', 'parent']
        }
      ],
      financial: [
        {
          id: 'fee-collection',
          name: 'Fee Collection Report',
          description: 'Complete fee collection analysis and tracking',
          category: 'financial',
          requiresFilters: true,
          availableForRoles: ['principal', 'finance_officer']
        },
        {
          id: 'outstanding-fees',
          name: 'Outstanding Fees Report',
          description: 'Students with pending fees and defaulter tracking',
          category: 'financial',
          requiresFilters: true,
          availableForRoles: ['principal', 'finance_officer']
        },
        {
          id: 'payment-history',
          name: 'Payment History Report',
          description: 'Detailed payment transaction history',
          category: 'financial',
          requiresFilters: true,
          availableForRoles: ['principal', 'finance_officer']
        },
        {
          id: 'financial-summary',
          name: 'Financial Summary',
          description: 'Comprehensive financial overview and analytics',
          category: 'financial',
          requiresFilters: true,
          availableForRoles: ['principal', 'finance_officer', 'school_director']
        },
        {
          id: 'revenue-analysis',
          name: 'Revenue Analysis',
          description: 'Revenue trends and detailed analysis',
          category: 'financial',
          requiresFilters: true,
          availableForRoles: ['principal', 'finance_officer', 'school_director']
        }
      ],
      system: [
        {
          id: 'system-overview',
          name: 'System Overview',
          description: 'Complete platform statistics and performance metrics',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'school-registration',
          name: 'School Registration Report',
          description: 'All registered schools with detailed analytics',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'user-analytics',
          name: 'User Analytics',
          description: 'Platform-wide user statistics and behavior',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'security-audit',
          name: 'Security Audit Report',
          description: 'System security logs and access patterns',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'database-performance',
          name: 'Database Performance',
          description: 'Database metrics and optimization insights',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'platform-revenue',
          name: 'Platform Revenue',
          description: 'Overall platform revenue and subscription analytics',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'financial-overview',
          name: 'Financial Overview',
          description: 'Platform financial health and metrics',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        },
        {
          id: 'subscription-analytics',
          name: 'Subscription Analytics',
          description: 'School subscription patterns and trends',
          category: 'system',
          requiresFilters: false,
          availableForRoles: ['edufam_admin']
        }
      ]
    };

    // Filter report types based on user role
    const filteredTypes: Record<string, ReportType[]> = {};
    
    Object.entries(baseReportTypes).forEach(([category, reports]) => {
      const availableReports = reports.filter(report => 
        report.availableForRoles.includes(user.role)
      );
      
      if (availableReports.length > 0) {
        filteredTypes[category] = availableReports;
      }
    });

    return filteredTypes;
  }, [user?.role]);

  // Get available report categories for current user
  const getAvailableCategories = useCallback(() => {
    const reportTypes = getReportTypes();
    return Object.keys(reportTypes);
  }, [getReportTypes]);

  // Get report types for a specific category
  const getReportTypesByCategory = useCallback((category: string): ReportType[] => {
    const reportTypes = getReportTypes();
    return reportTypes[category] || [];
  }, [getReportTypes]);

  // Generate report
  const generateReport = useCallback(async (params: {
    reportType: string;
    filters?: ReportFilters;
    includeCharts?: boolean;
    includeSummary?: boolean;
  }) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate report type is available for user role
      const allReportTypes = Object.values(getReportTypes()).flat();
      const reportTypeConfig = allReportTypes.find(rt => rt.id === params.reportType);
      
      if (!reportTypeConfig) {
        throw new Error(`Report type '${params.reportType}' is not available for your role`);
      }

      // Prepare generation parameters
      const generationParams: any = {
        reportType: params.reportType,
        userRole: user.role,
        userId: user.id,
        filters: params.filters
      };

      // Add role-specific parameters
      if (['principal', 'finance_officer', 'school_director'].includes(user.role)) {
        if (!schoolId) {
          throw new Error('School ID is required for this report type');
        }
        generationParams.schoolId = schoolId;
      }

      if (user.role === 'teacher') {
        // For teachers, we need to get their assigned classes
        // This would typically come from a teacher-class assignment table
        // For now, we'll use a placeholder - in real implementation, fetch from database
        const assignedClassId = 'placeholder-class-id'; // Replace with actual logic
        if (!assignedClassId) {
          throw new Error('No assigned classes found for teacher');
        }
        generationParams.classId = assignedClassId;
      }

      if (user.role === 'parent') {
        // For parents, we need to get their children's student IDs
        // This would typically come from a parent-student relationship table
        // For now, we'll use a placeholder - in real implementation, fetch from database
        const childStudentId = 'placeholder-student-id'; // Replace with actual logic
        if (!childStudentId) {
          throw new Error('No children found for parent');
        }
        generationParams.studentId = childStudentId;
      }

      console.log('📊 Generating report with params:', generationParams);

      // Generate the report
      const report = await EnhancedReportService.generateReport(generationParams);
      
      setReportData(report);
      
      toast({
        title: 'Report Generated',
        description: `${reportTypeConfig.name} has been generated successfully.`,
      });

      return report;

    } catch (err: any) {
      console.error('Error generating report:', err);
      const errorMessage = err.message || 'Failed to generate report';
      setError(errorMessage);
      
      toast({
        title: 'Report Generation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, schoolId, getReportTypes, toast]);

  // Export report
  const exportReport = useCallback(async (options: ExportOptions) => {
    if (!reportData) {
      throw new Error('No report data available for export');
    }

    try {
      await EnhancedReportService.exportReport(reportData, options);
      
      toast({
        title: 'Report Exported',
        description: `Report has been exported as ${options.format.toUpperCase()}.`,
      });

    } catch (err: any) {
      console.error('Error exporting report:', err);
      const errorMessage = err.message || 'Failed to export report';
      
      toast({
        title: 'Export Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      throw err;
    }
  }, [reportData, toast]);

  // Refresh report
  const refreshReport = useCallback(async (filters?: ReportFilters) => {
    if (!reportData) return;
    
    await generateReport({
      reportType: reportData.title.toLowerCase().replace(/\s+/g, '-'),
      filters
    });
  }, [reportData, generateReport]);

  // Clear report
  const clearReport = useCallback(() => {
    setReportData(null);
    setError(null);
  }, []);

  // Get current academic context
  const getCurrentAcademicContext = useCallback(async () => {
    if (!schoolId) return null;
    
    try {
      return await EnhancedReportService.getCurrentAcademicContext(schoolId);
    } catch (error) {
      console.error('Error getting academic context:', error);
      return null;
    }
  }, [schoolId]);

  // Get available filters for report type
  const getAvailableFilters = useCallback(async (reportType: string) => {
    const academicContext = await getCurrentAcademicContext();
    
    const baseFilters = {
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        to: new Date()
      },
      academicYear: academicContext?.academicYear || new Date().getFullYear().toString(),
      term: academicContext?.term || 'Term 1'
    };

    // Add role-specific filters
    if (['principal', 'teacher'].includes(user?.role || '')) {
      // Add class and subject filters
      // In real implementation, fetch from database
      return {
        ...baseFilters,
        classId: 'all',
        subjectId: 'all'
      };
    }

    if (user?.role === 'parent') {
      // Add student filter
      // In real implementation, fetch from database
      return {
        ...baseFilters,
        studentId: 'all'
      };
    }

    return baseFilters;
  }, [user?.role, getCurrentAcademicContext]);

  return {
    // State
    reportData,
    isLoading,
    error,
    
    // Report types
    getReportTypes,
    getAvailableCategories,
    getReportTypesByCategory,
    
    // Actions
    generateReport,
    exportReport,
    refreshReport,
    clearReport,
    
    // Utilities
    getCurrentAcademicContext,
    getAvailableFilters
  };
}; 