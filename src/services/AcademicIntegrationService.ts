import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcademicContext {
  academic_year_id: string;
  term_id: string;
  class_id?: string;
  subject_id?: string;
  school_id: string;
}

export interface AcademicValidationResult {
  isValid: boolean;
  errors: string[];
  context?: AcademicContext;
}

export interface ModuleIntegrationData {
  examinations: any[];
  attendance: any[];
  grades: any[];
  reports: any[];
  analytics: any;
}

export class AcademicIntegrationService {
  /**
   * Validate academic context and ensure all required relationships exist
   */
  static async validateAcademicContext(
    schoolId: string,
    academicYearId?: string,
    termId?: string,
    classId?: string,
    subjectId?: string
  ): Promise<AcademicValidationResult> {
    const errors: string[] = [];

    try {
      // Get current academic period if not provided
      let currentYearId = academicYearId;
      let currentTermId = termId;

      if (!currentYearId || !currentTermId) {
        const { data: currentPeriod, error: periodError } = await supabase
          .from('academic_years')
          .select(`
            id,
            academic_terms!inner(id)
          `)
          .eq('school_id', schoolId)
          .eq('is_current', true)
          .single();

        if (periodError) {
          errors.push('No current academic period set for this school');
        } else {
          currentYearId = currentYearId || currentPeriod.id;
          currentTermId = currentTermId || currentPeriod.academic_terms[0]?.id;
        }
      }

      if (!currentYearId) {
        errors.push('Academic year is required');
      }

      if (!currentTermId) {
        errors.push('Academic term is required');
      }

      // Validate class exists and belongs to school
      if (classId) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id, name, school_id, curriculum_type')
          .eq('id', classId)
          .eq('school_id', schoolId)
          .single();

        if (classError || !classData) {
          errors.push('Invalid class selected or class does not belong to this school');
        }
      }

      // Validate subject exists and belongs to school
      if (subjectId) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('id, name, school_id, class_id')
          .eq('id', subjectId)
          .eq('school_id', schoolId)
          .single();

        if (subjectError || !subjectData) {
          errors.push('Subject not found or does not belong to this school');
        } else if (classId && subjectData.class_id !== classId) {
          errors.push('Subject is not assigned to this class');
        }
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        errors,
        context: isValid ? {
          academic_year_id: currentYearId!,
          term_id: currentTermId!,
          class_id: classId,
          subject_id: subjectId,
          school_id: schoolId
        } : undefined
      };

    } catch (error: any) {
      console.error('Error validating academic context:', error);
      return {
        isValid: false,
        errors: ['Failed to validate academic context: ' + error.message]
      };
    }
  }

  /**
   * Get comprehensive academic data for a specific context
   */
  static async getAcademicModuleData(
    context: AcademicContext,
    modules: ('examinations' | 'attendance' | 'grades' | 'reports' | 'analytics')[] = []
  ): Promise<ModuleIntegrationData> {
    const result: ModuleIntegrationData = {
      examinations: [],
      attendance: [],
      grades: [],
      reports: [],
      analytics: {}
    };

    try {
      // Get examinations
      if (modules.includes('examinations')) {
        const { data: examinations, error: examError } = await supabase
          .from('examinations')
          .select('*')
          .eq('school_id', context.school_id)
          .eq('academic_year', context.academic_year_id)
          .eq('term', context.term_id)
          .order('start_date', { ascending: false });

        if (!examError) {
          result.examinations = examinations || [];
        }
      }

      // Get attendance
      if (modules.includes('attendance')) {
        let attendanceQuery = supabase
          .from('attendance')
          .select(`
            *,
            students(name, admission_number),
            classes(name)
          `)
          .eq('school_id', context.school_id)
          .eq('academic_year', context.academic_year_id)
          .eq('term', context.term_id);

        if (context.class_id) {
          attendanceQuery = attendanceQuery.eq('class_id', context.class_id);
        }

        const { data: attendance, error: attendanceError } = await attendanceQuery;
        if (!attendanceError) {
          result.attendance = attendance || [];
        }
      }

      // Get grades
      if (modules.includes('grades')) {
        let gradesQuery = supabase
          .from('grades')
          .select('*')
          .eq('school_id', context.school_id)
          .eq('academic_year', context.academic_year_id)
          .eq('term', context.term_id);

        if (context.class_id) {
          gradesQuery = gradesQuery.eq('class_id', context.class_id);
        }

        if (context.subject_id) {
          gradesQuery = gradesQuery.eq('subject_id', context.subject_id);
        }

        const { data: grades, error: gradesError } = await gradesQuery;
        if (!gradesError) {
          result.grades = grades || [];
        }
      }

      // Get reports
      if (modules.includes('reports')) {
        // Skip reports for now since table structure is uncertain
        result.reports = [];
      }

      // Get analytics
      if (modules.includes('analytics')) {
        result.analytics = await this.generateAnalyticsData(context);
      }

      return result;

    } catch (error: any) {
      console.error('Error fetching academic module data:', error);
      throw new Error('Failed to fetch academic module data: ' + error.message);
    }
  }

  /**
   * Generate comprehensive analytics data for the academic context
   */
  static async generateAnalyticsData(context: AcademicContext): Promise<any> {
    try {
      // Get grade distribution
      const { data: grades } = await supabase
        .from('grades')
        .select('percentage, letter_grade')
        .eq('school_id', context.school_id)
        .eq('academic_year', context.academic_year_id)
        .eq('term', context.term_id);

      const gradeDistribution = this.calculateGradeDistribution(grades || []);

      // Get attendance rates
      const { data: attendance } = await supabase
        .from('attendance')
        .select('status, date')
        .eq('school_id', context.school_id)
        .eq('academic_year', context.academic_year_id)
        .eq('term', context.term_id);

      const attendanceRate = this.calculateAttendanceRate(attendance || []);

      // Get subject performance
      const { data: subjectGrades } = await supabase
        .from('grades')
        .select(`
          percentage,
          subjects(name)
        `)
        .eq('school_id', context.school_id)
        .eq('academic_year', context.academic_year_id)
        .eq('term', context.term_id);

      const subjectPerformance = this.calculateSubjectPerformance(subjectGrades || []);

      // Get exam pass rates
      const examPassRate = this.calculateExamPassRate(grades || []);

      return {
        gradeDistribution,
        attendanceRate,
        subjectPerformance,
        examPassRate,
        generatedAt: new Date().toISOString(),
        context
      };

    } catch (error: any) {
      console.error('Error generating analytics data:', error);
      return {
        gradeDistribution: [],
        attendanceRate: 0,
        subjectPerformance: [],
        examPassRate: 0,
        generatedAt: new Date().toISOString(),
        context,
        error: error.message
      };
    }
  }

  /**
   * Calculate grade distribution from grades data
   */
  private static calculateGradeDistribution(grades: any[]): any[] {
    const distribution = new Map<string, number>();
    
    grades.forEach(grade => {
      const letter = grade.letter_grade || 'N/A';
      distribution.set(letter, (distribution.get(letter) || 0) + 1);
    });

    return Array.from(distribution.entries()).map(([grade, count]) => ({
      grade,
      count,
      percentage: grades.length > 0 ? (count / grades.length) * 100 : 0
    }));
  }

  /**
   * Calculate attendance rate from attendance data
   */
  private static calculateAttendanceRate(attendance: any[]): number {
    if (attendance.length === 0) return 0;
    
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return (presentCount / attendance.length) * 100;
  }

  /**
   * Calculate subject performance from grades data
   */
  private static calculateSubjectPerformance(grades: any[]): any[] {
    const subjectMap = new Map<string, number[]>();
    
    grades.forEach(grade => {
      const subjectName = grade.subjects?.name || 'Unknown';
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, []);
      }
      subjectMap.get(subjectName)!.push(grade.percentage || 0);
    });

    return Array.from(subjectMap.entries()).map(([subject, scores]) => ({
      subject,
      average: scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0,
      count: scores.length
    }));
  }

  /**
   * Calculate exam pass rate (assuming 50% is passing)
   */
  private static calculateExamPassRate(grades: any[]): number {
    if (grades.length === 0) return 0;
    
    const passCount = grades.filter(grade => (grade.percentage || 0) >= 50).length;
    return (passCount / grades.length) * 100;
  }

  /**
   * Create examination with proper academic context validation
   */
  static async createExamination(
    examinationData: any,
    context: AcademicContext,
    userId: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Validate context
      const validation = await this.validateAcademicContext(
        context.school_id,
        context.academic_year_id,
        context.term_id
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Create examination with proper context
      const { data, error } = await supabase
        .from('examinations')
        .insert({
          ...examinationData,
          school_id: context.school_id,
          academic_year: context.academic_year_id,
          term: context.term_id,
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };

    } catch (error: any) {
      console.error('Error creating examination:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Record attendance with proper academic context
   */
  static async recordAttendance(
    attendanceData: any[],
    context: AcademicContext,
    userId: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Validate context
      const validation = await this.validateAcademicContext(
        context.school_id,
        context.academic_year_id,
        context.term_id,
        context.class_id
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Add academic context to each attendance record
      const enrichedAttendanceData = attendanceData.map(record => ({
        ...record,
        school_id: context.school_id,
        academic_year: context.academic_year_id,
        term: context.term_id,
        submitted_by: userId,
        submitted_at: new Date().toISOString()
      }));

      // Use upsert to handle existing records
      const { data, error } = await supabase
        .from('attendance')
        .upsert(enrichedAttendanceData, {
          onConflict: 'school_id,class_id,student_id,date,session',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;

      return {
        success: true,
        data
      };

    } catch (error: any) {
      console.error('Error recording attendance:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Save grades with proper academic context and validation
   */
  static async saveGrades(
    gradesData: any[],
    context: AcademicContext,
    userId: string,
    userRole: string
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Validate context
      const validation = await this.validateAcademicContext(
        context.school_id,
        context.academic_year_id,
        context.term_id,
        context.class_id,
        context.subject_id
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Add academic context to each grade record
      const enrichedGradesData = gradesData.map(grade => ({
        ...grade,
        school_id: context.school_id,
        academic_year: context.academic_year_id,
        term: context.term_id,
        submitted_by: userId,
        submitted_at: new Date().toISOString(),
        status: userRole === 'principal' ? 'approved' : 'submitted'
      }));

      // Use upsert to handle existing records
      const { data, error } = await supabase
        .from('grades')
        .upsert(enrichedGradesData, {
          onConflict: 'school_id,student_id,subject_id,class_id,term,exam_type,submitted_by',
          ignoreDuplicates: false
        })
        .select();

      if (error) throw error;

      return {
        success: true,
        data
      };

    } catch (error: any) {
      console.error('Error saving grades:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate report with proper academic context
   */
  static async generateReport(
    reportType: string,
    context: AcademicContext,
    userId: string,
    filters?: any
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Validate context
      const validation = await this.validateAcademicContext(
        context.school_id,
        context.academic_year_id,
        context.term_id
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Generate report data
      const reportData = await this.getAcademicModuleData(context, ['examinations', 'attendance', 'grades']);

      // Return report data without storing to database for now
      const data = {
        school_id: context.school_id,
        academic_year_id: context.academic_year_id,
        term_id: context.term_id,
        report_type: reportType,
        generated_by: userId,
        report_data: JSON.stringify(reportData),
        filters: filters || {},
        generated_at: new Date().toISOString()
      };

      // No error to check since we're not making a database call

      return {
        success: true,
        data: {
          report: data,
          content: reportData
        }
      };

    } catch (error: any) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get real-time analytics for the academic context
   */
  static async getRealTimeAnalytics(
    context: AcademicContext
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const analyticsData = await this.generateAnalyticsData(context);

      return {
        success: true,
        data: analyticsData
      };

    } catch (error: any) {
      console.error('Error getting real-time analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate user permissions for academic operations
   */
  static async validateUserPermissions(
    userId: string,
    schoolId: string,
    operation: string,
    context?: AcademicContext
  ): Promise<{ canPerform: boolean; error?: string }> {
    try {
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('role, school_id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check school access
      if (userProfile.school_id !== schoolId) {
        return {
          canPerform: false,
          error: 'Access denied to this school'
        };
      }

      // Role-based permission checks
      switch (operation) {
        case 'create_examination':
          return {
            canPerform: userProfile.role === 'principal',
            error: userProfile.role !== 'principal' ? 'Only principals can create examinations' : undefined
          };

        case 'record_attendance':
          return {
            canPerform: ['teacher', 'principal'].includes(userProfile.role),
            error: !['teacher', 'principal'].includes(userProfile.role) ? 'Only teachers and principals can record attendance' : undefined
          };

        case 'enter_grades':
          return {
            canPerform: ['teacher', 'principal'].includes(userProfile.role),
            error: !['teacher', 'principal'].includes(userProfile.role) ? 'Only teachers and principals can enter grades' : undefined
          };

        case 'approve_grades':
          return {
            canPerform: userProfile.role === 'principal',
            error: userProfile.role !== 'principal' ? 'Only principals can approve grades' : undefined
          };

        case 'generate_reports':
          return {
            canPerform: ['principal', 'school_director'].includes(userProfile.role),
            error: !['principal', 'school_director'].includes(userProfile.role) ? 'Insufficient permissions to generate reports' : undefined
          };

        case 'view_analytics':
          return {
            canPerform: true, // All authenticated users can view analytics
            error: undefined
          };

        default:
          return {
            canPerform: false,
            error: 'Unknown operation'
          };
      }

    } catch (error: any) {
      console.error('Error validating user permissions:', error);
      return {
        canPerform: false,
        error: 'Permission validation failed'
      };
    }
  }
} 