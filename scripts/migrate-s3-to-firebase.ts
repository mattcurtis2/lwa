import "dotenv/config";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  sites,
  siteContent,
  carouselItems,
  dogsHero,
  dogs,
  dogMedia,
  dogDocuments,
  goats,
  goatMedia,
  goatDocuments,
  sheep,
  sheepMedia,
  sheepDocuments,
  principles,
  marketSections,
  galleryPhotos,
  products,
  animals,
} from "../db/schema";
import {
  uploadBufferToFirebase,
  isFirebaseUrl,
  shouldMigrateUrl,
  isExternalUrl,
} from "../server/utils/firebase-storage";

export interface MigrationAuditEntry {
  table: string;
  column: string;
  id: number | string;
  oldUrl: string;
  newUrl: string;
  status: "migrated" | "skipped" | "failed" | "dry-run";
  error?: string;
}

export interface MigrationOptions {
  dryRun?: boolean;
  tableFilter?: string;
}

const auditLog: MigrationAuditEntry[] = [];

function guessMimeType(url: string, buffer: Buffer): string {
  const ext = path.extname(url.split("?")[0]).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
  };
  if (mimeTypes[ext]) {
    return mimeTypes[ext];
  }

  if (buffer.slice(0, 4).toString("hex") === "25504446") {
    return "application/pdf";
  }
  return "application/octet-stream";
}

function localPathToFilePath(url: string): string {
  if (url.startsWith("/uploads/")) {
    return path.join(process.cwd(), url.substring(1));
  }
  return "";
}

