-- ============================================================================
-- Velnox — Migration 016: Canonical Identity (normalized email index)
-- ============================================================================
-- Prevents duplicate users with same email (different case/whitespace).
-- Uses a partial unique index on LOWER(TRIM(email)) so:
--   - User@Gmail.com === user@gmail.com === " user@gmail.com "
--   - Only applies to non-null emails
--   - Allows multiple NULL emails (anonymous users)
--
-- Before applying: check for existing duplicate emails in production.
-- If duplicates exist, they must be manually resolved before this index
-- can be created without error.
--
-- Safe: idempotent — re-runnable.
-- ============================================================================

-- Normalized email unique index (partial — only non-null emails)
-- This prevents duplicate users with same email in different cases.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_normalized_email
  ON users (LOWER(TRIM(email)))
  WHERE email IS NOT NULL;
