import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const sqlFile = fs.readFileSync(path.join(__dirname, "backfill-null-site-ids.sql"), "utf8");
  const statements = sqlFile
    .split(";")
    .map((stmt) =>
      stmt
        .split("\n")
        .map((line) => line.replace(/--.*$/, "").trim())
        .filter(Boolean)
        .join(" "),
    )
    .map((stmt) => stmt.trim())
    .filter(Boolean);

  for (const statement of statements) {
    console.log(`Executing: ${statement}`);
    await sql.query(statement);
    console.log("Statement executed successfully");
  }

  const leftoverGoats = await sql`SELECT COUNT(*)::int AS n FROM goats WHERE site_id IS NULL`;
  const leftoverLitters = await sql`SELECT COUNT(*)::int AS n FROM goat_litters WHERE site_id IS NULL`;
  console.log("Remaining null site_id goats:", leftoverGoats[0]?.n);
  console.log("Remaining null site_id goat_litters:", leftoverLitters[0]?.n);
}

run().catch((error) => {
  console.error("Error running backfill:", error);
  process.exit(1);
});
