-- مِسبار: سكيما قاعدة البيانات الأساسية
-- يرجى تشغيل هذا الملف في SQL Editor داخل Supabase

BEGIN;

-- 1. جدول الأحداث (لتسجيل سلوك الطالب)
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. جدول المستخدمين (يتم ربطه لاحقاً بـ Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY, -- سيتم ربطه بـ auth.users
  role text CHECK (role IN ('student', 'teacher', 'parent')),
  display_name text,
  created_at timestamptz DEFAULT now()
);

-- 3. جدول الفصول (للمعلمين)
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.profiles(id),
  name text NOT NULL,
  join_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- تفعيل الحماية RLS لجدول الأحداث
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.events FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.events TO anon;

DROP POLICY IF EXISTS events_anon_insert ON public.events;
CREATE POLICY events_anon_insert ON public.events FOR INSERT TO anon WITH CHECK (true);

COMMIT;
