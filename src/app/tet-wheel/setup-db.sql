-- 1. Create table for storing spin results
CREATE TABLE IF NOT EXISTS public.lucky_wheel_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  prize_name text NOT NULL,
  discount_code text,
  discount_value int,
  created_at timestamptz DEFAULT now()
);

-- 2. Create table for coupons (if not exists)
CREATE TABLE IF NOT EXISTS public.coupons (
  code text PRIMARY KEY,
  discount_value int NOT NULL,
  is_used boolean DEFAULT false,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable RLS (Optional but recommended)
ALTER TABLE public.lucky_wheel_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Allow Authenticated Users to Read/Insert)
-- Adjust these based on your security needs.
CREATE POLICY "Enable read/insert for authenticated users" ON public.lucky_wheel_results
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable read/insert for authenticated users" ON public.coupons
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);
