/*
# Extended tables: canteen, bar, stationery, content, communication, logs

1. New Tables
- `menus` — ementas: school_id, date, meal_type, description, price
- `meal_reservations` — refeições marcadas: student_id, menu_id, date, status, qr_validated
- `products` — produtos (bar + stationery): school_id, name, category, price, stock, outlet_type
- `sales` — compras/vendas: student_id, product_id, quantity, total, outlet_type, date
- `balance_transactions` — movimentos de saldo: student_id, amount, type, description
- `meetings` — reuniões: parent_id, teacher_id, student_id, scheduled_at, status
- `news` — notícias: school_id, title, content, image_url, published
- `events` — eventos: school_id, title, description, start_date, end_date, location
- `announcements` — avisos: school_id, title, content, target_role, priority
- `messages` — mensagens internas: sender_id, receiver_id, subject, body, read_at
- `notifications` — notificações: user_id, title, body, type, read
- `activity_logs` — logs: school_id, user_id, action, entity, details
- `homework` — trabalhos de casa: class_id, subject_id, title, due_date
- `exams` — testes: class_id, subject_id, title, date, topics
- `documents` — documentos públicos: school_id, title, file_url, category
- `gallery_photos` — galeria: school_id, title, image_url, category
- `useful_links` — ligações úteis: school_id, title, url, category

2. Security
- RLS enabled on all tables with school-scoped policies.
*/

-- Menus (ementas)
CREATE TABLE IF NOT EXISTS public.menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  date date NOT NULL,
  meal_type text NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('lunch','snack','dinner')),
  description text NOT NULL,
  soup text,
  main_course text,
  dessert text,
  price numeric(6,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Meal reservations (refeições marcadas)
CREATE TABLE IF NOT EXISTS public.meal_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  menu_id uuid REFERENCES public.menus(id) ON DELETE SET NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','served','cancelled')),
  qr_validated boolean DEFAULT false,
  validated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Products (bar + stationery)
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price numeric(8,2) NOT NULL DEFAULT 0,
  cost numeric(8,2) DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  min_stock int DEFAULT 0,
  outlet_type text NOT NULL CHECK (outlet_type IN ('bar','stationery','canteen')),
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales (compras/vendas)
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  outlet_type text NOT NULL CHECK (outlet_type IN ('bar','stationery','canteen')),
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(8,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  payment_method text DEFAULT 'balance' CHECK (payment_method IN ('balance','cash')),
  served_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Balance transactions (movimentos de saldo)
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('credit','debit')),
  description text,
  reference text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Meetings (reuniões)
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.parents(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News (notícias)
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  image_url text,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events (eventos)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  image_url text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Announcements (avisos)
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  target_role text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  expires_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages (mensagens internas)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications (notificações)
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  type text DEFAULT 'info',
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activity logs (logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Homework (trabalhos de casa)
CREATE TABLE IF NOT EXISTS public.homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Exams (testes)
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  topics text,
  room text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Documents (documentos públicos)
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text,
  category text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Gallery photos (galeria)
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text,
  image_url text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Useful links (ligações úteis)
CREATE TABLE IF NOT EXISTS public.useful_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.useful_links ENABLE ROW LEVEL SECURITY;

-- Menus: public read, canteen+admin write
DROP POLICY IF EXISTS "read_menus" ON public.menus;
CREATE POLICY "read_menus" ON public.menus FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_menus" ON public.menus;
CREATE POLICY "write_menus" ON public.menus FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','canteen') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','canteen') AND school_id = public.current_school_id());

-- Meal reservations
DROP POLICY IF EXISTS "read_meal_reservations" ON public.meal_reservations;
CREATE POLICY "read_meal_reservations" ON public.meal_reservations FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_meal_reservations" ON public.meal_reservations;
CREATE POLICY "write_meal_reservations" ON public.meal_reservations FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','canteen','parent','student') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','canteen','parent','student') AND school_id = public.current_school_id());

-- Products
DROP POLICY IF EXISTS "read_products" ON public.products;
CREATE POLICY "read_products" ON public.products FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_products" ON public.products;
CREATE POLICY "write_products" ON public.products FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','bar','stationery') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','bar','stationery') AND school_id = public.current_school_id());

-- Sales
DROP POLICY IF EXISTS "read_sales" ON public.sales;
CREATE POLICY "read_sales" ON public.sales FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_sales" ON public.sales;
CREATE POLICY "write_sales" ON public.sales FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','bar','stationery','canteen') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','bar','stationery','canteen') AND school_id = public.current_school_id());

-- Balance transactions
DROP POLICY IF EXISTS "read_balance_transactions" ON public.balance_transactions;
CREATE POLICY "read_balance_transactions" ON public.balance_transactions FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_balance_transactions" ON public.balance_transactions;
CREATE POLICY "write_balance_transactions" ON public.balance_transactions FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','parent') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','parent') AND school_id = public.current_school_id());

-- Meetings
DROP POLICY IF EXISTS "read_meetings" ON public.meetings;
CREATE POLICY "read_meetings" ON public.meetings FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_meetings" ON public.meetings;
CREATE POLICY "write_meetings" ON public.meetings FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','parent','teacher','class_director') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','parent','teacher','class_director') AND school_id = public.current_school_id());

