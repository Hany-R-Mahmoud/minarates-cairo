# Supabase database setup

The application uses Supabase PostgreSQL through Drizzle and the existing Express/tRPC server.
The browser does not connect directly to the database.

The checked-in `drizzle-pg/` directory is the active PostgreSQL migration history. The older `drizzle/` migration history is retained for audit/reference and must not be used for the Supabase database.

## Environment

Create `.env.local` from `.env.example` and set:

- `VITE_SUPABASE_URL`: the project URL. It is browser-safe but is currently reserved for future Supabase client features.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the publishable/anon key. It is browser-safe but is currently reserved for future Supabase client features.
- `DATABASE_URL`: the server-only PostgreSQL Session Pooler URI from Supabase Connect. Do not commit or expose it.

Use the Session Pooler URI on port `5432` for Drizzle migrations. Do not use the transaction pooler URI on port `6543` for migrations.

## First-time database setup

Run these commands from the repository root:

```bash
pnpm db:check
pnpm db:migrate
pnpm db:seed
```

The main seed is insert-only and uses unique slugs to avoid duplicate heritage records. The optional expansion dataset can be applied afterward with:

```bash
pnpm db:seed:expansion
```

The expansion seed is also idempotent by slug and skips existing places without changing them. The coordinate utility fills only missing coordinates.

## Runtime boundaries

- Authentication remains Manus OAuth/JWT and the local `users` table.
- Database access remains server-side through Express/tRPC and Drizzle.
- Media storage and image generation remain on the existing Manus Forge/S3 integration.
- Supabase Auth, Storage, and direct browser database access are not required by the current application.

Because the server is the trusted database boundary, application authorization is enforced in the tRPC procedures. RLS is enabled on every table with no public policies, so accidental direct PostgREST access is deny-by-default. The server database role bypasses RLS as the trusted owner path. If browser Supabase access is introduced later, add least-privilege policies for the specific tables and user claims before exposing them.

## Operations

- Generate a migration after schema changes: `pnpm db:generate`
- Apply committed migrations: `pnpm db:migrate`
- Check connectivity without printing secrets: `pnpm db:check`
- Type-check, test, and build before deployment: `pnpm check`, `pnpm test`, `pnpm build`

Keep `DATABASE_URL` configured only in local/deployment secret stores. Only the two `VITE_SUPABASE_*` values may be exposed to browser code.
