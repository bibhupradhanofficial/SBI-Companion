-- SBI Companion Supabase Schema Setup
-- Run this in the SQL Editor of your Supabase dashboard to create the profiles table and set up RLS policies.

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INT,
    income_range TEXT,
    employment_type TEXT,
    city TEXT,
    state TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    monthly_savings NUMERIC,
    existing_investments JSONB DEFAULT '[]'::jsonb,
    existing_insurance JSONB DEFAULT '[]'::jsonb,
    loans JSONB DEFAULT '[]'::jsonb,
    credit_score_range TEXT,
    banking_apps JSONB DEFAULT '[]'::jsonb,
    payment_frequency TEXT,
    banking_worry TEXT,
    communication_style TEXT,
    preferred_language TEXT,
    nudges_enabled BOOLEAN DEFAULT true,
    onboarding_complete BOOLEAN DEFAULT false,
    last_digest_shown TIMESTAMPTZ,
    phone TEXT,
    dob TEXT,
    pan TEXT,
    has_credit_card BOOLEAN DEFAULT false,
    existing_credit_card TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Goals Progress Table
CREATE TABLE IF NOT EXISTS public.goal_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_name TEXT NOT NULL,
    progress_percent INT DEFAULT 0,
    target_amount NUMERIC NOT NULL,
    current_amount NUMERIC DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" 
    ON public.goal_progress FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('payment', 'investment', 'insurance', 'agent')) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" 
    ON public.activities FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
    ON public.activities FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations" 
    ON public.conversations FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    tool_uses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to manage messages in their own conversations
CREATE POLICY "Users can manage messages in their conversations" 
    ON public.messages FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversations c 
            WHERE c.id = conversation_id AND c.user_id = auth.uid()
        )
    );

-- Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('upi', 'neft', 'imps', 'rtgs')) NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    purpose TEXT NOT NULL,
    note TEXT,
    status TEXT CHECK (status IN ('success', 'pending', 'failed')) NOT NULL,
    reference_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own transactions" 
    ON public.transactions FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Beneficiaries Table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    account_or_upi TEXT NOT NULL,
    bank_name TEXT,
    ifsc TEXT,
    type TEXT CHECK (type IN ('upi', 'bank')) NOT NULL,
    is_favourite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own beneficiaries" 
    ON public.beneficiaries FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Investments Table
CREATE TABLE IF NOT EXISTS public.user_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    fund_name TEXT NOT NULL,
    fund_type TEXT CHECK (fund_type IN ('Equity', 'Debt', 'Hybrid', 'ELSS', 'Gold')) NOT NULL,
    invested_amount NUMERIC NOT NULL,
    current_value NUMERIC NOT NULL,
    units NUMERIC NOT NULL,
    nav NUMERIC NOT NULL,
    sip_amount NUMERIC,
    sip_date INT,
    status TEXT CHECK (status IN ('active', 'paused', 'stopped')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own investments" 
    ON public.user_investments FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Insurance Table
CREATE TABLE IF NOT EXISTS public.user_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('life', 'health', 'vehicle', 'critical')) NOT NULL,
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    sum_assured NUMERIC NOT NULL,
    premium_amount NUMERIC NOT NULL,
    premium_frequency TEXT CHECK (premium_frequency IN ('monthly', 'annual')) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'lapsed')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_insurance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own insurance policies" 
    ON public.user_insurance FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User Nudges Table
CREATE TABLE IF NOT EXISTS public.nudges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rule_id TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('high', 'medium', 'low')) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT NOT NULL,
    is_dismissed BOOLEAN DEFAULT false NOT NULL,
    shown_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    dismissed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own nudges" 
    ON public.nudges FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    daily_upi_limit NUMERIC DEFAULT 100000 NOT NULL,
    daily_atm_limit NUMERIC DEFAULT 50000 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings" 
    ON public.user_settings FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
