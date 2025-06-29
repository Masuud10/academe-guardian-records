
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/subject';

export class SubjectDatabaseService {
  static async getSubjects(schoolId: string, classId?: string): Promise<Subject[]> {
    console.log('📚 SubjectDatabaseService.getSubjects called with:', { schoolId, classId });

    if (!schoolId || schoolId.trim() === '') {
      console.error('❌ School ID is required and cannot be empty');
      throw new Error('School ID is required');
    }

    try {
      // Test connection first with shorter timeout
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        console.error('❌ Database connection test failed');
        throw new Error('Database connection failed. Please try again.');
      }

      // Build query with proper validation
      let query = supabase
        .from('subjects')
        .select(`
          *,
          class:classes(id, name),
          teacher:profiles!subjects_teacher_id_fkey(id, name, email)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name')
        .limit(500); // Add reasonable limit

      // Apply class filter if provided and valid
      if (classId && classId !== 'all' && classId.trim() !== '') {
        console.log('📚 SubjectDatabaseService: Filtering by class_id:', classId);
        query = query.eq('class_id', classId);
      }

      console.log('📚 SubjectDatabaseService: Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ SubjectDatabaseService: Database error:', error);
        
        // Handle specific database errors
        if (error.code === 'PGRST116') {
          console.log('📚 SubjectDatabaseService: No subjects found (PGRST116)');
          return [];
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.log('📚 SubjectDatabaseService: No data returned from query');
        return [];
      }

      console.log('✅ SubjectDatabaseService: Successfully fetched', data.length, 'subjects');
      return data;

    } catch (error: any) {
      console.error('❌ SubjectDatabaseService.getSubjects error:', error);
      
      // Don't throw errors for empty results - return empty array instead
      if (error.message?.includes('No subjects found') || 
          error.message?.includes('not found') ||
          error.message?.includes('PGRST116')) {
        console.log('📚 SubjectDatabaseService: Returning empty array for "not found" scenario');
        return [];
      }
      
      // Re-throw actual errors
      throw error;
    }
  }

  // Enhanced connection test with better error handling and shorter timeout
  static async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced timeout to 2 seconds
      
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
        
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Database connection test timed out');
      } else {
        console.error('❌ Database connection test error:', error);
      }
      return false;
    }
  }
}
