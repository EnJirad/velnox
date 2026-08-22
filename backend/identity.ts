/**
 * Velnox Backend — Identity + Authorization guards for Convex node actions.
 *
 * Centralized so every action enforces the same checks (spec §33–34):
 *   - requireIdentity     — signed-in user (Neon users synced from Convex auth)
 *   - requireRoles        — one of the given roles
 *   - requireSeller       — user owns a Seller
 *   - requireSellerForShop — user owns the shop
 *   - requirePermission   — granular staff permission (spec §47)
 * All checks run against the Neon source of truth; the frontend role is never
 * trusted on its own.
 */
import type { ActionCtx } from "../convex/_generated/server";
import { getDb } from "./db";
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

export async function requireIdentity(ctx: ActionCtx): Promise<Identity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw authRequired();
  const db = getDb();

  // --- Strategy 1: find existing user by convex_id (fast path) ---
  const existing = await db(
    "SELECT * FROM users WHERE convex_id = $1 LIMIT 1",
    [identity.subject],
  );
  if (existing[0]) {
    // Merge name/email from auth provider (never overwrite avatar/profile)
    await db(
      `UPDATE users
         SET email = COALESCE($2, email),
             name  = COALESCE($3, name)
       WHERE convex_id = $1`,
      [identity.subject, identity.email ?? null, identity.name ?? null],
    );
    return {
      subject: identity.subject,
      email: identity.email ?? null,
      name: identity.name ?? null,
      user: rowToUser(existing[0]),
    };
  }

  // --- Strategy 2: email already exists with a different convex_id → merge ---
  if (identity.email) {
    const byEmail = await db(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [identity.email],
    );
    if (byEmail[0]) {
      // Link this new convex_id to the existing user record.
      // All profile data (avatar, cover, addresses, orders) is preserved.
      await db(
        "UPDATE users SET convex_id = $1, name = COALESCE($2, name) WHERE id = $3",
        [identity.subject, identity.name ?? null, byEmail[0].id],
      );
      return {
        subject: identity.subject,
        email: identity.email,
        name: identity.name ?? null,
        user: rowToUser({ ...byEmail[0], convex_id: identity.subject }),
      };
    }
  }

  // --- Strategy 3: brand-new user → insert ---
  const rows = await db(
    `INSERT INTO users (convex_id, email, name, role)
       VALUES ($1, $2, $3, 'customer')
       ON CONFLICT (convex_id) DO UPDATE SET
         email = COALESCE(EXCLUDED.email, users.email),
         name  = COALESCE(EXCLUDED.name, users.name)
       RETURNING *`,
    [identity.subject, identity.email ?? null, identity.name ?? null],
  );
  return {
    subject: identity.subject,
    email: identity.email ?? null,
    name: identity.name ?? null,
    user: rowToUser(rows[0]),
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
  const rows = await getDb()("SELECT 1 FROM shops WHERE id = $1 AND seller_id = $2 LIMIT 1", [shopId, seller.id]);
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
