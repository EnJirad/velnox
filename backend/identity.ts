/**
 * Velnox Backend — Identity + Authorization guards for Convex node actions.
 *
 * Centralized so every action enforces the same checks (spec §33–34):
 *   - requireIdentity     — signed-in user (Neon users synced from Convex auth)
 *   - requireRoles        — one of the given roles
 *   - requireSeller       — user owns a Seller
 *   - requireSellerForShop — user owns the shop
 *   - requirePermission   — granular staff permission (spec §47)
 *
 * CANONICAL IDENTITY RULE:
 *   ONE REAL USER → ONE CANONICAL Neon users.id
 *
 *   Identity resolution (in order):
 *     1. Match by convex_id (Convex auth subject) → existing user
 *     2. Match by normalized email → link auth identity to existing user
 *     3. Create new user only if neither match exists
 *
 *   Race condition prevention:
 *     All identity resolution runs inside a PostgreSQL transaction with
 *     SELECT FOR UPDATE to prevent duplicate user creation under concurrency.
 *
 * All checks run against the Neon source of truth; the frontend role is never
 * trusted on its own.
 */
import type { ActionCtx } from "../convex/_generated/server";
import { getDb, getPool } from "./db";
import { AppError, authRequired, forbidden } from "./errors";
import { getSellerByOwner } from "./sellers";
import { requirePermission as checkPermission } from "./permissions";
import type { Department, Permission, Role, Seller, User } from "./types";
import { toMs } from "./dates";

export interface Identity {
  subject: string;
  email: string | null;
  name: string | null;
  user: User;
}

/** Normalize email for canonical matching: trim + lowercase. */
function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function rowToUser(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    convexId: row.convex_id as string,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    name: (row.name as string) ?? null,
    role: row.role as Role,
    department: (row.department as Department) ?? null,
    avatarUrl: (row.avatar_url as string) ?? null,
    coverUrl: (row.cover_url as string) ?? null,
    createdAt: toMs(row.created_at),
  };
}

/**
 * Resolve the canonical Neon user for the authenticated Convex identity.
 *
 * Uses a PostgreSQL transaction with SELECT FOR UPDATE to prevent
 * race conditions where two concurrent requests create duplicate users.
 *
 * Resolution order:
 *   1. Find by convex_id (fast path — existing identity mapping)
 *   2. Find by normalized email (link new auth identity to existing user)
 *   3. Insert new user (only when no match exists)
 */
