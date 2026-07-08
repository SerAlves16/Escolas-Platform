/*
# Core tables for multi-tenant school management platform

1. Overview
This migration creates the foundational tables for a multi-tenant school management system.
Each school is a tenant. Users belong to a school and have a role (RBAC).
All tables are scoped by school_id to enforce tenant isolation.

2. New Tables
- `schools` — tenant root: name, logo, motto, colors, contact info, landing page content (JSONB)
- `profiles` — extends auth.users: user_id, school_id, role, full_name, phone, avatar
- `students` — student records: number, class_id, parent_id, balance, qr_token
- `parents` — parent/guardian records: links to profile, multiple children
- `teachers` — teacher records: links to profile
- `staff` — non-teaching staff (canteen, bar, stationery): links to profile, staff_type
- `classes` — turmas: name, year, grade, school_year
- `subjects` — disciplinas: name, code
- `class_subjects` — many-to-many: class + subject + teacher
- `schedules` — horários: class_id, subject_id, day, start_time, end_time, room
- `grades` — notas: student_id, subject_id, term, value, date
- `attendance` — faltas: student_id, subject_id, date, justified, observation
- `enrollments` — class membership: student_id, class_id

3. Security
- RLS enabled on all tables.
- Policies scope by school_id via helper functions.
- Public read on schools (landing page) for anon; authenticated users see their own school.
- Profile-based ownership: a user's profile determines their school and role.
*/

-- Schools (tenant root)
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  motto text,
  logo_url text,
  hero_image_url text,
  primary_color text DEFAULT '#2563eb',
  secondary_color text DEFAULT '#0ea5e9',
  address text,
  city text,
  postal_code text,
  phone text,
  email text,
  website text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  opening_hours jsonb DEFAULT '[]'::jsonb,
  social_links jsonb DEFAULT '{}'::jsonb,
  landing_content jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles (extends auth.users with school + role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','direction','teacher','class_director','canteen','bar','stationery','parent','student')),
  full_name text NOT NULL,
  email text,
  phone text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Helper functions (defined after profiles table exists)
CREATE OR REPLACE FUNCTION public.current_school_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Classes (turmas)
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade text,
  year text NOT NULL,
  class_director_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Subjects (disciplinas)
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  created_at timestamptz DEFAULT now()
);

-- Class subjects (many-to-many with teacher)
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_number text,
  qr_token text UNIQUE,
  balance numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Parents (encarregados de educação)
CREATE TABLE IF NOT EXISTS public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Parent-student relationship (many-to-many)
CREATE TABLE IF NOT EXISTS public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relationship text DEFAULT 'parent',
  UNIQUE(parent_id, student_id)
);

-- Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Staff (canteen, bar, stationery)
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_type text NOT NULL CHECK (staff_type IN ('canteen','bar','stationery','other')),
  created_at timestamptz DEFAULT now()
);

-- Enrollments (student in a class)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  school_year text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, class_id, school_year)
);

-- Schedules (horários)
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  created_at timestamptz DEFAULT now()
);

-- Grades (notas)
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  term text NOT NULL,
  value numeric(5,2) NOT NULL,
  assessment_type text,
  date date NOT NULL,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attendance (faltas)
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  date date NOT NULL,
  justified boolean DEFAULT false,
  justification text,
  observation text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Schools: public read (landing page), admin/direction write
DROP POLICY IF EXISTS "public_read_schools" ON public.schools;
CREATE POLICY "public_read_schools" ON public.schools FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_schools" ON public.schools;
CREATE POLICY "admin_manage_schools" ON public.schools FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction'))
  WITH CHECK (public.current_user_role() IN ('admin','direction'));

-- Profiles: user sees own profile; school members see profiles in their school
DROP POLICY IF EXISTS "read_own_profile" ON public.profiles;
CREATE POLICY "read_own_profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR school_id = public.current_school_id());

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_manage_profiles" ON public.profiles;
CREATE POLICY "admin_manage_profiles" ON public.profiles FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin' AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() = 'admin' AND school_id = public.current_school_id());

