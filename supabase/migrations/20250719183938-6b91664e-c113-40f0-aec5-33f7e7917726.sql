-- Fix RLS policies for leave_requests table
-- Policy 1: Allows users to see and manage ONLY their OWN leave requests
DROP POLICY IF EXISTS "Allow users to manage their own leave requests" ON public.leave_requests;
CREATE POLICY "Allow users to manage their own leave requests"
ON public.leave_requests FOR ALL
USING ( auth.uid() = requester_id );

-- Policy 2: Allows HR users to see ALL leave requests within THEIR school
DROP POLICY IF EXISTS "Allow HR to manage all leave requests in their school" ON public.leave_requests;
CREATE POLICY "Allow HR to manage all leave requests in their school"
ON public.leave_requests FOR ALL
USING ( 
  -- Check if user is HR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'hr'
  AND 
  -- Check if requester is in same school as HR user
  (SELECT school_id FROM public.profiles WHERE id = auth.uid()) = 
  (SELECT school_id FROM public.profiles WHERE id = requester_id)
);