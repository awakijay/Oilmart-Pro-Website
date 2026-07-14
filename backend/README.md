# Oilmart Pro Backend

This backend is a lightweight Node.js API for the current Oilmart Pro frontend.

## What it includes

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users`
- `PATCH /api/users/:id`
- CRUD routes for:
  - `/api/products`
  - `/api/blog-posts`
  - `/api/orders`
  - `/api/quote-requests`
  - `/api/chat/threads`
  - `/api/chat/messages`

## Storage

The API uses PostgreSQL.

Set either:

- `DATABASE_URL`

or:

- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE=require`

## Run it

```bash
npm run api
```

The server starts on `http://localhost:4000` by default and creates the required tables automatically.

Default admin login:

- Username: `admin`
- Password: `admin123`

For production, override these with:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_EMAIL`
- `SESSION_TTL_MS`
- `MAX_REQUEST_BODY_BYTES`

Recommended production note:

- Do not keep the default admin password in a public deployment.
- Set strong environment variables before hosting.
- Point the app at a managed PostgreSQL database before deployment.

You can change the port with:

```bash
PORT=5000 npm run api
```

## Frontend serving

If you build the frontend first with `npm run build`, the same backend can also serve the Vite output from `dist/`.

## Vercel + Supabase

Recommended production pairing for this repo:

- Vercel for the frontend and serverless API routes
- Supabase for PostgreSQL

Why this pairing fits well:

- the frontend is already a Vite static build
- the backend is API-driven and works with standard Postgres
- Supabase gives you a managed Postgres database without changing your current backend approach

### Vercel setup

This repo now includes:

- [vercel.json](C:/Users/HP/Desktop/Oilmart%20Pro%20Website/vercel.json)
- [api/[...route].mjs](C:/Users/HP/Desktop/Oilmart%20Pro%20Website/api/[...route].mjs)

That means:

- Vite builds the frontend to `dist`
- Vercel serves frontend routes as SPA routes
- `/api/*` requests go to the backend handler

### Supabase setup

1. Create a Supabase project
2. Open the database connection settings in Supabase
3. Copy the Postgres connection string
4. For Vercel serverless traffic, use the pooled or serverless-friendly connection option
5. Add it to Vercel as `DATABASE_URL`

### Deploy flow

1. Push this repo to GitHub
2. Import the repo into Vercel
3. Add the environment variables in Vercel Project Settings
4. Redeploy

On first deployment, the backend initializes the database tables automatically.

Useful official docs:

- Supabase Postgres connection strings: https://supabase.com/docs/reference/postgres/connection-strings
- Supabase database connection guide: https://supabase.com/docs/guides/database/connecting-to-postgres

## Suggested Production Environment

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
ADMIN_USERNAME=your-admin-login
ADMIN_PASSWORD=use-a-strong-password
ADMIN_EMAIL=admin@yourdomain.com
SESSION_TTL_MS=604800000
MAX_REQUEST_BODY_BYTES=1048576
PGSSLMODE=require
```
