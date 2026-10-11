
-- ============================================================
-- Global Career AI
-- Enterprise V1.0
-- Protect the last organization OWNER
-- PostgreSQL 17
-- ============================================================

-- Add a row-level revision counter so concurrent membership
-- changes conflict even under REPEATABLE READ isolation.
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS membership_revision bigint NOT NULL DEFAULT 0;

-- Coordinate membership changes and organization deletion.
-- Organization IDs are processed in sorted order to reduce
-- deadlock risk when membership moves between organizations.

CREATE OR REPLACE FUNCTION public.lock_organization_membership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_old_organization_id uuid;
  v_new_organization_id uuid;
  v_organization_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_organization_id := NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_organization_id := OLD.organization_id;
  ELSE
    v_old_organization_id := OLD.organization_id;
    v_new_organization_id := NEW.organization_id;
  END IF;

  FOR v_organization_id IN
    SELECT DISTINCT ids.organization_id
    FROM unnest(
      ARRAY[v_old_organization_id, v_new_organization_id]
    ) AS ids(organization_id)
    WHERE ids.organization_id IS NOT NULL
    ORDER BY ids.organization_id
  LOOP
    -- Serialize operations for this organization.
    PERFORM pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_organization_id::text, 0)
    );

    -- Force a row-level write conflict for concurrent transactions.
    -- Under REPEATABLE READ, a transaction with a stale snapshot
    -- must fail rather than validate against stale owner data.
    --
    -- During organization deletion, the parent row may already
    -- have been deleted by the cascading operation; in that case
    -- this UPDATE affects zero rows, which is expected.
    UPDATE public.organizations
    SET membership_revision = membership_revision + 1
    WHERE id = v_organization_id;
  END LOOP;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

-- Organization deletion uses the same advisory lock.

CREATE OR REPLACE FUNCTION public.lock_organization_before_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(OLD.id::text, 0)
  );

  RETURN OLD;
END;
$$;

-- Validate the final transaction state, not an intermediate state.
-- This allows ownership transfer within a single transaction.
-- Deleting the organization itself is allowed.

CREATE OR REPLACE FUNCTION public.require_organization_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_old_organization_id uuid;
  v_new_organization_id uuid;
  v_organization_id uuid;
  v_owner_count bigint;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new_organization_id := NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    v_old_organization_id := OLD.organization_id;
  ELSE
    v_old_organization_id := OLD.organization_id;
    v_new_organization_id := NEW.organization_id;
  END IF;

  FOR v_organization_id IN
    SELECT DISTINCT ids.organization_id
    FROM unnest(
      ARRAY[v_old_organization_id, v_new_organization_id]
    ) AS ids(organization_id)
    WHERE ids.organization_id IS NOT NULL
    ORDER BY ids.organization_id
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.organizations AS organization
      WHERE organization.id = v_organization_id
    ) THEN
      SELECT count(*)
      INTO v_owner_count
      FROM public.organization_members AS member
      WHERE member.organization_id = v_organization_id
        AND member.role = 'OWNER';

      IF v_owner_count = 0 THEN
        RAISE EXCEPTION
          'Cannot leave an existing organization without an OWNER.'
          USING
            ERRCODE = '23514',
            CONSTRAINT = 'organization_members_must_keep_owner';
      END IF;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS
  organization_members_lock_owner_changes
ON public.organization_members;

CREATE TRIGGER organization_members_lock_owner_changes
BEFORE INSERT OR UPDATE OR DELETE
ON public.organization_members
FOR EACH ROW
EXECUTE FUNCTION public.lock_organization_membership_change();

DROP TRIGGER IF EXISTS
  organizations_lock_before_delete
ON public.organizations;

CREATE TRIGGER organizations_lock_before_delete
BEFORE DELETE
ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.lock_organization_before_delete();

DROP TRIGGER IF EXISTS
  organization_members_require_owner
ON public.organization_members;

CREATE CONSTRAINT TRIGGER organization_members_require_owner
AFTER INSERT OR UPDATE OR DELETE
ON public.organization_members
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.require_organization_owner();
