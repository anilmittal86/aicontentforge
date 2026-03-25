-- Run this SQL in your Supabase Dashboard > SQL Editor

-- 1. Create profiles table (extends default auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create brand_groundings table
CREATE TABLE IF NOT EXISTS public.brand_groundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_name TEXT,
  what_we_do TEXT,
  target_reader TEXT,
  our_differentiator TEXT,
  voice TEXT,
  we_sound_like TEXT,
  we_never_say TEXT,
  proprietary_terms TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create context_groundings table
CREATE TABLE IF NOT EXISTS public.context_groundings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT DEFAULT 'Blog post',
  platform TEXT DEFAULT 'Company blog',
  goal TEXT,
  word_count_min INTEGER DEFAULT 800,
  word_count_max INTEGER DEFAULT 1500,
  reader_profile TEXT,
  reader_belief TEXT,
  key_objection TEXT,
  argument_structure JSONB DEFAULT '{}',
  tone_notes TEXT,
  avoid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create generated_content table
CREATE TABLE IF NOT EXISTS public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand_grounding_id UUID REFERENCES public.brand_groundings(id) ON DELETE SET NULL,
  context_grounding_id UUID REFERENCES public.context_groundings(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  keywords JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_groundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_groundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Brand Groundings: users can only see their own
CREATE POLICY "Users can view own brand groundings" ON public.brand_groundings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brand groundings" ON public.brand_groundings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brand groundings" ON public.brand_groundings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brand groundings" ON public.brand_groundings
  FOR DELETE USING (auth.uid() = user_id);

-- Context Groundings: users can only see their own
CREATE POLICY "Users can view own context groundings" ON public.context_groundings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own context groundings" ON public.context_groundings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own context groundings" ON public.context_groundings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own context groundings" ON public.context_groundings
  FOR DELETE USING (auth.uid() = user_id);

-- Generated Content: users can only see their own
CREATE POLICY "Users can view own generated content" ON public.generated_content
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generated content" ON public.generated_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generated content" ON public.generated_content
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generated content" ON public.generated_content
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();