-- News: public read, admin+direction write
DROP POLICY IF EXISTS "read_news" ON public.news;
CREATE POLICY "read_news" ON public.news FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_news" ON public.news;
CREATE POLICY "write_news" ON public.news FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Events: public read, admin+direction write
DROP POLICY IF EXISTS "read_events" ON public.events;
CREATE POLICY "read_events" ON public.events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_events" ON public.events;
CREATE POLICY "write_events" ON public.events FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Announcements
DROP POLICY IF EXISTS "read_announcements" ON public.announcements;
CREATE POLICY "read_announcements" ON public.announcements FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_announcements" ON public.announcements;
CREATE POLICY "write_announcements" ON public.announcements FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Messages: users see messages where they are sender or receiver
DROP POLICY IF EXISTS "read_messages" ON public.messages;
CREATE POLICY "read_messages" ON public.messages FOR SELECT
  TO authenticated USING (school_id = public.current_school_id() AND (sender_id = auth.uid() OR receiver_id = auth.uid()));

DROP POLICY IF EXISTS "write_messages" ON public.messages;
CREATE POLICY "write_messages" ON public.messages FOR INSERT
  TO authenticated WITH CHECK (school_id = public.current_school_id() AND sender_id = auth.uid());

DROP POLICY IF EXISTS "update_messages" ON public.messages;
CREATE POLICY "update_messages" ON public.messages FOR UPDATE
  TO authenticated USING (receiver_id = auth.uid()) WITH CHECK (receiver_id = auth.uid());

-- Notifications: users see their own
DROP POLICY IF EXISTS "read_notifications" ON public.notifications;
CREATE POLICY "read_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "write_notifications" ON public.notifications;
CREATE POLICY "write_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_notifications" ON public.notifications;
CREATE POLICY "update_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Activity logs: admin read, any authenticated insert
DROP POLICY IF EXISTS "read_activity_logs" ON public.activity_logs;
CREATE POLICY "read_activity_logs" ON public.activity_logs FOR SELECT
  TO authenticated USING (public.current_user_role() = 'admin' AND school_id = public.current_school_id());

DROP POLICY IF EXISTS "insert_activity_logs" ON public.activity_logs;
CREATE POLICY "insert_activity_logs" ON public.activity_logs FOR INSERT
  TO authenticated WITH CHECK (school_id = public.current_school_id());

-- Homework
DROP POLICY IF EXISTS "read_homework" ON public.homework;
CREATE POLICY "read_homework" ON public.homework FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_homework" ON public.homework;
CREATE POLICY "write_homework" ON public.homework FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id());

-- Exams
DROP POLICY IF EXISTS "read_exams" ON public.exams;
CREATE POLICY "read_exams" ON public.exams FOR SELECT
  TO authenticated USING (school_id = public.current_school_id());

DROP POLICY IF EXISTS "write_exams" ON public.exams;
CREATE POLICY "write_exams" ON public.exams FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction','teacher','class_director') AND school_id = public.current_school_id());

-- Documents: public read, admin write
DROP POLICY IF EXISTS "read_documents" ON public.documents;
CREATE POLICY "read_documents" ON public.documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_documents" ON public.documents;
CREATE POLICY "write_documents" ON public.documents FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Gallery: public read, admin write
DROP POLICY IF EXISTS "read_gallery" ON public.gallery_photos;
CREATE POLICY "read_gallery" ON public.gallery_photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_gallery" ON public.gallery_photos;
CREATE POLICY "write_gallery" ON public.gallery_photos FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Useful links: public read, admin write
DROP POLICY IF EXISTS "read_useful_links" ON public.useful_links;
CREATE POLICY "read_useful_links" ON public.useful_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "write_useful_links" ON public.useful_links;
CREATE POLICY "write_useful_links" ON public.useful_links FOR ALL
  TO authenticated
  USING (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id())
  WITH CHECK (public.current_user_role() IN ('admin','direction') AND school_id = public.current_school_id());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menus_school_date ON public.menus(school_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_reservations_student_date ON public.meal_reservations(student_id, date);
CREATE INDEX IF NOT EXISTS idx_products_school_outlet ON public.products(school_id, outlet_type);
CREATE INDEX IF NOT EXISTS idx_sales_student ON public.sales(student_id);
CREATE INDEX IF NOT EXISTS idx_sales_outlet ON public.sales(outlet_type);
CREATE INDEX IF NOT EXISTS idx_balance_transactions_student ON public.balance_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_meetings_parent ON public.meetings(parent_id);
CREATE INDEX IF NOT EXISTS idx_meetings_teacher ON public.meetings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_news_school ON public.news(school_id);
CREATE INDEX IF NOT EXISTS idx_events_school ON public.events(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_school ON public.activity_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework(class_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON public.exams(class_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_meetings ON public.meetings;
CREATE TRIGGER set_updated_at_meetings BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_news ON public.news;
CREATE TRIGGER set_updated_at_news BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