async function downloadSourceFile(url: string): Promise<Buffer | null> {
  const localPath = localPathToFilePath(url);
  if (localPath && fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  return null;
}

function deriveFileName(url: string, fallback: string): string {
  const cleanUrl = url.split("?")[0];
  const basename = path.basename(cleanUrl);
  if (basename && basename !== "/" && basename !== ".") {
    return basename;
  }
  return fallback;
}

async function migrateUrl(
  table: string,
  column: string,
  id: number | string,
  url: string,
  fallbackName: string,
  options: MigrationOptions
): Promise<string | null> {
  if (!url || isFirebaseUrl(url) || isExternalUrl(url) || !shouldMigrateUrl(url)) {
    auditLog.push({
      table,
      column,
      id,
      oldUrl: url,
      newUrl: url,
      status: "skipped",
    });
    return null;
  }

  try {
    const buffer = await downloadSourceFile(url);
    if (!buffer) {
      throw new Error(`Source file not found for URL: ${url}`);
    }

    const fileName = deriveFileName(url, fallbackName);
    const mimeType = guessMimeType(url, buffer);

    if (options.dryRun) {
      const placeholderUrl = `https://firebasestorage.googleapis.com/v0/b/dry-run/o/${encodeURIComponent(`uploads/${fileName}`)}?alt=media&token=dry-run`;
      auditLog.push({
        table,
        column,
        id,
        oldUrl: url,
        newUrl: placeholderUrl,
        status: "dry-run",
      });
      return placeholderUrl;
    }

    const newUrl = await uploadBufferToFirebase(buffer, fileName, mimeType);
    auditLog.push({
      table,
      column,
      id,
      oldUrl: url,
      newUrl,
      status: "migrated",
    });
    return newUrl;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    auditLog.push({
      table,
      column,
      id,
      oldUrl: url,
      newUrl: url,
      status: "failed",
      error: message,
    });
    console.error(`Failed to migrate ${table}.${column} id=${id}: ${message}`);
    return null;
  }
}

function shouldRunTable(tableName: string, options: MigrationOptions): boolean {
  if (!options.tableFilter) return true;
  return options.tableFilter.toLowerCase() === tableName.toLowerCase();
}

async function migrateSites(options: MigrationOptions) {
  if (!shouldRunTable("sites", options)) return;
  console.log("\n=== Migrating sites ===");
  const rows = await db.query.sites.findMany();
  for (const row of rows) {
    if (row.logoUrl) {
      const newUrl = await migrateUrl("sites", "logo_url", row.id, row.logoUrl, `site-${row.id}-logo`, options);
      if (newUrl && !options.dryRun) {
        await db.update(sites).set({ logoUrl: newUrl }).where(eq(sites.id, row.id));
      }
    }
    if (row.faviconUrl) {
      const newUrl = await migrateUrl("sites", "favicon_url", row.id, row.faviconUrl, `site-${row.id}-favicon`, options);
      if (newUrl && !options.dryRun) {
        await db.update(sites).set({ faviconUrl: newUrl }).where(eq(sites.id, row.id));
      }
    }
  }
}

async function migrateSiteContent(options: MigrationOptions) {
  if (!shouldRunTable("site_content", options)) return;
  console.log("\n=== Migrating site_content ===");
  const rows = await db.query.siteContent.findMany();
  for (const row of rows) {
    if (row.type !== "image") continue;
    const newUrl = await migrateUrl("site_content", "value", row.id, row.value, `${row.key}.jpg`, options);
    if (newUrl && !options.dryRun) {
      await db.update(siteContent).set({ value: newUrl }).where(eq(siteContent.id, row.id));
    }
  }
}

async function migrateSimpleImageTable(
  tableName: string,
  table: typeof carouselItems,
  columnName: "imageUrl",
  options: MigrationOptions
) {
  if (!shouldRunTable(tableName, options)) return;
  console.log(`\n=== Migrating ${tableName} ===`);
  const rows = await db.select().from(table);
  for (const row of rows) {
    const imageUrl = row.imageUrl;
    if (!imageUrl) continue;
    const newUrl = await migrateUrl(tableName, "image_url", row.id, imageUrl, `${tableName}-${row.id}.jpg`, options);
    if (newUrl && !options.dryRun) {
      await db.update(table).set({ imageUrl: newUrl }).where(eq(table.id, row.id));
    }
  }
}

async function migrateProfileTable(
  tableName: string,
  table: typeof dogs,
  options: MigrationOptions
) {
  if (!shouldRunTable(tableName, options)) return;
  console.log(`\n=== Migrating ${tableName} profile images ===`);
  const rows = await db.select().from(table);
  for (const row of rows) {
    if (!row.profileImageUrl) continue;
    const newUrl = await migrateUrl(
      tableName,
      "profile_image_url",
      row.id,
      row.profileImageUrl,
      `${tableName}-${row.id}-profile.jpg`,
      options
    );
    if (newUrl && !options.dryRun) {
      await db.update(table).set({ profileImageUrl: newUrl }).where(eq(table.id, row.id));
    }
  }
}

async function migrateMediaTable(
  tableName: string,
  table: typeof dogMedia,
  parentKey: string,
  options: MigrationOptions
) {
  if (!shouldRunTable(tableName, options)) return;
  console.log(`\n=== Migrating ${tableName} ===`);
  const rows = await db.select().from(table);
  for (const row of rows) {
    const parentId = (row as Record<string, unknown>)[parentKey] as number;
    const newUrl = await migrateUrl(
      tableName,
      "url",
      row.id,
      row.url,
      `${tableName}-${row.id}`,
      options
    );
    if (newUrl && !options.dryRun) {
      await db.update(table).set({ url: newUrl }).where(eq(table.id, row.id));
    } else if (!newUrl) {
      console.log(`Skipped ${tableName} id=${row.id} parent=${parentId}`);
    }
  }
}

export async function migrateAllToFirebase(options: MigrationOptions = {}) {
  auditLog.length = 0;
  console.log(`Starting S3/local to Firebase migration${options.dryRun ? " (DRY RUN)" : ""}...`);

  await migrateSites(options);
  await migrateSiteContent(options);
  await migrateSimpleImageTable("carousel_items", carouselItems, "imageUrl", options);
  await migrateSimpleImageTable("dogs_hero", dogsHero, "imageUrl", options);
  await migrateProfileTable("dogs", dogs, options);
  await migrateMediaTable("dog_media", dogMedia, "dogId", options);
  await migrateMediaTable("dog_documents", dogDocuments, "dogId", options);
  await migrateProfileTable("goats", goats, options);
  await migrateMediaTable("goat_media", goatMedia, "goatId", options);
  await migrateMediaTable("goat_documents", goatDocuments, "goatId", options);
  await migrateProfileTable("sheep", sheep, options);
  await migrateMediaTable("sheep_media", sheepMedia, "sheepId", options);
  await migrateMediaTable("sheep_documents", sheepDocuments, "sheepId", options);
  await migrateSimpleImageTable("principles", principles, "imageUrl", options);
  await migrateSimpleImageTable("market_sections", marketSections, "imageUrl", options);
  await migrateSimpleImageTable("gallery_photos", galleryPhotos, "imageUrl", options);
  await migrateSimpleImageTable("products", products, "imageUrl", options);
  await migrateSimpleImageTable("animals", animals, "imageUrl", options);

  const auditPath = path.join(process.cwd(), "migration-audit.json");
  fs.writeFileSync(auditPath, JSON.stringify(auditLog, null, 2));

  const summary = auditLog.reduce(
    (acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log("\n=== Migration Summary ===");
  console.log(summary);
  console.log(`Audit log written to ${auditPath}`);
}

function parseArgs(argv: string[]): MigrationOptions {
  const dryRun = argv.includes("--dry-run");
  const tableArg = argv.find((arg) => arg.startsWith("--table="));
  const tableFilter = tableArg ? tableArg.split("=")[1] : undefined;
  return { dryRun, tableFilter };
}

// Allow running directly: tsx scripts/migrate-s3-to-firebase.ts [--dry-run] [--table=dogs]
const isDirectRun = process.argv[1]?.includes("migrate-s3-to-firebase");
if (isDirectRun) {
  const options = parseArgs(process.argv.slice(2));
  migrateAllToFirebase(options)
    .then(() => {
      console.log("Migration complete.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
