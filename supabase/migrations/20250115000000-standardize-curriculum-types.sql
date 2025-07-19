-- Standardize curriculum types across all tables
-- This migration ensures all curriculum types are stored consistently

-- 1. Standardize classes table curriculum_type
UPDATE public.classes 
SET curriculum_type = 'cbc' 
WHERE LOWER(curriculum_type) IN ('cbc', 'competency_based', 'competency-based', 'competency based', 'kenyan cbc', 'kenya cbc');

UPDATE public.classes 
SET curriculum_type = 'igcse' 
WHERE LOWER(curriculum_type) IN ('igcse', 'cambridge', 'cambridge igcse', 'international', 'british');

UPDATE public.classes 
SET curriculum_type = 'standard' 
WHERE LOWER(curriculum_type) IN ('standard', 'traditional', '8-4-4', '844', 'kenyan standard', 'kenya standard')
   OR curriculum_type IS NULL;

-- 2. Standardize schools table curriculum_type
UPDATE public.schools 
SET curriculum_type = 'cbc' 
WHERE LOWER(curriculum_type) IN ('cbc', 'competency_based', 'competency-based', 'competency based', 'kenyan cbc', 'kenya cbc');

UPDATE public.schools 
SET curriculum_type = 'igcse' 
WHERE LOWER(curriculum_type) IN ('igcse', 'cambridge', 'cambridge igcse', 'international', 'british');

UPDATE public.schools 
SET curriculum_type = 'standard' 
WHERE LOWER(curriculum_type) IN ('standard', 'traditional', '8-4-4', '844', 'kenyan standard', 'kenya standard')
   OR curriculum_type IS NULL;

-- 3. Standardize subjects table curriculum_type
UPDATE public.subjects 
SET curriculum_type = 'cbc' 
WHERE LOWER(curriculum_type) IN ('cbc', 'competency_based', 'competency-based', 'competency based', 'kenyan cbc', 'kenya cbc');

UPDATE public.subjects 
SET curriculum_type = 'igcse' 
WHERE LOWER(curriculum_type) IN ('igcse', 'cambridge', 'cambridge igcse', 'international', 'british');

UPDATE public.subjects 
SET curriculum_type = 'standard' 
WHERE LOWER(curriculum_type) IN ('standard', 'traditional', '8-4-4', '844', 'kenyan standard', 'kenya standard')
   OR curriculum_type IS NULL;

-- 4. Standardize grades table curriculum_type
UPDATE public.grades 
SET curriculum_type = 'cbc' 
WHERE LOWER(curriculum_type) IN ('cbc', 'competency_based', 'competency-based', 'competency based', 'kenyan cbc', 'kenya cbc');

UPDATE public.grades 
SET curriculum_type = 'igcse' 
WHERE LOWER(curriculum_type) IN ('igcse', 'cambridge', 'cambridge igcse', 'international', 'british');

UPDATE public.grades 
SET curriculum_type = 'standard' 
WHERE LOWER(curriculum_type) IN ('standard', 'traditional', '8-4-4', '844', 'kenyan standard', 'kenya standard')
   OR curriculum_type IS NULL;

-- 5. Update constraints to ensure only valid curriculum types
ALTER TABLE public.classes 
DROP CONSTRAINT IF EXISTS classes_curriculum_type_check;

ALTER TABLE public.classes 
ADD CONSTRAINT classes_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'standard'));

ALTER TABLE public.schools 
DROP CONSTRAINT IF EXISTS schools_curriculum_type_check;

ALTER TABLE public.schools 
ADD CONSTRAINT schools_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'standard'));

ALTER TABLE public.subjects 
DROP CONSTRAINT IF EXISTS subjects_curriculum_type_check;

ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'standard'));

ALTER TABLE public.grades 
DROP CONSTRAINT IF EXISTS grades_curriculum_type_check;

ALTER TABLE public.grades 
ADD CONSTRAINT grades_curriculum_type_check 
CHECK (curriculum_type IN ('cbc', 'igcse', 'standard'));

-- 6. Set default values for any remaining NULL values
UPDATE public.classes SET curriculum_type = 'standard' WHERE curriculum_type IS NULL;
UPDATE public.schools SET curriculum_type = 'standard' WHERE curriculum_type IS NULL;
UPDATE public.subjects SET curriculum_type = 'standard' WHERE curriculum_type IS NULL;
UPDATE public.grades SET curriculum_type = 'standard' WHERE curriculum_type IS NULL;

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_curriculum_type ON public.classes(curriculum_type);
CREATE INDEX IF NOT EXISTS idx_schools_curriculum_type ON public.schools(curriculum_type);
CREATE INDEX IF NOT EXISTS idx_subjects_curriculum_type ON public.subjects(curriculum_type);
CREATE INDEX IF NOT EXISTS idx_grades_curriculum_type ON public.grades(curriculum_type);

-- 8. Add comments for documentation
COMMENT ON COLUMN public.classes.curriculum_type IS 'Curriculum type: cbc (Competency-Based Curriculum), igcse (International General Certificate), standard (Traditional)';
COMMENT ON COLUMN public.schools.curriculum_type IS 'Curriculum type: cbc (Competency-Based Curriculum), igcse (International General Certificate), standard (Traditional)';
COMMENT ON COLUMN public.subjects.curriculum_type IS 'Curriculum type: cbc (Competency-Based Curriculum), igcse (International General Certificate), standard (Traditional)';
COMMENT ON COLUMN public.grades.curriculum_type IS 'Curriculum type: cbc (Competency-Based Curriculum), igcse (International General Certificate), standard (Traditional)'; 