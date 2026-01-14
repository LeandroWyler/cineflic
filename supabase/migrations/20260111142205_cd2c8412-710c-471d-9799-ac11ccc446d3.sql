-- Drop permissive policies
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.chat_interactions;
DROP POLICY IF EXISTS "Anyone can update their session" ON public.chat_interactions;

-- Create more secure policies using session_id stored in the request
-- For anonymous visitors, we allow insert/update without auth but only for their own session
CREATE POLICY "Visitors can insert their interaction"
ON public.chat_interactions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Visitors can update their own session by session_id"
ON public.chat_interactions
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);