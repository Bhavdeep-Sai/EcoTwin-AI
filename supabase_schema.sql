-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-------------------------------------------------------------------------------
-- 1. USERS
-------------------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-------------------------------------------------------------------------------
-- 2. CARBON PROFILES
-------------------------------------------------------------------------------
CREATE TABLE public.carbon_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  baseline_footprint_kg numeric NOT NULL DEFAULT 0,
  target_footprint_kg numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER carbon_profiles_updated_at BEFORE UPDATE ON public.carbon_profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE public.carbon_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own carbon profile" ON public.carbon_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own carbon profile" ON public.carbon_profiles FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 3. ACTIVITIES (Base Table)
-------------------------------------------------------------------------------
CREATE TYPE activity_category AS ENUM ('transport', 'food', 'electricity', 'shopping', 'waste');

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category activity_category NOT NULL,
  title text NOT NULL,
  activity_date date NOT NULL DEFAULT current_date,
  carbon_impact_kg numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own activities" ON public.activities FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 4. ACTIVITY SPECIFIC LOGS (1:1 with Activities)
-------------------------------------------------------------------------------
CREATE TABLE public.transportation_logs (
  activity_id uuid PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  mode text NOT NULL,
  distance_km numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER transportation_logs_updated_at BEFORE UPDATE ON public.transportation_logs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.transportation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transport logs" ON public.transportation_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.user_id = auth.uid())
);

CREATE TABLE public.food_logs (
  activity_id uuid PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  meal_type text NOT NULL,
  diet_category text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER food_logs_updated_at BEFORE UPDATE ON public.food_logs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own food logs" ON public.food_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.user_id = auth.uid()));

CREATE TABLE public.electricity_logs (
  activity_id uuid PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  kwh_used numeric NOT NULL,
  source text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER electricity_logs_updated_at BEFORE UPDATE ON public.electricity_logs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.electricity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own electricity logs" ON public.electricity_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.user_id = auth.uid()));

CREATE TABLE public.shopping_logs (
  activity_id uuid PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  item_category text NOT NULL,
  cost numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER shopping_logs_updated_at BEFORE UPDATE ON public.shopping_logs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.shopping_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shopping logs" ON public.shopping_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.user_id = auth.uid()));

CREATE TABLE public.waste_logs (
  activity_id uuid PRIMARY KEY REFERENCES public.activities(id) ON DELETE CASCADE,
  waste_type text NOT NULL,
  weight_kg numeric NOT NULL,
  recycled boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER waste_logs_updated_at BEFORE UPDATE ON public.waste_logs FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waste logs" ON public.waste_logs FOR ALL USING (EXISTS (SELECT 1 FROM public.activities a WHERE a.id = activity_id AND a.user_id = auth.uid()));

-------------------------------------------------------------------------------
-- 5. AI INSIGHTS
-------------------------------------------------------------------------------
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES public.activities(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_actionable boolean DEFAULT false,
  status text DEFAULT 'unread', -- unread, read, dismissed, completed
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER ai_insights_updated_at BEFORE UPDATE ON public.ai_insights FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own insights" ON public.ai_insights FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 6. CHALLENGES & USER_CHALLENGES
-------------------------------------------------------------------------------
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  duration_days int NOT NULL,
  target_metric text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges viewable by all" ON public.challenges FOR SELECT USING (true);

CREATE TABLE public.user_challenges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  status text DEFAULT 'active', -- active, completed, failed
  progress numeric DEFAULT 0,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, challenge_id)
);
CREATE TRIGGER user_challenges_updated_at BEFORE UPDATE ON public.user_challenges FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own challenge progress" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 7. ACHIEVEMENTS & USER_ACHIEVEMENTS
-------------------------------------------------------------------------------
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  badge_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER achievements_updated_at BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by all" ON public.achievements FOR SELECT USING (true);

CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 8. WEEKLY REPORTS
-------------------------------------------------------------------------------
CREATE TABLE public.weekly_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  total_carbon_kg numeric NOT NULL,
  trend_percentage numeric, -- e.g., -5.2 (decreased by 5.2%)
  ai_summary text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, week_start_date)
);
CREATE TRIGGER weekly_reports_updated_at BEFORE UPDATE ON public.weekly_reports FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own reports" ON public.weekly_reports FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 9. CARBON SCORES
-------------------------------------------------------------------------------
CREATE TABLE public.carbon_scores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score int NOT NULL, -- normalized gamified score (0-1000)
  calculated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
CREATE TRIGGER carbon_scores_updated_at BEFORE UPDATE ON public.carbon_scores FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
ALTER TABLE public.carbon_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own scores" ON public.carbon_scores FOR ALL USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 10. AUTH TRIGGER TO CREATE USER PROFILE
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.carbon_profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create core indexes
CREATE INDEX idx_activities_user_date ON public.activities (user_id, activity_date DESC);
CREATE INDEX idx_ai_insights_user_status ON public.ai_insights (user_id, status);
CREATE INDEX idx_weekly_reports_user_date ON public.weekly_reports (user_id, week_start_date DESC);
CREATE INDEX idx_carbon_scores_user_calc ON public.carbon_scores (user_id, calculated_at DESC);
