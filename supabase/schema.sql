-- =============================================
-- LEXIP DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- =============================================
-- Stores user profile data linked to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. SUBSCRIPTIONS TABLE
-- =============================================
-- Stores user subscription/plan information

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.role() = 'service_role');

-- Function to auto-create free subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto subscription
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- =============================================
-- 3. THUMBNAIL_GENERATIONS TABLE
-- =============================================
-- Stores all thumbnail generation history

CREATE TABLE IF NOT EXISTS public.thumbnail_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    style TEXT,
    image_urls TEXT[] DEFAULT '{}',
    selected_image_url TEXT,
    metadata JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.thumbnail_generations ENABLE ROW LEVEL SECURITY;

-- Policies for thumbnail_generations
CREATE POLICY "Users can view their own generations"
    ON public.thumbnail_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
    ON public.thumbnail_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
    ON public.thumbnail_generations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
    ON public.thumbnail_generations FOR DELETE
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.thumbnail_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.thumbnail_generations(created_at DESC);

-- =============================================
-- 4. USAGE_LIMITS TABLE
-- =============================================
-- Tracks daily/monthly usage for rate limiting

CREATE TABLE IF NOT EXISTS public.usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'monthly')),
    generations_count INTEGER DEFAULT 0,
    max_generations INTEGER DEFAULT 5, -- Free tier default
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_type)
);

-- Enable RLS
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

-- Policies for usage_limits
CREATE POLICY "Users can view their own usage"
    ON public.usage_limits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
    ON public.usage_limits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
    ON public.usage_limits FOR UPDATE
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON public.usage_limits(user_id, period_start, period_type);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get or create today's usage record
CREATE OR REPLACE FUNCTION public.get_or_create_daily_usage(p_user_id UUID)
RETURNS public.usage_limits AS $$
DECLARE
    v_usage public.usage_limits;
    v_max_gens INTEGER;
BEGIN
    -- Get max generations based on subscription
    SELECT CASE 
        WHEN plan = 'enterprise' THEN 1000
        WHEN plan = 'pro' THEN 100
        ELSE 5 -- free
    END INTO v_max_gens
    FROM public.subscriptions
    WHERE user_id = p_user_id;

    -- Default to free if no subscription found
    IF v_max_gens IS NULL THEN
        v_max_gens := 5;
    END IF;

    -- Try to get existing record
    SELECT * INTO v_usage
    FROM public.usage_limits
    WHERE user_id = p_user_id
      AND period_start = CURRENT_DATE
      AND period_type = 'daily';

    -- Create if doesn't exist
    IF NOT FOUND THEN
        INSERT INTO public.usage_limits (user_id, period_start, period_type, generations_count, max_generations)
        VALUES (p_user_id, CURRENT_DATE, 'daily', 0, v_max_gens)
        RETURNING * INTO v_usage;
    ELSE
        -- Update max_generations if plan has changed (user upgraded/downgraded)
        IF v_usage.max_generations != v_max_gens THEN
            UPDATE public.usage_limits
            SET max_generations = v_max_gens,
                updated_at = NOW()
            WHERE id = v_usage.id
            RETURNING * INTO v_usage;
        END IF;
    END IF;

    RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_usage public.usage_limits;
BEGIN
    -- Get or create usage record
    v_usage := public.get_or_create_daily_usage(p_user_id);

    -- Check if limit reached
    IF v_usage.generations_count >= v_usage.max_generations THEN
        RETURN FALSE;
    END IF;

    -- Increment count
    UPDATE public.usage_limits
    SET generations_count = generations_count + 1,
        updated_at = NOW()
    WHERE id = v_usage.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_generations_updated_at ON public.thumbnail_generations;
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.thumbnail_generations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_usage_updated_at ON public.usage_limits;
CREATE TRIGGER update_usage_updated_at
    BEFORE UPDATE ON public.usage_limits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
