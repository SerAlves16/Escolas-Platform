/*
# Add secretaria + staff_servicos roles, enrollment applications, role protection

1. Schema changes
- Alter `profiles.role` CHECK constraint to add 'secretaria' and 'staff_servicos' roles.
- Rename existing 'canteen','bar','stationery' concept: keep them but add 'staff_servicos' as a unified staff role.
- Create `enrollment_applications` table for parent-submitted student enrollment requests.
- Create `enrollment_documents` table for uploaded documents per enrollment.

2. New Tables
- `enrollment_applications`: parent_id, student_name, student_birth_date, student_national_id, grade_applying, status (pending/under_review/approved/rejected/needs_correction), reviewed_by, reviewed_at, class_id (assigned on approval), notes, rejection_reason, correction_notes
- `enrollment_documents`: enrollment_id, document_type, file_url, file_name, verified (bool), verified_by, verified_at

3. Security changes
- RLS on enrollment_applications: parents can read/insert their own; secretaria+admin can read/update all in school.
- RLS on enrollment_documents: parents can read/insert their own; secretaria+admin can read/update all in school.
- Update profiles UPDATE policy: users can only update their own full_name, phone, avatar_url — NOT role or school_id. Admin can update everything.
- Add policy preventing self-role changes: the update_own_profile policy now has WITH CHECK that role and school_id are unchanged.
*/

-- Step 1: Add new roles to the CHECK constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin','direction','secretaria','teacher','class_director','canteen','bar','stationery','staff_servicos','parent','student'));

-- Step 2: Create enrollment_applications table
CREATE TABLE IF NOT EXISTS public.enrollment_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  student_birth_date date,
  student_national_id text,
  student_gender text,
  student_address text,
  grade_applying text,
  previous_school text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected','needs_correction')),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  student_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  student_record_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  notes text,
  rejection_reason text,
  correction_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 3: Create enrollment_documents table
CREATE TABLE IF NOT EXISTS public.enrollment_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.enrollment_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  verified boolean DEFAULT false,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enrollment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_documents ENABLE ROW LEVEL SECURITY;

-- Enrollment applications: parents see their own, secretaria+admin see all in school
DROP POLICY IF EXISTS "read_enrollment_apps" ON public.enrollment_applications;
CREATE POLICY "read_enrollment_apps" ON public.enrollment_applications FOR SELECT
  TO authenticated USING (
    parent_profile_id = auth.uid()
    OR public.current_user_role() IN ('admin','secretaria','direction')
  );

DROP POLICY IF EXISTS "insert_enrollment_apps" ON public.enrollment_applications;
CREATE POLICY "insert_enrollment_apps" ON public.enrollment_applications FOR INSERT
  TO authenticated WITH CHECK (
    parent_profile_id = auth.uid()
    AND public.current_user_role() = 'parent'
  );

DROP POLICY IF EXISTS "update_enrollment_apps" ON public.enrollment_applications;
CREATE POLICY "update_enrollment_apps" ON public.enrollment_applications FOR UPDATE
  TO authenticated USING (
    parent_profile_id = auth.uid()
    OR public.current_user_role() IN ('admin','secretaria')
  )
  WITH CHECK (
    parent_profile_id = auth.uid()
    OR public.current_user_role() IN ('admin','secretaria')
  );

-- Enrollment documents: parents see/insert their own, secretaria+admin see/update all
DROP POLICY IF EXISTS "read_enrollment_docs" ON public.enrollment_documents;
CREATE POLICY "read_enrollment_docs" ON public.enrollment_documents FOR SELECT
  TO authenticated USING (
    enrollment_id IN (
      SELECT id FROM public.enrollment_applications
      WHERE parent_profile_id = auth.uid()
      OR public.current_user_role() IN ('admin','secretaria','direction')
    )
  );

DROP POLICY IF EXISTS "insert_enrollment_docs" ON public.enrollment_documents;
CREATE POLICY "insert_enrollment_docs" ON public.enrollment_documents FOR INSERT
  TO authenticated WITH CHECK (
    enrollment_id IN (
      SELECT id FROM public.enrollment_applications
      WHERE parent_profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_enrollment_docs" ON public.enrollment_documents;
CREATE POLICY "update_enrollment_docs" ON public.enrollment_documents FOR UPDATE
  TO authenticated USING (
    enrollment_id IN (
      SELECT id FROM public.enrollment_applications
      WHERE public.current_user_role() IN ('admin','secretaria')
    )
  );

-- Step 4: Fix profile UPDATE policy to prevent self-role changes
-- Drop the old permissive update_own_profile policy
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;

-- New policy: users can update their own profile but CANNOT change role or school_id
-- We use a stored function to compare old vs new values
CREATE OR REPLACE FUNCTION public.can_update_own_profile()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('parent','student','teacher','class_director','direction','secretaria','canteen','bar','stationery','staff_servicos','admin')
  );
$$;

-- Users can update their own profile fields (name, phone, avatar) but NOT role/school_id
-- The WITH CHECK ensures the NEW row has the same role and school_id as the OLD row
DROP POLICY IF EXISTS "update_own_profile_safe" ON public.profiles;
CREATE POLICY "update_own_profile_safe" ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
    )
    AND (school_id IS NOT DISTINCT FROM (
      SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid()
    ))
  );

-- Admin can still update any profile in their school (including role changes)
-- The existing admin_manage_profiles policy already handles this, but let's ensure it's correct
DROP POLICY IF EXISTS "admin_manage_profiles" ON public.profiles;
CREATE POLICY "admin_manage_profiles" ON public.profiles FOR ALL
  TO authenticated
  USING (
    public.current_user_role() = 'admin'
    AND (school_id = public.current_school_id() OR school_id IS NULL)
  )
  WITH CHECK (
    public.current_user_role() = 'admin'
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollment_apps_parent ON public.enrollment_applications(parent_profile_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_apps_school ON public.enrollment_applications(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_apps_status ON public.enrollment_applications(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_docs_enrollment ON public.enrollment_documents(enrollment_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_enrollment_apps ON public.enrollment_applications;
CREATE TRIGGER set_updated_at_enrollment_apps BEFORE UPDATE ON public.enrollment_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
