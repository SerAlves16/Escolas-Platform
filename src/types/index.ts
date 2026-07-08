export type Role =
  | 'admin'
  | 'direction'
  | 'secretaria'
  | 'teacher'
  | 'class_director'
  | 'canteen'
  | 'bar'
  | 'stationery'
  | 'staff_servicos'
  | 'parent'
  | 'student';

export interface School {
  id: string;
  name: string;
  motto: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  primary_color: string;
  secondary_color: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: any;
  social_links: any;
  landing_content: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  school_id: string | null;
  role: Role;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  profile_id: string;
  student_number: string | null;
  qr_token: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Parent {
  id: string;
  school_id: string;
  profile_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Teacher {
  id: string;
  school_id: string;
  profile_id: string;
  created_at: string;
  profile?: Profile;
}

export interface Staff {
  id: string;
  school_id: string;
  profile_id: string;
  staff_type: 'canteen' | 'bar' | 'stationery' | 'other';
  created_at: string;
  profile?: Profile;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  grade: string | null;
  year: string;
  class_director_id: string | null;
  created_at: string;
  class_director?: Profile;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  created_at: string;
}

export interface Schedule {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject?: Subject;
  teacher?: Profile;
}

export interface Grade {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string;
  term: string;
  value: number;
  assessment_type: string | null;
  date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Attendance {
  id: string;
  school_id: string;
  student_id: string;
  subject_id: string | null;
  date: string;
  justified: boolean;
  justification: string | null;
  observation: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Menu {
  id: string;
  school_id: string;
  date: string;
  meal_type: 'lunch' | 'snack' | 'dinner';
  description: string;
  soup: string | null;
  main_course: string | null;
  dessert: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface MealReservation {
  id: string;
  school_id: string;
  student_id: string;
  menu_id: string | null;
  date: string;
  status: 'reserved' | 'served' | 'cancelled';
  qr_validated: boolean;
  validated_at: string | null;
  created_at: string;
  student?: Student;
  menu?: Menu;
}

export interface Product {
  id: string;
  school_id: string;
  name: string;
  category: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  outlet_type: 'bar' | 'stationery' | 'canteen';
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  school_id: string;
  student_id: string | null;
  product_id: string | null;
  outlet_type: 'bar' | 'stationery' | 'canteen';
  quantity: number;
  unit_price: number;
  total: number;
  payment_method: 'balance' | 'cash';
  served_by: string | null;
  created_at: string;
  product?: Product;
  student?: Student;
}

export interface BalanceTransaction {
  id: string;
  school_id: string;
  student_id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string | null;
  reference: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  school_id: string;
  parent_id: string | null;
  teacher_id: string | null;
  student_id: string | null;
  scheduled_at: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface News {
  id: string;
  school_id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  school_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  target_role: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  school_id: string;
  sender_id: string;
  receiver_id: string;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Notification {
  id: string;
  school_id: string | null;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  school_id: string;
  user_id: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: any;
  created_at: string;
}

export interface Homework {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  due_date: string;
  created_by: string | null;
  created_at: string;
  subject?: Subject;
  class?: Class;
}

export interface Exam {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  title: string;
  date: string;
  topics: string | null;
  room: string | null;
  created_by: string | null;
  created_at: string;
  subject?: Subject;
  class?: Class;
}

export interface Document {
  id: string;
  school_id: string;
  title: string;
  file_url: string | null;
  category: string | null;
  is_public: boolean;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  school_id: string;
  title: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
}

export interface UsefulLink {
  id: string;
  school_id: string;
  title: string;
  url: string;
  category: string | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  school_year: string;
  created_at: string;
  class?: Class;
  student?: Student;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrador',
  direction: 'Direção',
  secretaria: 'Secretaria',
  teacher: 'Professor',
  class_director: 'Diretor de Turma',
  canteen: 'Refeitório',
  bar: 'Bar',
  stationery: 'Papelaria',
  staff_servicos: 'Serviços',
  parent: 'Encarregado de Educação',
  student: 'Aluno',
};

export const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  direction: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  secretaria: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  teacher: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  class_director: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  canteen: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  bar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  stationery: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  staff_servicos: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300',
  parent: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  student: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
};

export interface EnrollmentApplication {
  id: string;
  school_id: string;
  parent_profile_id: string;
  student_name: string;
  student_birth_date: string | null;
  student_national_id: string | null;
  student_gender: string | null;
  student_address: string | null;
  grade_applying: string | null;
  previous_school: string | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'needs_correction';
  reviewed_by: string | null;
  reviewed_at: string | null;
  class_id: string | null;
  student_profile_id: string | null;
  student_record_id: string | null;
  notes: string | null;
  rejection_reason: string | null;
  correction_notes: string | null;
  created_at: string;
  updated_at: string;
  parent?: Profile;
  class?: Class;
  documents?: EnrollmentDocument[];
}

export interface EnrollmentDocument {
  id: string;
  enrollment_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}
