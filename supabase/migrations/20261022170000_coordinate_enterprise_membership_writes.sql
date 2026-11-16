
-- ============================================================
-- Global Career AI
-- Enterprise V1
-- Coordinate organization and membership writes
-- LOCAL ONLY - DO NOT EXECUTE IN SUPABASE YET
-- ============================================================

-- Use a transaction-level advisory lock shared by all writes
-- to organizations and organization_members.
--
-- This intentionally serializes these writes across organizations.
-- The statement-level triggers acquire the lock before row-level
-- processing begins, establishing a consistent lock order.
--
-- The two-integer advisory-lock namespace is distinct from the
-- single-bigint namespace used by the existing per-organization
-- locks.

CREATE OR REPLACE FUNCTION public.lock_enterprise_membership_writes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(19876, 44001);

  -- Statement-level triggers must return NULL.
  RETURN NULL;
END;
$$;

-- Acquire the common lock before any organization membership
-- statement processes individual rows.

DROP TRIGGER IF EXISTS
  organization_members_coordinate_writes
ON public.organization_members;

CREATE TRIGGER organization_members_coordinate_writes
BEFORE INSERT OR UPDATE OR DELETE
ON public.organization_members
FOR EACH STATEMENT
EXECUTE FUNCTION public.lock_enterprise_membership_writes();

-- Organization writes use the same lock. In particular, an
-- organization deletion must acquire it before row-level deletion
-- and cascading membership changes begin.

DROP TRIGGER IF EXISTS
  organizations_coordinate_writes
ON public.organizations;

CREATE TRIGGER organizations_coordinate_writes
BEFORE INSERT OR UPDATE OR DELETE
ON public.organizations
FOR EACH STATEMENT
EXECUTE FUNCTION public.lock_enterprise_membership_writes();

-- Recreate the ownership-transfer function with the common lock
-- acquired before the existing per-organization lock and before
-- any organization or membership rows are locked.

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
  v_transferred_at timestamptz;
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

  -- Lock order: common write lock first.
  PERFORM pg_catalog.pg_advisory_xact_lock(19876, 44001);

  -- Then acquire the existing organization-specific lock.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_organization_id::text, 0)
  );

  -- Lock the organization only after acquiring both advisory locks.
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
  v_transferred_at := clock_timestamp();

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

-- Preserve the restricted execution model of the existing function.

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
