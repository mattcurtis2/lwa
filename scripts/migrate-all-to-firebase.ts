import "dotenv/config";
import { migrateAllToFirebase } from "./migrate-s3-to-firebase";

const dryRun = process.argv.includes("--dry-run");
const tableArg = process.argv.find((arg) => arg.startsWith("--table="));
const tableFilter = tableArg ? tableArg.split("=")[1] : undefined;

migrateAllToFirebase({ dryRun, tableFilter })
  .then(() => {
    console.log("All Firebase migrations complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Firebase migration orchestrator failed:", error);
    process.exit(1);
  });
