import http from 'node:http';
import { randomUUID, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { closeDatabase, initializeDatabase, query } from './db.mjs';

const scrypt = promisify(scryptCallback);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const distDirectory = path.join(workspaceRoot, 'dist');
const isProduction = process.env.NODE_ENV === 'production';
const defaultPort = Number(process.env.PORT || 4000);
const defaultHost = process.env.HOST || '127.0.0.1';
const sessionDurationMs = Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7);
const maxRequestBodySizeBytes = Number(process.env.MAX_REQUEST_BODY_BYTES || 1024 * 1024);
const authRateLimitState = new Map();
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'];
const configuredAllowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins]);
const allowAnyCorsOrigin = !isProduction && configuredAllowedOrigins.length === 0;
const includeHealthCounts = process.env.HEALTH_INCLUDE_COUNTS ? process.env.HEALTH_INCLUDE_COUNTS === 'true' : !isProduction;
const guestThread = { id: 'guest-support', label: 'Website Support Inbox', source: 'guest' };
let databaseInitializationPromise = null;

const configs = {
  products: {
    route: '/api/products', table: 'products', adminOnly: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), name: b.name ?? '', category: b.category ?? '', price: b.price ?? '', image: b.image ?? '', rating: b.rating ?? 0, orders_label: b.orders ?? '0', description: b.description ?? '', specifications: b.specifications ?? {} }),
    api: (r) => ({ id: r.id, name: r.name, category: r.category, price: r.price, image: r.image, rating: Number(r.rating), orders: r.orders_label, description: r.description, specifications: parseJson(r.specifications, {}) }),
  },
  blogPosts: {
    route: '/api/blog-posts', table: 'blog_posts', adminOnly: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), title: b.title ?? '', excerpt: b.excerpt ?? '', content: b.content ?? '', image: b.image ?? '', author: b.author ?? '', date: b.date ?? new Date().toISOString().split('T')[0], status: b.status ?? 'draft', category: b.category ?? '' }),
    api: (r) => ({ id: r.id, title: r.title, excerpt: r.excerpt, content: r.content, image: r.image, author: r.author, date: r.date, status: r.status, category: r.category }),
  },
  orders: {
    route: '/api/orders', table: 'orders', customerCreate: true, customerMine: true, adminRead: true, adminWrite: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), customer: b.customer ?? '', email: b.email ?? '', product: b.product ?? '', amount: b.amount ?? '', status: b.status ?? 'Pending', date: b.date ?? new Date().toISOString().split('T')[0], operation_type: b.operationType ?? '' }),
    api: (r) => ({ id: r.id, customer: r.customer, email: r.email, product: r.product, amount: r.amount, status: r.status, date: r.date, operationType: r.operation_type }),
  },
  quoteRequests: {
    route: '/api/quote-requests', table: 'quote_requests', publicCreate: true, adminRead: true, adminWrite: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), name: b.name ?? '', email: b.email ?? '', company: b.company ?? '', subject: b.subject ?? '', message: b.message ?? '', intent: b.intent ?? 'support', status: b.status ?? 'Pending', date: b.date ?? new Date().toISOString().split('T')[0] }),
    api: (r) => ({ id: r.id, name: r.name, email: r.email, company: r.company, subject: r.subject, message: r.message, intent: r.intent, status: r.status, date: r.date }),
  },
  chatThreads: {
    route: '/api/chat/threads', table: 'chat_threads', customAccess: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), label: b.label ?? '', source: b.source ?? 'guest', user_email: b.userEmail ?? null, user_name: b.userName ?? null }),
    api: (r) => ({ id: r.id, label: r.label, source: r.source, userEmail: r.user_email ?? undefined, userName: r.user_name ?? undefined }),
  },
  chatMessages: {
    route: '/api/chat/messages', table: 'chat_messages', customAccess: true,
    row: (b) => ({ id: b.id?.toString().trim() || randomUUID(), thread_id: b.threadId ?? '', sender: b.sender ?? 'user', text: b.text ?? '', timestamp: b.timestamp ?? new Date().toISOString() }),
    api: (r) => ({ id: r.id, threadId: r.thread_id, sender: r.sender, text: r.text, timestamp: r.timestamp }),
  },
};

