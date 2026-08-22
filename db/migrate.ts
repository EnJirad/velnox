/**
 * Velnox — Neon schema migration runner.
 *
 * Migration strategy:
 *   1. Create _schema_migrations tracking table (if not exists).
 *   2. Read applied migrations from tracking table.
 *   3. Discover all SQL files in db/migrations/ sorted by filename.
 *   4. Apply ONLY pending migrations.
 *
 * Edge cases:
 *   - Empty database: all migrations applied.
 *   - Existing database with history: only new migrations applied.
 *   - Existing tables but no migration history: detect and STOP safely.
 *
 * Atomic: migration recorded as applied ONLY after successful execution.
 * Safe re-runs: running multiple times is idempotent.
 *
 * Usage:
 *   DATABASE_URL=<neon-connection-string> bun run db:migrate
 *
 * The connection string lives in the project Keys/API keys UI — never commit
 * it or read it from a client-side file.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getPool } from "../backend/db";

const MIGRATION_TABLE = "_schema_migrations";

const pool = getPool();

// ── Helpers ─────────────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`[DB MIGRATION] ${msg}`);
const warn = (msg: string) => console.warn(`[DB MIGRATION] ⚠️  ${msg}`);

/**
 * Detect whether the database already contains application tables
 * (without migration history). Used for Case C detection.
 */
async function hasApplicationTables(): Promise<boolean> {
  const res = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'shops', 'products', 'orders')
    ) AS has_tables
  `);
  return res.rows[0]?.has_tables === true;
}

/**
 * Create the migration tracking table if it does not exist.
 */
async function ensureMigrationTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id          SERIAL PRIMARY KEY,
      migration   TEXT NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  log("Migration table ready");
}

/**
 * Get the set of already-applied migration filenames from the tracking table.
 */
async function getAppliedMigrations(): Promise<Set<string>> {
  const res = await pool.query(
    `SELECT migration FROM ${MIGRATION_TABLE} ORDER BY id`
  );
  return new Set(res.rows.map((r: { migration: string }) => r.migration));
}

/**
 * Discover migration SQL files in db/migrations/, sorted deterministically by filename.
 */
function discoverMigrations(): string[] {
  const migrationsDir = new URL("./migrations/", import.meta.url);
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

/**
 * Check for duplicate migration filenames (should never happen, but safety check).
 */
function validateMigrations(files: string[]): void {
  const seen = new Set<string>();
  for (const f of files) {
    if (seen.has(f)) {
      throw new Error(`Duplicate migration file: ${f}`);
    }
    seen.add(f);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

try {
  log("Database connected");

  // Check if this is a completely empty database (no tables at all)
  const tableCheck = await pool.query(`
    SELECT COUNT(*) AS cnt
      FROM information_schema.tables
     WHERE table_schema = 'public'
  `);
  const tableCount = Number(tableCheck.rows[0]?.cnt ?? 0);
  const isEmpty = tableCount === 0;

  if (isEmpty) {
    log("Empty database detected — applying all migrations");
  }

  // 1. Create migration tracking table
  await ensureMigrationTable();

  // 2. Get already-applied migrations
  const applied = await getAppliedMigrations();
  const appliedCount = applied.size;

  if (appliedCount > 0) {
    log(`${appliedCount} migration(s) already applied`);
  } else if (!isEmpty) {
    // Case C: existing tables but no migration history
    warn("Database contains existing schema but migration history is missing.");
    warn("Cannot safely determine which migrations to apply.");
    warn("Manually record applied migrations or reset the database.");
    warn("Stopping to prevent data corruption.");
    process.exitCode = 1;
    await pool.end();
    process.exit(1);
  }

  // 3. Discover migration files
  const files = discoverMigrations();
  validateMigrations(files);

  log(`Found ${files.length} migration(s) on disk`);

  // 4. Determine pending migrations
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    log("No pending migrations — database is up to date");
  } else {
    log(`${pending.length} migration(s) pending`);
    if (appliedCount > 0) {
      const skipped = files.filter((f) => applied.has(f));
      for (const s of skipped) {
        log(`Skipped: ${s} (already applied)`);
      }
    }
  }

  // 5. Apply pending migrations
  for (const f of pending) {
    const sql = readFileSync(
      join(new URL("./migrations/", import.meta.url).pathname, f),
      "utf8"
    );

    // Wrap in a transaction: execute SQL + record migration atomically
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `INSERT INTO ${MIGRATION_TABLE} (migration) VALUES ($1)`,
        [f]
      );
      await client.query("COMMIT");
      log(`Applied: ${f}`);
    } catch (err) {
      await client.query("ROLLBACK");
      const errMsg = err instanceof Error ? err.message : String(err);
      warn(`FAILED: ${f} — ${errMsg}`);
      warn("Stopping migration. Fix the failed migration and re-run.");
      process.exitCode = 1;
      await pool.end();
      process.exit(1);
    } finally {
      client.release();
    }
  }

  // 6. Summary
  const finalRes = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  const tables = (finalRes.rows as { table_name: string }[]).map(
    (r) => r.table_name
  );
  log(`Migration complete — ${tables.length} tables in public schema`);
  for (const t of tables) console.log(`   - ${t}`);
} catch (err) {
  console.error(
    "❌ Migration failed:",
    err instanceof Error ? err.message : err
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
