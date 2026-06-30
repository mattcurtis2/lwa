/**
 * Must be imported before any module that depends on secrets (e.g. server/routes.ts).
 * Ensures dotenv runs and required Replit / deployment env vars are present with clear errors.
 */
import dotenv from "dotenv";

dotenv.config();

function validateDeploymentEnv(): void {
  // Database (required for app to function)
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Replit Secrets (or .env locally) before publishing."
    );
  }
  console.log("✅ Environment validation: DATABASE_URL is set.");

  // Stripe (required at module load by server/routes.ts)
  const stripeOk =
    Boolean(process.env.STRIPE_SECRET_KEY_LIVE) || Boolean(process.env.STRIPE_SECRET_KEY);
  if (!stripeOk) {
    throw new Error(
      "Missing Stripe secret: set STRIPE_SECRET_KEY_LIVE or STRIPE_SECRET_KEY in Replit Secrets."
    );
  }
  console.log("✅ Environment validation: Stripe secret is set.");

  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim() || "";
  const firebaseBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || "";
  const firebaseServiceAccount =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() ||
    "";
  const requiredFirebasePieces: { key: string; ok: boolean }[] = [
    { key: "FIREBASE_PROJECT_ID", ok: Boolean(firebaseProjectId) },
    { key: "FIREBASE_STORAGE_BUCKET", ok: Boolean(firebaseBucket) },
    {
      key: "FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH",
      ok: Boolean(firebaseServiceAccount),
    },
  ];
  const missingFirebaseVars = requiredFirebasePieces
    .filter((p) => !p.ok)
    .map((p) => p.key);
  if (missingFirebaseVars.length > 0) {
    console.warn(
      `⚠️ WARNING: Missing Firebase variables: ${missingFirebaseVars.join(", ")} — Firebase Storage uploads may not work.`
    );
  } else {
    console.log("✅ Environment validation: Firebase Storage variables present.");
  }
}

validateDeploymentEnv();
