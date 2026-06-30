
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function maskValue(value) {
  if (!value) return "Not set";
  if (value.length <= 8) return `Set (len=${value.length})`;
  return `Set (${value.slice(0, 4)}...${value.slice(-4)}, len=${value.length})`;
}

function rawState(name) {
  if (!(name in process.env)) return "missing";
  const v = process.env[name];
  if (v === "") return "empty";
  return "set";
}

console.log("=== RAW FIREBASE ENV KEY STATES ===");
const inspectKeys = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_SERVICE_ACCOUNT_PATH",
];
for (const key of inspectKeys) {
  console.log(`${key}: ${rawState(key)}`);
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || "";
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || "";

console.log("=== BUILD ENV CHECK (masked) ===");
console.log("FIREBASE_PROJECT_ID:", maskValue(projectId));
console.log("FIREBASE_STORAGE_BUCKET:", maskValue(storageBucket));
console.log(
  "FIREBASE_SERVICE_ACCOUNT_JSON:",
  maskValue(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
);
console.log(
  "FIREBASE_SERVICE_ACCOUNT_PATH:",
  maskValue(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
);

const missing = [];
if (!projectId) missing.push("FIREBASE_PROJECT_ID");
if (!storageBucket) missing.push("FIREBASE_STORAGE_BUCKET");
if (
  !process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() &&
  !process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
) {
  missing.push("FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH");
}

if (missing.length > 0) {
  console.error(`Missing Firebase environment variables: ${missing.join(", ")}`);
  console.error("Add them to deployment secrets before publishing.");
  process.exit(1);
}

async function verifyFirebaseCredentials() {
  try {
    let serviceAccount;
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

    if (json) {
      serviceAccount = JSON.parse(json);
    } else {
      serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount),
        projectId,
        storageBucket,
      });
    }

    const bucket = getStorage().bucket(storageBucket);
    const [exists] = await bucket.exists();

    if (!exists) {
      console.error(`Firebase Storage bucket "${storageBucket}" was not found`);
      process.exit(1);
    }

    console.log("✅ Firebase credentials verified");
    console.log(`✅ Storage bucket "${storageBucket}" is accessible`);
    process.exit(0);
  } catch (error) {
    console.error(`Firebase credential check failed: ${error.message}`);
    process.exit(1);
  }
}

verifyFirebaseCredentials();
