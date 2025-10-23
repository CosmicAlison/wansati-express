import dotenv from 'dotenv';
import postgres, { Sql } from 'postgres';

if (!process.env.DATABASE_URL) {
  dotenv.config();
}

let sql: Sql | null = null;

function connect(): Sql {
  if (sql) return sql;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');

  const sslDisabled = (process.env.PGSSLMODE || '').toLowerCase() === 'disable' || process.env.PGSSLMODE === '0';
  const ssl = sslDisabled ? false : { rejectUnauthorized: false };

  sql = postgres(databaseUrl, {
    ssl,
    max: process.env.PG_MAX_CLIENTS ? Number(process.env.PG_MAX_CLIENTS) : 5,
  });

  console.log('🟢 Database client created');
  return sql;
}

/**
 * Run a query safely with tagged template literal
 */
async function query<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T> {
  const client = connect();
  try {
    const res = await client(strings, ...values);
    return res as unknown as T;
  } catch (err: any) {
    console.error('DB query error:', err?.message ?? err);
    throw err;
  }
}

async function close(): Promise<void> {
  if (!sql) return;

  try {
    await sql.end({ timeout: 5 });
    sql = null;
    console.log('🟡 Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
}

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((sig) => {
  try {
    process.on(sig, async () => {
      console.log(`Received ${sig}, closing DB connection...`);
      await close();
      process.exit(0);
    });
  } catch (e) {}
});

export { connect, query, close };