function parseJson(value, fallback) { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } }
function securityHeaders() {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
  if (isProduction && process.env.ENABLE_HSTS !== 'false') {
    headers['Strict-Transport-Security'] = 'max-age=15552000; includeSubDomains';
  }
  return headers;
}
function corsHeaders(origin) {
  const headers = { 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS' };
  if (!origin) return headers;
  if (allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  } else if (allowAnyCorsOrigin) {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  return headers;
}
function json(response, statusCode, payload, origin) { response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin), ...securityHeaders() }); response.end(JSON.stringify(payload, null, isProduction ? 0 : 2)); }
function normalizeEmail(value = '') { return value.trim().toLowerCase(); }
function getBearerToken(request) { const h = request.headers.authorization; return h?.startsWith('Bearer ') ? h.slice(7).trim() : null; }
function slugFromPath(pathname, prefix) { if (!pathname.startsWith(prefix)) return null; const rest = pathname.slice(prefix.length); return rest.startsWith('/') ? rest.slice(1) : rest; }
function buildRateLimitKey(request, suffix) { return `${request.socket.remoteAddress ?? 'unknown'}:${suffix}`; }
function createSession(userId) { return { token: randomUUID(), userId, createdAt: new Date().toISOString() }; }
function getAllowedCustomerThreadId(user) { return `account:${user.email}`; }
function notFound(r, o) { json(r, 404, { error: 'Not found' }, o); }
function methodNotAllowed(r, o) { json(r, 405, { error: 'Method not allowed' }, o); }
function badRequest(r, o, m) { json(r, 400, { error: m }, o); }
function unauthorized(r, o) { json(r, 401, { error: 'Unauthorized' }, o); }
function forbidden(r, o) { json(r, 403, { error: 'Forbidden' }, o); }
function tooManyRequests(r, o) { json(r, 429, { error: 'Too many requests. Please try again later.' }, o); }

async function parseBody(request) {
  const chunks = []; let total = 0;
  for await (const chunk of request) { total += chunk.length; if (total > maxRequestBodySizeBytes) throw new Error('BODY_TOO_LARGE'); chunks.push(chunk); }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('INVALID_JSON'); }
}

function buildStaticFilePath(pathname) {
  if (pathname === '/') return path.join(distDirectory, 'index.html');
  const safePath = path.normalize(path.join(distDirectory, pathname));
  return safePath.startsWith(distDirectory) ? safePath : null;
}

function contentTypeFor(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

async function serveStatic(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const requestedPath = buildStaticFilePath(url.pathname);
  if (!requestedPath) { response.writeHead(403, securityHeaders()); response.end('Forbidden'); return; }
  try {
    const fileContents = await readFile(requestedPath);
    response.writeHead(200, { 'Content-Type': contentTypeFor(requestedPath), ...securityHeaders() });
    response.end(fileContents);
  } catch {
    try {
      const fileContents = await readFile(path.join(distDirectory, 'index.html'));
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...securityHeaders() });
      response.end(fileContents);
    } catch {
      response.writeHead(404, securityHeaders());
      response.end('Frontend build not found. Run "npm run build" first.');
    }
  }
}

async function purgeExpiredSessions() {
  await query(`DELETE FROM sessions WHERE created_at < NOW() - ($1::bigint * INTERVAL '1 millisecond')`, [sessionDurationMs]);
}

async function getAuthenticatedSession(request) {
  await purgeExpiredSessions();
  const token = getBearerToken(request);
  if (!token) return null;
  const result = await query(`SELECT sessions.token, sessions.created_at AS session_created_at, users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = $1 LIMIT 1`, [token]);
  return result.rowCount ? { session: { token: result.rows[0].token, createdAt: result.rows[0].session_created_at }, user: result.rows[0] } : null;
}

async function requireAdminSession(request) {
  const authState = await getAuthenticatedSession(request);
  return authState?.user.role === 'admin' ? authState : null;
}

async function verifyPassword(password, salt, hash) {
  const derivedKey = await scrypt(password, salt, 64);
  const hashedBuffer = Buffer.from(hash, 'hex');
  return hashedBuffer.length === derivedKey.length && timingSafeEqual(hashedBuffer, derivedKey);
}

async function hashPassword(password, salt = randomUUID()) {
  const derivedKey = await scrypt(password, salt, 64);
  return { passwordSalt: salt, passwordHash: derivedKey.toString('hex') };
}

