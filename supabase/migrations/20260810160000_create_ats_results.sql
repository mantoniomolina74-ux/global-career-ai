CREATE TABLE IF NOT EXISTS public.ats_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id uuid NOT NULL,

    application_id bigint NOT NULL,

    ats_score integer NOT NULL DEFAULT 0,

    pass_probability integer NOT NULL DEFAULT 0,

    interview_probability integer NOT NULL DEFAULT 0,

    offer_probability integer NOT NULL DEFAULT 0,

    matched_skills jsonb NOT NULL DEFAULT '[]'::jsonb,

    missing_skills jsonb NOT NULL DEFAULT '[]'::jsonb,

    updated_at timestamp with time zone NOT NULL DEFAULT now(),

    CONSTRAINT ats_results_application_id_key
        UNIQUE (application_id),

    CONSTRAINT ats_results_application_id_fkey
        FOREIGN KEY (application_id)
        REFERENCES public.applications(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ats_results_user_id
    ON public.ats_results (user_id);
