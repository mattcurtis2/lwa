import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import type { Bucket } from "@google-cloud/storage";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

let storageBucket: Bucket | null = null;

export interface UploadableFile {
  originalname?: string;
  mimetype?: string;
  size?: number;
  buffer?: Buffer;
  path?: string;
}

function getFirebaseEnv() {
  return {
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() || "",
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() || "",
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim() || "",
  };
}

function getServiceAccount(): ServiceAccount {
  const { serviceAccountJson, serviceAccountPath } = getFirebaseEnv();

  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson) as ServiceAccount;
  }

  if (serviceAccountPath) {
    const contents = fs.readFileSync(serviceAccountPath, "utf8");
    return JSON.parse(contents) as ServiceAccount;
  }

  throw new Error(
    "Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH."
  );
}

export function isFirebaseConfigured(): boolean {
  const { projectId, storageBucket, serviceAccountJson, serviceAccountPath } =
    getFirebaseEnv();
  return Boolean(
    projectId &&
      storageBucket &&
      (serviceAccountJson || serviceAccountPath)
  );
}

export function getFirebaseBucket(): Bucket {
  if (storageBucket) {
    return storageBucket;
  }

  const { projectId, storageBucket: bucketName } = getFirebaseEnv();
  if (!projectId || !bucketName) {
    throw new Error(
      "Firebase Storage not configured. Set FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET."
    );
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert(getServiceAccount()),
      projectId,
      storageBucket: bucketName,
    });
  }

  storageBucket = getStorage().bucket(bucketName);
  return storageBucket;
}

function sanitizeFilename(originalName: string): string {
  const ext = path.extname(originalName || "file.bin").toLowerCase();
  const baseName = path
    .basename(originalName || "file", ext)
    .replace(/[^a-zA-Z0-9]/g, "-")
    .substring(0, 30);
  return `${uuidv4()}-${baseName || "file"}${ext || ".bin"}`;
}

function buildDownloadUrl(bucketName: string, objectPath: string, token: string): string {
  const encodedPath = encodeURIComponent(objectPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${token}`;
}

function readFileBuffer(file: UploadableFile): Buffer {
  if (file.buffer) {
    return file.buffer;
  }
  if (file.path) {
    return fs.readFileSync(file.path);
  }
  throw new Error("No file buffer or path provided for Firebase upload");
}

export async function uploadBufferToFirebase(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const bucket = getFirebaseBucket();
  const objectName = fileName.startsWith("uploads/")
    ? fileName
    : `uploads/${fileName}`;
  const token = uuidv4();
  const file = bucket.file(objectName);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType || "application/octet-stream",
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  const downloadUrl = buildDownloadUrl(bucket.name, objectName, token);
  console.log(`Firebase upload successful: ${downloadUrl}`);
  return downloadUrl;
}

export async function uploadToFirebase(file: UploadableFile): Promise<string> {
  const fileName = sanitizeFilename(file.originalname || "upload.bin");
  const buffer = readFileBuffer(file);
  return uploadBufferToFirebase(
    buffer,
    fileName,
    file.mimetype || "application/octet-stream"
  );
}

export async function uploadBase64ToFirebase(
  base64Data: string,
  fileName?: string
): Promise<string> {
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 data URL format");
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const extension = mimeType.split("/")[1] || "jpeg";
  const generatedFileName =
    fileName || `image-${Date.now()}.${extension}`;

  return uploadBufferToFirebase(buffer, generatedFileName, mimeType);
}

export function isFirebaseUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com")
  );
}

export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("s3.amazonaws.com") ||
    url.includes("s3.us-east-2.amazonaws.com") ||
    url.startsWith("https://lwacontent") ||
    url.startsWith("https://askanswercontent")
  );
}

export function isLocalUploadUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.startsWith("/uploads/"));
}

export function isLegacyStorageUrl(url: string | null | undefined): boolean {
  return isFirebaseUrl(url) || isS3Url(url) || isLocalUploadUrl(url);
}

export function shouldMigrateUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (isFirebaseUrl(url)) return false;
  if (isS3Url(url) || isLocalUploadUrl(url)) return true;
  return false;
}

export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (shouldMigrateUrl(url)) return false;
  if (url.startsWith("/images/") || url.startsWith("/logo")) return true;
  if (url.startsWith("https://images.unsplash.com")) return true;
  if (url.includes("placehold.co")) return true;
  if (url.startsWith("data:")) return true;
  if (!url.startsWith("http") && !url.startsWith("/uploads/")) return true;
  return false;
}
