# Flagstar Banking Simulation & Premium Funnel Portal

A production-ready React 19 + TypeScript + TailwindCSS premium banking dashboard integrating seamlessly with a Supabase backend. Includes 7 fully interactive wealth and credit product funnels with high-definition dynamic visualizers, real financial formula calculators, and local/database lead persistence.

## 🚀 Features

- **7 Interactive Product Funnels**: Custom built-in calculators with exact financial math models.
  1. **Credit Cards**: Card selection (Visa/Mastercard) & custom variable APY tiering.
  2. **Mortgages**: Fixed rate (6.25%) down payment monthly amortization payment calculators.
  3. **Loans**: APR pricing structures for auto and home improvements with detailed terms.
  4. **Savings Vault**: Daily-compounding future balance projector yielding 4.50% APY.
  5. **Interest Comparators**: Year-by-year variable vs fixed returns rendered using interactive graphs.
  6. **Growth Bonds**: AA-rated government Series-I and T-Note maturity yields calculator.
  7. **Wealth Investments**: Dynamic asset allocation pie charts adjusting instantly to risk preferences.
- **Lead Capture & DB Synchronization**: Intelligently locks customer submissions locally via `localStorage` for anonymous prospects or syncs with the Supabase schema database via secured RPC for verified sessions.
- **Admin Lead Console**: Dedicated administrative terminal lets teams monitor incoming product leads and interact with customer wizard workflows.

## 🛠 Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS & Custom Glassmorphic Utilities
- **State management**: Zustand
- **Visualization**: Recharts (Pie & Line dynamic graphs)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 💾 Database Setup

Run the following SQL script within your Supabase SQL Editor to provision lead capture capabilities and security layers:

```sql
-- Create funnel_interactions table
CREATE TABLE IF NOT EXISTS public.funnel_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    funnel_name TEXT NOT NULL,
    interaction_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.funnel_interactions ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view and insert their own interactions
CREATE POLICY "Allow customers to manage their own interactions" 
ON public.funnel_interactions 
FOR ALL 
TO authenticated 
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

-- Policy for admins to view all interactions
CREATE POLICY "Allow admins to read all interactions" 
ON public.funnel_interactions 
FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()));

-- RPC to save funnel interactions securely
CREATE OR REPLACE FUNCTION public.save_funnel_interaction(
    p_customer_id UUID,
    p_funnel_name TEXT,
    p_interaction_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_interaction_id UUID;
BEGIN
    INSERT INTO public.funnel_interactions (customer_id, funnel_name, interaction_data)
    VALUES (p_customer_id, p_funnel_name, p_interaction_data)
    RETURNING id INTO v_interaction_id;
    
    RETURN v_interaction_id;
END;
$$;
```

---

## 🔧 Environment Variables

Configure a `.env` file in the project's root:

```env
VITE_SUPABASE_URL=https://zwzrdjfitlhenmdthgmz.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## 🏃 Setup & Launch

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Execute Development server**:
   ```bash
   npm run dev
   ```

3. **Verify Build Compilation**:
   ```bash
   npm run build
   ```
