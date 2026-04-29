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

  // Optional but called out for publish debugging (bucket name may be S3_BUCKET_NAME in some configs)
  const bucketName =
    process.env.AWS_BUCKET_NAME?.trim() || process.env.S3_BUCKET_NAME?.trim() || "";
  const requiredAwsPieces: { key: string; ok: boolean }[] = [
    { key: "AWS_REGION", ok: Boolean(process.env.AWS_REGION) },
    { key: "AWS_ACCESS_KEY_ID", ok: Boolean(process.env.AWS_ACCESS_KEY_ID) },
    { key: "AWS_SECRET_ACCESS_KEY", ok: Boolean(process.env.AWS_SECRET_ACCESS_KEY) },
    {
      key: "AWS_BUCKET_NAME or S3_BUCKET_NAME",
      ok: bucketName.length > 0,
    },
  ];
  const missingAwsVars = requiredAwsPieces.filter((p) => !p.ok).map((p) => p.key);
  if (missingAwsVars.length > 0) {
    console.warn(
      `⚠️ WARNING: Missing AWS variables: ${missingAwsVars.join(", ")} — S3 uploads may not work.`
    );
  } else {
    console.log("✅ Environment validation: S3-related variables present.");
  }
}

validateDeploymentEnv();
