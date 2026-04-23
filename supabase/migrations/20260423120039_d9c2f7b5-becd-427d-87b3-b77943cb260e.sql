-- ============ Enums ============
CREATE TYPE public.deposit_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');
CREATE TYPE public.deposit_failure_category AS ENUM ('kyc', 'region', 'payment_method', 'limit', 'other');

-- ============ Shared updated_at trigger function ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ balances ============
CREATE TABLE public.balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  usd_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

-- Users can read their own balance, but cannot modify it directly.
CREATE POLICY "Users can view their own balance"
  ON public.balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_balances_updated_at
  BEFORE UPDATE ON public.balances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ deposits ============
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Onramper / provider tracking
  onramper_transaction_id TEXT UNIQUE,
  provider TEXT,
  -- Amount info
  fiat_amount NUMERIC(18, 2) NOT NULL,
  fiat_currency TEXT NOT NULL DEFAULT 'USD',
  crypto_currency TEXT,
  crypto_amount NUMERIC(36, 18),
  -- Status
  status public.deposit_status NOT NULL DEFAULT 'pending',
  failure_category public.deposit_failure_category,
  failure_reason TEXT,
  -- Bookkeeping
  credited_amount_usd NUMERIC(18, 2),
  credited_at TIMESTAMPTZ,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_status ON public.deposits(status);
CREATE INDEX idx_deposits_onramper_tx ON public.deposits(onramper_transaction_id);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can read their own deposits and create pending records (so the frontend
-- can record the intent when the widget opens). Status updates and credits are
-- only writable by the service role from the webhook.
CREATE POLICY "Users can view their own deposits"
  ON public.deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending deposits"
  ON public.deposits FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND credited_amount_usd IS NULL
    AND credited_at IS NULL
  );

CREATE TRIGGER trg_deposits_updated_at
  BEFORE UPDATE ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Auto-create profile + balance on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.balances (user_id, usd_balance)
  VALUES (NEW.id, 0);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ Atomic credit function (called by webhook with service role) ============
CREATE OR REPLACE FUNCTION public.credit_balance(
  _deposit_id UUID,
  _user_id UUID,
  _amount_usd NUMERIC,
  _onramper_transaction_id TEXT,
  _crypto_currency TEXT,
  _crypto_amount NUMERIC,
  _raw_event JSONB
)
RETURNS public.deposits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit public.deposits;
BEGIN
  -- Idempotency: if already completed, return existing record without re-crediting
  SELECT * INTO v_deposit FROM public.deposits WHERE id = _deposit_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deposit % not found', _deposit_id;
  END IF;

  IF v_deposit.status = 'completed' THEN
    RETURN v_deposit;
  END IF;

  -- Credit balance
  UPDATE public.balances
  SET usd_balance = usd_balance + _amount_usd
  WHERE user_id = _user_id;

  -- Mark deposit as completed
  UPDATE public.deposits
  SET status = 'completed',
      credited_amount_usd = _amount_usd,
      credited_at = now(),
      onramper_transaction_id = COALESCE(onramper_transaction_id, _onramper_transaction_id),
      crypto_currency = COALESCE(_crypto_currency, crypto_currency),
      crypto_amount = COALESCE(_crypto_amount, crypto_amount),
      raw_event = _raw_event
  WHERE id = _deposit_id
  RETURNING * INTO v_deposit;

  RETURN v_deposit;
END;
$$;

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.balances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;