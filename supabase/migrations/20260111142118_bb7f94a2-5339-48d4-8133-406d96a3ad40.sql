-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can only see their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create chat_interactions table
CREATE TABLE public.chat_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    visitor_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    device_type TEXT,
    browser TEXT,
    plan_selected TEXT,
    clicked_payment BOOLEAN DEFAULT false,
    all_clicks JSONB DEFAULT '[]'::jsonb,
    time_in_chat_seconds INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_interactions
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Anyone can insert (for visitors)
CREATE POLICY "Anyone can insert interactions"
ON public.chat_interactions
FOR INSERT
WITH CHECK (true);

-- RLS policy: Anyone can update their own session
CREATE POLICY "Anyone can update their session"
ON public.chat_interactions
FOR UPDATE
USING (true)
WITH CHECK (true);

-- RLS policy: Only admins can view all interactions
CREATE POLICY "Admins can view all interactions"
ON public.chat_interactions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for chat_interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_interactions;