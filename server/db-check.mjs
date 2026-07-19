import { config } from "dotenv";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const connection = new URL(databaseUrl);
const sql = postgres(databaseUrl, { max: 1 });

try {
  const [result] =
    await sql`select current_database() as database, current_schema() as schema`;
  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `;
  const expectedTables = [
    "users",
    "periods",
    "districts",
    "placeTypes",
    "places",
    "walks",
    "comparisons",
    "detectiveActivities",
    "stories",
  ];
  const availableTables = new Set(tables.map(table => table.table_name));
  const missingTables = expectedTables.filter(table => !availableTables.has(table));

  if (missingTables.length > 0) {
    console.error(`[DB] Connected, but required tables are missing: ${missingTables.join(", ")}`);
    process.exitCode = 1;
  }

  const countQueries = expectedTables.slice(1).map(table =>
    sql`select ${table} as table_name, count(*)::int as count from ${sql(table)}`
  );
  const counts = missingTables.length === 0 ? await Promise.all(countQueries) : [];
  const heritageCounts = Object.fromEntries(
    counts.map(([row]) => [row.table_name, row.count])
  );

  console.log(
    JSON.stringify({
      connected: true,
      host: connection.hostname,
      port: Number(connection.port || 5432),
      database: result.database,
      schema: result.schema,
      schemaReady: missingTables.length === 0,
      availableTableCount: tables.length,
      heritageCounts,
    })
  );
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Unknown database error";
  console.error(`[DB] Connection failed: ${message}`);
  process.exitCode = 1;
} finally {
  await sql.end();
}