function sanitizeUser(user) {
  return user ? { id: user.id, firstName: user.first_name, lastName: user.last_name, username: user.username, email: user.email, phone: user.phone, company: user.company, avatar: user.avatar, role: user.role } : null;
}

function isRateLimited(request, suffix, limit = 10, windowMs = 15 * 60 * 1000) {
  const key = buildRateLimitKey(request, suffix), now = Date.now();
  const current = authRateLimitState.get(key) ?? { count: 0, expiresAt: now + windowMs };
  const next = current.expiresAt <= now ? { count: 1, expiresAt: now + windowMs } : { ...current, count: current.count + 1 };
  authRateLimitState.set(key, next);
  return next.count > limit;
}

function buildInsert(table, row) {
  const keys = Object.keys(row), cols = keys.join(', '), vals = keys.map((_, i) => `$${i + 1}`).join(', ');
  return { text: `INSERT INTO ${table} (${cols}) VALUES (${vals}) ON CONFLICT (id) DO NOTHING RETURNING *`, values: keys.map((k) => typeof row[k] === 'object' && row[k] !== null ? JSON.stringify(row[k]) : row[k]) };
}

function buildUpdate(table, id, row) {
  const keys = Object.keys(row);
  const assignments = keys.map((k, i) => `${k} = $${i + 2}`);

  if (table !== 'users') {
    assignments.push('updated_at = NOW()');
  }

  return { text: `UPDATE ${table} SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`, values: [id, ...keys.map((k) => typeof row[k] === 'object' && row[k] !== null ? JSON.stringify(row[k]) : row[k])] };
}

function ensureDatabaseInitialized() {
  if (!databaseInitializationPromise) {
    databaseInitializationPromise = initializeDatabase().catch((error) => {
      databaseInitializationPromise = null;
      throw error;
    });
  }

  return databaseInitializationPromise;
}

