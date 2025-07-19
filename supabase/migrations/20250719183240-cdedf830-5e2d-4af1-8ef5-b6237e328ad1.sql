-- Create the definitive, secure PostgreSQL function for complete profile data
CREATE OR REPLACE FUNCTION public.get_my_complete_profile()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    school_id UUID,
    school_name TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    status TEXT,
    salary NUMERIC,
    total_leave_days_per_year INT,
    leave_days_taken INT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.name AS full_name,
    p.email,
    p.role,
    p.school_id,
    s.name AS school_name,
    p.phone,
    p.bio,
    p.avatar_url,
    p.status,
    sed.salary,
    sed.total_leave_days_per_year,
    sed.leave_days_taken
  FROM
    public.profiles p
  LEFT JOIN
    public.schools s ON p.school_id = s.id
  LEFT JOIN
    public.staff_employment_details sed ON p.id = sed.user_id
  WHERE
    p.id = auth.uid()
  LIMIT 1;
$$;