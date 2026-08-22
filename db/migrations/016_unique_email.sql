-- Migration 016: Enforce 1 email = 1 user + clean up duplicates
--
-- PROBLEM: email column has no UNIQUE constraint, so the same person could
-- end up with multiple user records (different convex_ids, same email).
-- This causes avatar/profile data to be split across records.
--
-- FIX: Deduplicate by keeping the oldest record per email, then add UNIQUE.

-- 1. Deduplicate: for each email that appears more than once, keep the row
--    with the earliest created_at and merge avatar/cover from newer rows if null.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT email, array_agg(id ORDER BY created_at) AS ids
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING count(*) > 1
  LOOP
    -- For each duplicate set, keep the first (oldest) row and
    -- merge non-null fields from newer rows into it.
    UPDATE users SET
      avatar_url = COALESCE(
        (SELECT avatar_url FROM users WHERE id = r.ids[1]),
        (SELECT avatar_url FROM users WHERE id = r.ids[array_length(r.ids,1)])
      ),
      cover_url = COALESCE(
        (SELECT cover_url FROM users WHERE id = r.ids[1]),
        (SELECT cover_url FROM users WHERE id = r.ids[array_length(r.ids,1)])
      ),
      phone = COALESCE(
        (SELECT phone FROM users WHERE id = r.ids[1]),
        (SELECT phone FROM users WHERE id = r.ids[array_length(r.ids,1)])
      )
    WHERE id = r.ids[1];

    -- Delete all but the oldest row for this email
    DELETE FROM users
    WHERE email = r.email
      AND id != r.ids[1];

    RAISE NOTICE 'Merged % duplicate user(s) for email %', array_length(r.ids,1) - 1, r.email;
  END LOOP;
END $$;

-- 2. Add UNIQUE constraint on email (NULLs are allowed — multiple users
--    without email is fine; only non-null emails must be unique).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users (email)
  WHERE email IS NOT NULL;
