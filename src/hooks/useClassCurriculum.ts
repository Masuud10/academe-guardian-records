import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectCurriculumType, validateCurriculumType } from '@/utils/curriculum-detector';

export type CurriculumType = 'standard' | 'cbc' | 'igcse';

interface ClassCurriculumData {
  id: string;
  name: string;
  curriculum_type?: string;
  school_id?: string;
}

export const useClassCurriculum = (classId: string | null) => {
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassCurriculumData | null>(null);

  const fetchClassCurriculum = useCallback(async () => {
    if (!classId) {
      console.log('🎓 useClassCurriculum: No classId provided, using standard curriculum');
      setCurriculumType('standard');
      setLoading(false);
      setError(null);
      setClassData(null);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log('🎓 useClassCurriculum: Fetching curriculum for class:', classId);

      // Get curriculum type from the specific class
      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('id, name, curriculum_type, school_id')
        .eq('id', classId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching class curriculum type:', fetchError);
        setError('Failed to fetch class curriculum type');
        setCurriculumType('standard');
        setClassData(null);
        return;
      }

      if (!data) {
        console.warn('⚠️ No class data found for classId:', classId);
        setError('Class not found');
        setCurriculumType('standard');
        setClassData(null);
        return;
      }

      setClassData(data);

      // Use curriculum_type field only
      const curriculumValue = data?.curriculum_type;
      
      console.log('🎓 useClassCurriculum: Raw curriculum data:', {
        classId,
        className: data?.name,
        curriculum_type: data?.curriculum_type,
        resolvedValue: curriculumValue,
        dataType: typeof curriculumValue
      });
      
      if (!curriculumValue) {
        console.warn('⚠️ No curriculum type assigned to class:', classId);
        setError('No curriculum type assigned to this class');
        setCurriculumType('standard');
        return;
      }

      // Validate curriculum type
      const validation = validateCurriculumType(curriculumValue);
      
      console.log('🎓 useClassCurriculum: Validation result:', validation);
      
      if (!validation.isValid) {
        console.warn('⚠️ Invalid curriculum type:', validation.error);
        setError(validation.error || 'Invalid curriculum type');
        setCurriculumType('standard' as CurriculumType);
        return;
      }

      const detectedType = detectCurriculumType(curriculumValue);
      console.log('🎓 useClassCurriculum: Final curriculum type:', {
        original: curriculumValue,
        detected: detectedType,
        validation: validation
      });
      
      setCurriculumType(detectedType as CurriculumType);
      setError(null);
    } catch (error) {
      console.error('❌ Error in useClassCurriculum:', error);
      setError('Failed to fetch class curriculum type');
      setCurriculumType('standard');
      setClassData(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchClassCurriculum();
  }, [fetchClassCurriculum]);

  // Function to refresh curriculum data
  const refreshCurriculum = useCallback(() => {
    fetchClassCurriculum();
  }, [fetchClassCurriculum]);

  return { 
    curriculumType, 
    loading, 
    error, 
    classData,
    refreshCurriculum 
  };
}; 