async function handleAuthRoutes(request, response, pathname, origin) {
  if (pathname === '/api/auth/register') {
    if (request.method !== 'POST') { methodNotAllowed(response, origin); return true; }
    if (isRateLimited(request, 'auth-register')) { tooManyRequests(response, origin); return true; }
    const body = await parseBody(request), firstName = body.firstName?.trim(), lastName = body.lastName?.trim(), email = normalizeEmail(body.email), password = body.password?.trim();
    if (!firstName || !lastName || !email || !password) { badRequest(response, origin, 'firstName, lastName, email, and password are required.'); return true; }
    if ((await query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])).rowCount) { badRequest(response, origin, 'An account with this email already exists.'); return true; }
    const p = await hashPassword(password), userId = randomUUID(), session = createSession(userId);
    await query(`INSERT INTO users (id, first_name, last_name, username, email, phone, company, avatar, role, password_salt, password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [userId, firstName, lastName, body.username?.trim() ?? email.split('@')[0], email, body.phone?.trim() ?? '', body.company?.trim() ?? '', body.avatar?.trim() ?? '', 'customer', p.passwordSalt, p.passwordHash]);
    await query(`INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)`, [session.token, userId, session.createdAt]);
    const user = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    json(response, 201, { user: sanitizeUser(user.rows[0]), token: session.token }, origin); return true;
  }
  if (pathname === '/api/auth/login') {
    if (request.method !== 'POST') { methodNotAllowed(response, origin); return true; }
    if (isRateLimited(request, 'auth-login')) { tooManyRequests(response, origin); return true; }
    const body = await parseBody(request), email = normalizeEmail(body.email), password = body.password?.trim() ?? '', result = await query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email]), user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) { unauthorized(response, origin); return true; }
    const session = createSession(user.id);
    await query(`INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)`, [session.token, user.id, session.createdAt]);
    json(response, 200, { user: sanitizeUser(user), token: session.token }, origin); return true;
  }
  if (pathname === '/api/auth/me') {
    if (request.method !== 'GET') { methodNotAllowed(response, origin); return true; }
    const authState = await getAuthenticatedSession(request);
    if (!authState) { unauthorized(response, origin); return true; }
    json(response, 200, { user: sanitizeUser(authState.user) }, origin); return true;
  }
  if (pathname === '/api/admin/login') {
    if (request.method !== 'POST') { methodNotAllowed(response, origin); return true; }
    if (isRateLimited(request, 'admin-login', 8)) { tooManyRequests(response, origin); return true; }
    const body = await parseBody(request), identifier = body.username?.trim().toLowerCase() ?? '', password = body.password?.trim() ?? '';
    const result = await query(`SELECT * FROM users WHERE role = 'admin' AND (LOWER(username) = $1 OR email = $2) LIMIT 1`, [identifier, normalizeEmail(identifier)]), user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) { unauthorized(response, origin); return true; }
    const session = createSession(user.id);
    await query(`INSERT INTO sessions (token, user_id, created_at) VALUES ($1,$2,$3)`, [session.token, user.id, session.createdAt]);
    json(response, 200, { user: sanitizeUser(user), token: session.token }, origin); return true;
  }
  if (pathname === '/api/admin/me') {
    if (request.method !== 'GET') { methodNotAllowed(response, origin); return true; }
    const adminState = await requireAdminSession(request);
    if (!adminState) { unauthorized(response, origin); return true; }
    json(response, 200, { user: sanitizeUser(adminState.user) }, origin); return true;
  }
  if (pathname === '/api/admin/logout' || pathname === '/api/auth/logout') {
    if (request.method !== 'POST') { methodNotAllowed(response, origin); return true; }
    const token = getBearerToken(request);
    if (!token) { unauthorized(response, origin); return true; }
    if (pathname === '/api/admin/logout' && !(await requireAdminSession(request))) { unauthorized(response, origin); return true; }
    await query(`DELETE FROM sessions WHERE token = $1`, [token]);
    json(response, 200, { success: true }, origin); return true;
  }
  return false;
}

async function handleUsersRoutes(request, response, pathname, origin) {
  if (pathname === '/api/users') {
    if (request.method !== 'GET') { methodNotAllowed(response, origin); return true; }
    if (!(await requireAdminSession(request))) { forbidden(response, origin); return true; }
    const users = await query(`SELECT * FROM users ORDER BY created_at DESC`);
    json(response, 200, users.rows.map(sanitizeUser), origin); return true;
  }
  const userId = slugFromPath(pathname, '/api/users');
  if (!userId) return false;
  if (request.method !== 'PUT' && request.method !== 'PATCH') { methodNotAllowed(response, origin); return true; }
  const authState = await getAuthenticatedSession(request);
  if (!authState || (authState.user.role !== 'admin' && authState.user.id !== userId)) { forbidden(response, origin); return true; }
  const body = await parseBody(request);
  const current = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
  if (!current.rowCount) { notFound(response, origin); return true; }
  const row = current.rows[0], next = { first_name: body.firstName?.trim() ?? row.first_name, last_name: body.lastName?.trim() ?? row.last_name, phone: body.phone?.trim() ?? row.phone, company: body.company?.trim() ?? row.company, avatar: body.avatar?.trim() ?? row.avatar };
  const updated = await query(
    `UPDATE users
      SET first_name = $2, last_name = $3, phone = $4, company = $5, avatar = $6
      WHERE id = $1
      RETURNING *`,
    [userId, next.first_name, next.last_name, next.phone, next.company, next.avatar],
  );
  json(response, 200, sanitizeUser(updated.rows[0]), origin); return true;
}

async function readRows(config, request, authState) {
  const url = new URL(request.url, 'http://localhost');
  if (config.table === 'orders') {
    if (authState?.user.role === 'admin') return (await query(`SELECT * FROM orders ORDER BY created_at DESC`)).rows;
    if (!authState || url.searchParams.get('mine') !== 'true') throw new Error('FORBIDDEN');
    return (await query(`SELECT * FROM orders WHERE LOWER(email) = $1 ORDER BY created_at DESC`, [authState.user.email])).rows;
  }
  if (config.table === 'quote_requests') {
    if (authState?.user.role !== 'admin') throw new Error('FORBIDDEN');
    return (await query(`SELECT * FROM quote_requests ORDER BY created_at DESC`)).rows;
  }
  if (config.table === 'chat_threads') {
    if (authState?.user.role === 'admin') return (await query(`SELECT * FROM chat_threads ORDER BY created_at DESC`)).rows;
    const customerThreadId = authState ? getAllowedCustomerThreadId(authState.user) : null;
    return (await query(`SELECT * FROM chat_threads WHERE id = $1 OR id = $2 ORDER BY created_at DESC`, [guestThread.id, customerThreadId])).rows;
  }
  if (config.table === 'chat_messages') {
    const threadId = url.searchParams.get('threadId');
    if (!threadId) throw new Error('FORBIDDEN');
    if (authState?.user.role !== 'admin' && threadId !== guestThread.id && (!authState || threadId !== getAllowedCustomerThreadId(authState.user))) throw new Error('FORBIDDEN');
    return (await query(`SELECT * FROM chat_messages WHERE thread_id = $1 ORDER BY created_at ASC`, [threadId])).rows;
  }
  return (await query(`SELECT * FROM ${config.table} ORDER BY created_at DESC`)).rows;
}

async function createRow(config, request, authState, body) {
  if (config.adminOnly && authState?.user.role !== 'admin') throw new Error('FORBIDDEN');
  if (config.customerCreate && !authState) throw new Error('UNAUTHORIZED');
  if (config.customAccess && config.table === 'chat_threads' && authState?.user.role !== 'admin') {
    if (body.id === guestThread.id) return guestThread;
    if (!authState || body.id !== getAllowedCustomerThreadId(authState.user)) throw new Error('FORBIDDEN');
  }
  if (config.customAccess && config.table === 'chat_messages' && authState?.user.role !== 'admin') {
    const threadId = body.threadId?.toString().trim() ?? '', allowed = authState ? getAllowedCustomerThreadId(authState.user) : null;
    if (threadId !== guestThread.id && threadId !== allowed) throw new Error('FORBIDDEN');
  }
  const row = config.row(body), insert = buildInsert(config.table, row), result = await query(insert.text, insert.values);
  const stored = result.rowCount ? result.rows[0] : (await query(`SELECT * FROM ${config.table} WHERE id = $1`, [row.id])).rows[0];
  return config.api(stored);
}

async function updateRow(config, itemId, authState, body) {
  if (!config.adminWrite || authState?.user.role !== 'admin') throw new Error('FORBIDDEN');
  const existing = await query(`SELECT * FROM ${config.table} WHERE id = $1`, [itemId]);
  if (!existing.rowCount) return null;
  const merged = { ...config.api(existing.rows[0]), ...body, id: itemId }, next = config.row(merged), statement = buildUpdate(config.table, itemId, next), result = await query(statement.text, statement.values);
  return config.api(result.rows[0]);
}

async function deleteRow(config, itemId, authState) {
  if ((config.adminOnly || config.adminWrite || config.customAccess) && authState?.user.role !== 'admin') throw new Error('FORBIDDEN');
  return (await query(`DELETE FROM ${config.table} WHERE id = $1 RETURNING id`, [itemId])).rowCount > 0;
}

async function handleCollectionRoutes(request, response, pathname, origin) {
  const authState = await getAuthenticatedSession(request);
  for (const config of Object.values(configs)) {
    if (pathname === config.route) {
      if (request.method === 'GET') {
        try { json(response, 200, (await readRows(config, request, authState)).map(config.api), origin); } catch (e) { if (e instanceof Error && e.message === 'FORBIDDEN') forbidden(response, origin); else throw e; } return true;
      }
      if (request.method === 'POST') {
        try { json(response, 201, await createRow(config, request, authState, await parseBody(request)), origin); } catch (e) { if (e instanceof Error && e.message === 'FORBIDDEN') forbidden(response, origin); else if (e instanceof Error && e.message === 'UNAUTHORIZED') unauthorized(response, origin); else throw e; } return true;
      }
      methodNotAllowed(response, origin); return true;
    }
    const itemId = slugFromPath(pathname, config.route);
    if (!itemId) continue;
    if (request.method === 'GET') {
      const result = await query(`SELECT * FROM ${config.table} WHERE id = $1`, [itemId]);
      if (!result.rowCount) { notFound(response, origin); return true; }
      const row = result.rows[0];
      if (config.table === 'orders' && authState?.user.role !== 'admin' && (!authState || normalizeEmail(row.email) !== authState.user.email)) { forbidden(response, origin); return true; }
      if (config.table === 'quote_requests' && authState?.user.role !== 'admin') { forbidden(response, origin); return true; }
      json(response, 200, config.api(row), origin); return true;
    }
    if (request.method === 'PUT' || request.method === 'PATCH') {
      try { const updated = await updateRow(config, itemId, authState, await parseBody(request)); if (!updated) { notFound(response, origin); return true; } json(response, 200, updated, origin); } catch (e) { if (e instanceof Error && e.message === 'FORBIDDEN') forbidden(response, origin); else throw e; } return true;
    }
    if (request.method === 'DELETE') {
      try { const deleted = await deleteRow(config, itemId, authState); if (!deleted) { notFound(response, origin); return true; } json(response, 200, { success: true }, origin); } catch (e) { if (e instanceof Error && e.message === 'FORBIDDEN') forbidden(response, origin); else throw e; } return true;
    }
    methodNotAllowed(response, origin); return true;
  }
  return false;
}

async function handleHealthRoute(request, response, pathname, origin) {
  if (pathname !== '/api/health') return false;
  if (request.method !== 'GET') { methodNotAllowed(response, origin); return true; }
  if (!includeHealthCounts) {
    json(response, 200, { status: 'ok', timestamp: new Date().toISOString() }, origin); return true;
  }
  const [users, products, blogPosts, orders, quoteRequests, chatThreads, chatMessages] = await Promise.all([query(`SELECT COUNT(*)::int AS count FROM users`), query(`SELECT COUNT(*)::int AS count FROM products`), query(`SELECT COUNT(*)::int AS count FROM blog_posts`), query(`SELECT COUNT(*)::int AS count FROM orders`), query(`SELECT COUNT(*)::int AS count FROM quote_requests`), query(`SELECT COUNT(*)::int AS count FROM chat_threads`), query(`SELECT COUNT(*)::int AS count FROM chat_messages`)]);
  json(response, 200, { status: 'ok', timestamp: new Date().toISOString(), counts: { users: users.rows[0].count, products: products.rows[0].count, blogPosts: blogPosts.rows[0].count, orders: orders.rows[0].count, quoteRequests: quoteRequests.rows[0].count, chatThreads: chatThreads.rows[0].count, chatMessages: chatMessages.rows[0].count } }, origin); return true;
}

export async function requestHandler(request, response) {
  const url = new URL(request.url, 'http://localhost'), origin = request.headers.origin;
  if (request.method === 'OPTIONS') { response.writeHead(204, { ...corsHeaders(origin), ...securityHeaders() }); response.end(); return; }
  try {
    await ensureDatabaseInitialized();
    const handled = (await handleHealthRoute(request, response, url.pathname, origin)) || (await handleAuthRoutes(request, response, url.pathname, origin)) || (await handleUsersRoutes(request, response, url.pathname, origin)) || (await handleCollectionRoutes(request, response, url.pathname, origin));
    if (handled) return;
    if (url.pathname.startsWith('/api/')) { notFound(response, origin); return; }
    await serveStatic(request, response);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_JSON') { badRequest(response, origin, 'Request body must be valid JSON.'); return; }
    if (error instanceof Error && error.message === 'BODY_TOO_LARGE') { json(response, 413, { error: 'Request body too large.' }, origin); return; }
    console.error('Unhandled request error:', error);
    json(response, 500, isProduction ? { error: 'Internal server error' } : { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, origin);
  }
}

export function createServer() { return http.createServer(requestHandler); }

export async function startServer(port = defaultPort, host = defaultHost) {
  await ensureDatabaseInitialized();
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      console.log(`Oilmart Pro backend running on http://${host}:${port}`);
      console.log('PostgreSQL storage initialized.');
      resolve(server);
    });
  });
}

function shutdownServer(server, signal) {
  console.log(`${signal} received. Shutting down Oilmart Pro backend.`);
  const shutdownTimer = setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10000);
  shutdownTimer.unref();
  server.close(async () => {
    try {
      await closeDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Error while closing database pool:', error);
      process.exit(1);
    }
  });
}

const launchedAsMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (launchedAsMain) {
  try {
    const server = await startServer();
    process.once('SIGINT', () => shutdownServer(server, 'SIGINT'));
    process.once('SIGTERM', () => shutdownServer(server, 'SIGTERM'));
  } catch (error) {
    console.error('Failed to start Oilmart Pro backend:', error);
    process.exit(1);
  }
}
