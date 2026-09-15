CREATE TABLE IF NOT EXISTS public.premium_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL UNIQUE,

    stripe_customer_id text,
    stripe_subscription_id text UNIQUE,

    plan text NOT NULL,

    status text NOT NULL,

    current_period_start timestamp with time zone,
    current_period_end timestamp with time zone,

    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT premium_subscriptions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    CONSTRAINT premium_subscriptions_plan_check
        CHECK (plan IN ('monthly', 'six_months', 'annual'))
);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status
    ON public.premium_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_customer_id
    ON public.premium_subscriptions(stripe_customer_id);
