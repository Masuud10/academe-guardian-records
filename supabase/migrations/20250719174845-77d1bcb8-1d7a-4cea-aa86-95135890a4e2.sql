-- Phase 1: Database Schema Expansion for My Profile Feature
-- Creating secure tables for employment details and leave requests

-- Table to store sensitive, one-to-one employment details for staff
CREATE TABLE public.staff_employment_details (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    salary NUMERIC(12, 2),
    total_leave_days_per_year INT NOT NULL DEFAULT 21,
    leave_days_taken INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table to manage the leave request workflow
CREATE TABLE public.leave_requests (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row-Level Security (RLS) - CRITICAL FOR SECURITY
ALTER TABLE public.staff_employment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies: A user can ONLY see and manage their OWN records
CREATE POLICY "Allow users to access their own employment details"
ON public.staff_employment_details FOR ALL
USING ( auth.uid() = user_id );

CREATE POLICY "Allow users to manage their own leave requests"
ON public.leave_requests FOR ALL
USING ( auth.uid() = requester_id );

-- Create indexes for performance
CREATE INDEX idx_staff_employment_details_user_id ON public.staff_employment_details(user_id);
CREATE INDEX idx_leave_requests_requester_id ON public.leave_requests(requester_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_staff_employment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_employment_details_updated_at
  BEFORE UPDATE ON public.staff_employment_details
  FOR EACH ROW EXECUTE FUNCTION update_staff_employment_updated_at();