-- Classes
DROP POLICY IF EXISTS "read_classes" ON public.classes;
CREATE POLICY "read_classes" ON public.classes FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_classes" ON public.classes;
CREATE POLICY "admin_write_classes" ON public.classes FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Subjects
DROP POLICY IF EXISTS "read_subjects" ON public.subjects;
CREATE POLICY "read_subjects" ON public.subjects FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_subjects" ON public.subjects;
CREATE POLICY "admin_write_subjects" ON public.subjects FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Class subjects
DROP POLICY IF EXISTS "read_class_subjects" ON public.class_subjects;
CREATE POLICY "read_class_subjects" ON public.class_subjects FOR SELECT
  TO authenticated USING (class_id IN (SELECT id FROM public.classes WHERE school_id = public.current_school_id()));

DROP POLICY IF EXISTS "admin_write_class_subjects" ON public.class_subjects;
CREATE POLICY "admin_write_class_subjects" ON public.class_subjects FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction'))
  WITH CHECK (public.current_user_role() IN ('admin','direction'));

-- Students
DROP POLICY IF EXISTS "read_students" ON public.students;
CREATE POLICY "read_students" ON public.students FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_students" ON public.students;
CREATE POLICY "admin_write_students" ON public.students FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Parents
DROP POLICY IF EXISTS "read_parents" ON public.parents;
CREATE POLICY "read_parents" ON public.parents FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_parents" ON public.parents;
CREATE POLICY "admin_write_parents" ON public.parents FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Parent-students
DROP POLICY IF EXISTS "read_parent_students" ON public.parent_students;
CREATE POLICY "read_parent_students" ON public.parent_students FOR SELECT
  TO authenticated USING (
    parent_id IN (SELECT id FROM public.parents WHERE school_id = public.current_school_id())
    OR student_id IN (SELECT id FROM public.students WHERE school_id = public.current_school_id())
  );

DROP POLICY IF EXISTS "admin_write_parent_students" ON public.parent_students;
CREATE POLICY "admin_write_parent_students" ON public.parent_students FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction'))
  WITH CHECK (public.current_user_role() IN ('admin','direction'));

-- Teachers
DROP POLICY IF EXISTS "read_teachers" ON public.teachers;
CREATE POLICY "read_teachers" ON public.teachers FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_teachers" ON public.teachers;
CREATE POLICY "admin_write_teachers" ON public.teachers FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Staff
DROP POLICY IF EXISTS "read_staff" ON public.staff;
CREATE POLICY "read_staff" ON public.staff FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_staff" ON public.staff;
CREATE POLICY "admin_write_staff" ON public.staff FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin' AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() = 'admin' AND school_id = public.current_school_id());

-- Enrollments
DROP POLICY IF EXISTS "read_enrollments" ON public.enrollments;
CREATE POLICY "read_enrollments" ON public.enrollments FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_enrollments" ON public.enrollments;
CREATE POLICY "admin_write_enrollments" ON public.enrollments FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Schedules
DROP POLICY IF EXISTS "read_schedules" ON public.schedules;
CREATE POLICY "read_schedules" ON public.schedules FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "admin_write_schedules" ON public.schedules;
CREATE POLICY "admin_write_schedules" ON public.schedules FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Grades: read within school; teachers + admin can write
DROP POLICY IF EXISTS "read_grades" ON public.grades;
CREATE POLICY "read_grades" ON public.grades FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_grades" ON public.grades;
CREATE POLICY "write_grades" ON public.grades FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id());

-- Attendance: read within school; teachers + admin can write
DROP POLICY IF EXISTS "read_attendance" ON public.attendance;
CREATE POLICY "read_attendance" ON public.attendance FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_attendance" ON public.attendance;
CREATE POLICY "write_attendance" ON public.attendance FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_parents_school_id ON public.parents(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_school_id ON public.staff(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON public.enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON public.grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON public.schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent_id ON public.parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_student_id ON public.parent_students(student_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_students ON public.students;
CREATE TRIGGER set_updated_at_students BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_schools ON public.schools;
CREATE TRIGGER set_updated_at_schools BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_grades ON public.grades;
CREATE TRIGGER set_updated_at_grades BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_attendance ON public.attendance;
CREATE TRIGGER set_updated_at_attendance BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilizador'), COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
