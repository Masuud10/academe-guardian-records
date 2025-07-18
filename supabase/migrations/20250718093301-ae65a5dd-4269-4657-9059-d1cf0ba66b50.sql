-- Create function to get HR users by school
CREATE OR REPLACE FUNCTION public.get_hr_users_by_school(school_param UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  school_id UUID,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.email, 
    p.name, 
    p.role, 
    p.school_id, 
    p.status,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.role = 'hr' 
    AND p.school_id = school_param 
    AND p.status = 'active'
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add performance index for HR user queries
CREATE INDEX IF NOT EXISTS idx_profiles_role_school_status
ON public.profiles (role, school_id, status);

-- Create a function to check and fix HR user assignments
CREATE OR REPLACE FUNCTION public.check_hr_user_assignments()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  school_id UUID,
  status TEXT,
  issue TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.name,
    p.school_id,
    p.status,
    CASE 
      WHEN p.school_id IS NULL THEN 'Missing school_id'
      WHEN p.status != 'active' THEN 'Status not active'
      ELSE 'OK'
    END as issue
  FROM public.profiles p
  WHERE p.role = 'hr'
  ORDER BY p.email;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update any HR users with missing school_id to use the first available school
UPDATE public.profiles 
SET school_id = (SELECT id FROM public.schools ORDER BY created_at LIMIT 1)
WHERE role = 'hr' AND school_id IS NULL;

-- Ensure all HR users have active status
UPDATE public.profiles 
SET status = 'active', updated_at = now()
WHERE role = 'hr' AND (status IS NULL OR status != 'active');