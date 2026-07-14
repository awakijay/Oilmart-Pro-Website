import { randomUUID, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';

const { Pool } = pg;
const scrypt = promisify(scryptCallback);

const isProduction = process.env.NODE_ENV === 'production';
const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@oilmartpro.local';
const defaultConnectionString = 'postgresql://postgres:postgres@localhost:5432/oilmartpro';

const useDiscreteConfig = [process.env.PGHOST, process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD].some(Boolean);
const hasDatabaseConfig = Boolean(process.env.DATABASE_URL) || useDiscreteConfig;

if (isProduction && !hasDatabaseConfig) {
  throw new Error('Production requires DATABASE_URL or PGHOST, PGDATABASE, PGUSER, and PGPASSWORD.');
}

if (isProduction && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123')) {
  throw new Error('Production requires a strong ADMIN_PASSWORD. Do not use the development default.');
}

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

const databaseUrl = process.env.DATABASE_URL || defaultConnectionString;
const requiresSsl = process.env.PGSSLMODE === 'require' || databaseUrl.includes('sslmode=require');
const sharedPoolOptions = {
  max: numberFromEnv('DB_POOL_MAX', 10),
  idleTimeoutMillis: numberFromEnv('DB_IDLE_TIMEOUT_MS', 30000),
  connectionTimeoutMillis: numberFromEnv('DB_CONNECTION_TIMEOUT_MS', 10000),
};

export const pool = new Pool(
  useDiscreteConfig
    ? {
        ...sharedPoolOptions,
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
      }
    : {
        ...sharedPoolOptions,
        connectionString: databaseUrl,
        ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
      },
);

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}

export async function closeDatabase() {
  await pool.end();
}

async function hashPassword(password, salt = randomUUID()) {
  const derivedKey = await scrypt(password, salt, 64);
  return {
    passwordSalt: salt,
    passwordHash: derivedKey.toString('hex'),
  };
}

export async function initializeDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      avatar TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      rating DOUBLE PRECISION NOT NULL DEFAULT 0,
      orders_label TEXT NOT NULL DEFAULT '0',
      description TEXT NOT NULL DEFAULT '',
      specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT '',
      author TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('published', 'draft')),
      category TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      email TEXT NOT NULL,
      product TEXT NOT NULL,
      amount TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL,
      operation_type TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS quote_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      intent TEXT NOT NULL CHECK (intent IN ('quote', 'sales', 'support', 'question')),
      status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Accepted', 'Rejected')),
      date TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chat_threads (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('guest', 'account')),
      user_email TEXT,
      user_name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'admin')),
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
    CREATE INDEX IF NOT EXISTS idx_chat_threads_user_email ON chat_threads(user_email);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id ON chat_messages(thread_id);
  `);

  await query(`ALTER TABLE users ALTER COLUMN avatar TYPE TEXT`);
  await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);

  await query(`INSERT INTO chat_threads (id, label, source) VALUES ('guest-support', 'Website Support Inbox', 'guest') ON CONFLICT (id) DO NOTHING`);

  const existingAdmin = await query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
  if (existingAdmin.rowCount) return;

  const passwordState = await hashPassword(defaultAdminPassword);
  await query(
    `INSERT INTO users (
      id, first_name, last_name, username, email, phone, company, avatar, role, password_salt, password_hash
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      randomUUID(),
      'Admin',
      'User',
      defaultAdminUsername,
      defaultAdminEmail,
      '',
      'Oilmart Pro',
      '',
      'admin',
      passwordState.passwordSalt,
      passwordState.passwordHash,
    ],
  );
}