export async function requireIdentity(ctx: ActionCtx): Promise<Identity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw authRequired();

  const subject = identity.subject;
  const authEmail = normalizeEmail(identity.email);
  const authName = identity.name ?? null;

  // Use a transaction to prevent race conditions during user creation.
  // withTransaction handles BEGIN/COMMIT/ROLLBACK and connection release.
  const { withTransaction } = await import("./db");
  const user = await withTransaction(async (client) => {
    // ─── PRIORITY 1: Match by convex_id (fast path) ────────────────────
    // This is the most common case: user has logged in before with this
    // Convex auth identity. SELECT FOR UPDATE prevents concurrent
    // transactions from modifying the same row.
    const existingById = await client.query(
      "SELECT * FROM users WHERE convex_id = $1 LIMIT 1 FOR UPDATE",
      [subject],
    );

    if (existingById.rows[0]) {
      // Update name/email from auth provider if they changed (e.g., user
      // updated their Google name). Never overwrite avatar/profile data.
      await client.query(
        `UPDATE users
           SET email = COALESCE($2, email),
               name  = COALESCE($3, name)
         WHERE convex_id = $1`,
        [subject, authEmail, authName],
      );
      return existingById.rows[0];
    }

    // ─── PRIORITY 2: Match by normalized email ─────────────────────────
    // A user exists with this email but a different convex_id. This can
    // happen when:
    //   - User logged in with Email OTP first, then Google (new subject)
    //   - Convex Auth generated a new subject after session expiry
    //   - User cleared cookies and re-authenticated
    //
    // We LINK the new auth identity to the existing Neon user.
    // The existing user.id is preserved — all business data stays intact.
    if (authEmail) {
      const existingByEmail = await client.query(
        "SELECT * FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1 FOR UPDATE",
        [authEmail],
      );

      if (existingByEmail.rows[0]) {
        // Link the new convex_id to the existing user.
        // Only update convex_id and name — preserve everything else.
        await client.query(
          "UPDATE users SET convex_id = $1, name = COALESCE($2, name) WHERE id = $3",
          [subject, authName, existingByEmail.rows[0].id],
        );
        return { ...existingByEmail.rows[0], convex_id: subject };
      }
    }

    // ─── PRIORITY 3: Brand-new user → INSERT ───────────────────────────
    // Neither convex_id nor email matched. This is a first-time login.
    // ON CONFLICT (convex_id) handles the extremely unlikely case where
    // another transaction inserted the same convex_id between our SELECT
    // and INSERT (defensive programming).
    const insertResult = await client.query(
      `INSERT INTO users (convex_id, email, name, role)
         VALUES ($1, $2, $3, 'customer')
         ON CONFLICT (convex_id) DO UPDATE SET
           email = COALESCE(EXCLUDED.email, users.email),
           name  = COALESCE(EXCLUDED.name, users.name)
         RETURNING *`,
      [subject, authEmail, authName],
    );
    return insertResult.rows[0];
  });

  return {
    subject,
    email: authEmail,
    name: authName,
    user: rowToUser(user),
  };
}

/** Require the user's role to be one of the allowed roles. */
export async function requireRoles(ctx: ActionCtx, roles: Role[]): Promise<Identity> {
  const id = await requireIdentity(ctx);
  if (!roles.includes(id.user.role)) throw forbidden("คุณไม่มีสิทธิ์เข้าถึงส่วนนี้");
  return id;
}

/** Require an active seller owned by the user. */
export async function requireSeller(ctx: ActionCtx): Promise<{ identity: Identity; seller: Seller }> {
  const identity = await requireIdentity(ctx);
  const seller = await getSellerByOwner(getDb(), identity.user.id);
  if (!seller) throw new AppError("FORBIDDEN", "ไม่พบร้านค้าของคุณ — กรุณาเปิดร้านก่อน");
  return { identity, seller };
}

/** Require the seller to own the shop. */
export async function requireSellerForShop(ctx: ActionCtx, shopId: string): Promise<{ identity: Identity; seller: Seller }> {
  const { identity, seller } = await requireSeller(ctx);
  const db = getDb();
  const rows = await db("SELECT 1 FROM shops WHERE id = $1 AND seller_id = $2 LIMIT 1", [shopId, seller.id]);
  if (!rows[0]) throw forbidden("ร้านนี้ไม่ใช่ของคุณ");
  return { identity, seller };
}

/** Require a granular staff permission (owner/admin always pass). */
export async function requirePermission(ctx: ActionCtx, permission: Permission): Promise<Identity> {
  const identity = await requireIdentity(ctx);
  await checkPermission(getDb(), { userId: identity.user.id, role: identity.user.role, permission });
  return identity;
}

/** velcenter gate — owner / admin / staff. */
export async function requireCenter(ctx: ActionCtx): Promise<Identity> {
  return requireRoles(ctx, ["owner", "admin", "staff"]);
}

/** Require an IP/user-agent if available (best-effort for audit logs). */
export function clientMeta(ctx: ActionCtx): { ipAddress: string | null; userAgent: string | null } {
  try {
    const headers = (ctx as unknown as { headers?: Headers }).headers;
    return {
      ipAddress: headers?.get("x-forwarded-for") ?? headers?.get("x-real-ip") ?? null,
      userAgent: headers?.get("user-agent") ?? null,
    };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}
