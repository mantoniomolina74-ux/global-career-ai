
-- ============================================================
-- Global Career AI
-- Enterprise V1
-- Controlled organization ownership transfer
-- LOCAL MIGRATION ONLY - DO NOT EXECUTE IN SUPABASE YET
-- ============================================================

-- One audit row is recorded for every former OWNER.
-- transfer_id groups all former owners from the same transfer.
-- User IDs are retained as audit identifiers.

CREATE TABLE IF NOT EXISTS public.organization_ownership_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  previous_owner_user_id uuid NOT NULL,
  new_owner_user_id uuid NOT NULL,
  transferred_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT organization_ownership_transfers_different_owners
    CHECK (previous_owner_user_id <> new_owner_user_id),

  CONSTRAINT organization_ownership_transfers_transfer_previous_unique
    UNIQUE (transfer_id, previous_owner_user_id)
);

CREATE INDEX IF NOT EXISTS
  organization_ownership_transfers_organization_time_idx
ON public.organization_ownership_transfers (
  organization_id,
  transferred_at DESC
);

-- Audit history is inaccessible to ordinary application roles.
ALTER TABLE public.organization_ownership_transfers
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.organization_ownership_transfers
  FROM PUBLIC, anon, authenticated;

GRANT ALL ON TABLE public.organization_ownership_transfers
  TO service_role;

-- The server must authenticate the actor before calling this function.
-- Only service_role may execute it.
-- Lock ordering follows the existing membership trigger:
-- advisory transaction lock first, then organization row lock.
-- The entire function call runs in the caller's transaction.

CREATE OR REPLACE FUNCTION public.transfer_organization_ownership(
  p_organization_id uuid,
  p_actor_user_id uuid,
  p_new_owner_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actor_role text;
  v_new_owner_exists boolean;
  v_transfer_id uuid;
  v_transferred_at timestamptz := clock_timestamp();
  v_previous_owner_user_id uuid;
  v_previous_owner_count integer := 0;
BEGIN
  IF p_organization_id IS NULL
     OR p_actor_user_id IS NULL
     OR p_new_owner_user_id IS NULL THEN
    RAISE EXCEPTION
      'Organization, actor, and new owner are required.'
      USING ERRCODE = '22004';
  END IF;

  IF p_actor_user_id = p_new_owner_user_id THEN
    RAISE EXCEPTION
      'The new owner must be a different organization member.'
      USING ERRCODE = '22023';
  END IF;

  -- Match the advisory lock used by the existing membership trigger.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_organization_id::text, 0)
  );

  -- Lock the organization only after acquiring the advisory lock.
  PERFORM 1
  FROM public.organizations AS organization
  WHERE organization.id = p_organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Organization not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Only a current OWNER may initiate the transfer.
  SELECT member.role
  INTO v_actor_role
  FROM public.organization_members AS member
  WHERE member.organization_id = p_organization_id
    AND member.user_id = p_actor_user_id
  FOR UPDATE;

  IF NOT FOUND OR v_actor_role <> 'OWNER' THEN
    RAISE EXCEPTION
      'Only the current OWNER may transfer organization ownership.'
      USING ERRCODE = '42501';
  END IF;

  -- The recipient must already be a different member.
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members AS member
    WHERE member.organization_id = p_organization_id
      AND member.user_id = p_new_owner_user_id
  )
  INTO v_new_owner_exists;

  IF NOT v_new_owner_exists THEN
    RAISE EXCEPTION
      'The new owner must already be an organization member.'
      USING ERRCODE = '23503';
  END IF;

  v_transfer_id := gen_random_uuid();

  -- Preserve every former OWNER in the audit trail.
  FOR v_previous_owner_user_id IN
    SELECT member.user_id
    FROM public.organization_members AS member
    WHERE member.organization_id = p_organization_id
      AND member.role = 'OWNER'
      AND member.user_id <> p_new_owner_user_id
    ORDER BY member.user_id
    FOR UPDATE
  LOOP
    INSERT INTO public.organization_ownership_transfers (
      transfer_id,
      organization_id,
      actor_user_id,
      previous_owner_user_id,
      new_owner_user_id,
      transferred_at
    )
    VALUES (
      v_transfer_id,
      p_organization_id,
      p_actor_user_id,
      v_previous_owner_user_id,
      p_new_owner_user_id,
      v_transferred_at
    );

    v_previous_owner_count := v_previous_owner_count + 1;
  END LOOP;

  IF v_previous_owner_count = 0 THEN
    RAISE EXCEPTION
      'No former OWNER was found for this transfer.'
      USING ERRCODE = '23514';
  END IF;

  -- Demote all current owners before promoting the recipient.
  UPDATE public.organization_members
  SET
    role = 'ADMIN',
    updated_at = now()
  WHERE organization_id = p_organization_id
    AND role = 'OWNER';

  UPDATE public.organization_members
  SET
    role = 'OWNER',
    updated_at = now()
  WHERE organization_id = p_organization_id
    AND user_id = p_new_owner_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'Ownership transfer failed because the recipient membership changed.'
      USING ERRCODE = '40001';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_organization_ownership(
  uuid, uuid, uuid
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.transfer_organization_ownership(
  uuid, uuid, uuid
) FROM anon;

REVOKE ALL ON FUNCTION public.transfer_organization_ownership(
  uuid, uuid, uuid
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.transfer_organization_ownership(
  uuid, uuid, uuid
) TO service_role;
