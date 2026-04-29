var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/helpers.ts
var helpers_exports = {};
__export(helpers_exports, {
  getCurrentSiteId: () => getCurrentSiteId,
  retry: () => retry,
  sleep: () => sleep
});
function getCurrentSiteId(req) {
  const siteIdHeader = req.header("X-Site-ID");
  return siteIdHeader ? parseInt(siteIdHeader, 10) : 1;
}
async function retry(fn, maxRetries = 3, initialDelay = 1e3) {
  let lastError = new Error("Operation failed after maximum retries");
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      lastError = error;
      await sleep(delay);
      delay = delay * 2;
    }
  }
  throw lastError;
}
var sleep;
var init_helpers = __esm({
  "server/helpers.ts"() {
    "use strict";
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  }
});

// server/utils/s3.js
var s3_exports = {};
__export(s3_exports, {
  getFromS3: () => getFromS3,
  uploadBase64ToS3: () => uploadBase64ToS3,
  uploadToS3: () => uploadToS32
});
import { S3Client as S3Client2, PutObjectCommand as PutObjectCommand2, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import fs3 from "fs";
import path2 from "path";
function getS3Client() {
  if (s3Client) return s3Client;
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  console.log("S3 Client Initialization:");
  console.log(`- AWS_REGION: ${region ? "Set" : "Not set"}`);
  console.log(`- AWS_ACCESS_KEY_ID: ${accessKeyId ? `Set (starts with: ${accessKeyId.substring(0, 4)}...)` : "Not set"}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${secretAccessKey ? "Set (length: " + secretAccessKey.length + ")" : "Not set"}`);
  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not properly configured. Check AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY.");
  }
  s3Client = new S3Client2({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
  return s3Client;
}
function getBucketName() {
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3 bucket name not configured. Check AWS_BUCKET_NAME environment variable.");
  }
  return bucketName;
}
async function uploadToS32(file) {
  console.log("==== S3 UPLOAD ATTEMPT ====");
  try {
    const s3 = getS3Client();
    const BUCKET_NAME = getBucketName();
    global.s3CredentialsDebug = {
      region: process.env.AWS_REGION,
      keyIdPrefix: process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 4) : "empty",
      secretKeyPrefix: process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4) : "empty",
      bucketName: BUCKET_NAME
    };
    const fileExtension = path2.extname(file.originalname || "unknown.jpg").toLowerCase();
    const sanitizedName = (file.originalname || "").replace(/[^a-zA-Z0-9]/g, "-").substring(0, 30);
    const filename = `${uuidv4()}-${sanitizedName}${fileExtension}`;
    console.log(`S3 Upload - Processing file: ${file.originalname || "unnamed"}, size: ${file.size || "unknown"} bytes`);
    const contentType = file.mimetype || "application/octet-stream";
    let fileBuffer;
    if (file.buffer) {
      fileBuffer = file.buffer;
    } else if (file.path) {
      fileBuffer = fs3.readFileSync(file.path);
    } else {
      throw new Error("No file buffer or path provided for S3 upload");
    }
    console.log(`File buffer size: ${fileBuffer.length} bytes`);
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: "inline",
      ContentLength: fileBuffer.length
    };
    console.log("S3 Upload - Params prepared:", uploadParams);
    console.log("S3 Upload - Sending file to S3...");
    const uploadResult = await s3.send(new PutObjectCommand2(uploadParams));
    console.log("S3 Upload - Success! Response:", uploadResult);
    const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    console.log(`S3 upload successful: ${s3Url}`);
    console.log(`Alternative URL (path-style): https://s3.${process.env.AWS_REGION}.amazonaws.com/${BUCKET_NAME}/${filename}`);
    return s3Url;
  } catch (error) {
    console.error("S3 Upload - Error during upload:", error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
      error.awsCredentials = {
        region: process.env.AWS_REGION,
        accessKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID.substring(0, 4),
        secretKeyPrefix: process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4),
        fullAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
        // Include full key in server logs only
        bucketName: getBucketName()
      };
      console.error("AWS Credentials used in failed request:", {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretKeyPrefix: process.env.AWS_SECRET_ACCESS_KEY.substring(0, 4) + "...",
        bucketName: getBucketName()
      });
    }
    throw error;
  }
}
async function getFromS3(key) {
  try {
    const s3 = getS3Client();
    const BUCKET_NAME = getBucketName();
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    const response = await s3.send(command);
    return response;
  } catch (error) {
    console.error("Error getting file from S3:", error);
    throw error;
  }
}
async function uploadBase64ToS3(base64Data, fileName) {
  try {
    console.log("Starting base64 to S3 upload process...");
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error("Invalid base64 data URL format");
      throw new Error("Invalid base64 data URL format");
    }
    const type = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    console.log(`Processing base64 image: ${type}, size: ${buffer.length} bytes`);
    const extension = type.split("/")[1] || "jpeg";
    const generatedFileName = fileName || `image-${Date.now()}.${extension}`;
    const mockFile = {
      buffer,
      originalname: generatedFileName,
      mimetype: type,
      size: buffer.length
    };
    console.log(`Created mock file for S3 upload: ${generatedFileName} (${type})`);
    const uploadResult = await uploadToS32(mockFile);
    console.log(`Base64 image successfully uploaded to S3: ${uploadResult}`);
    return uploadResult;
  } catch (error) {
    console.error("Error uploading base64 to S3:", error);
    throw error;
  }
}
var s3Client;
var init_s3 = __esm({
  "server/utils/s3.js"() {
    "use strict";
    s3Client = null;
  }
});

// server/index.ts
import express6 from "express";

// server/routes.ts
import { createServer } from "http";

// db/resilient-db.ts
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig } from "@neondatabase/serverless";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  animalRelations: () => animalRelations,
  animals: () => animals,
  carouselItems: () => carouselItems,
  contactInfo: () => contactInfo,
  dogDocuments: () => dogDocuments,
  dogDocumentsRelations: () => dogDocumentsRelations,
  dogMedia: () => dogMedia,
  dogMediaRelations: () => dogMediaRelations,
  dogRelations: () => dogRelations,
  dogs: () => dogs,
  dogsHero: () => dogsHero,
  fileStorage: () => fileStorage,
  galleryPhotos: () => galleryPhotos,
  galleryPhotosRelations: () => galleryPhotosRelations,
  goatDocuments: () => goatDocuments,
  goatDocumentsRelations: () => goatDocumentsRelations,
  goatLitterRelations: () => goatLitterRelations,
  goatLitters: () => goatLitters,
  goatMedia: () => goatMedia,
  goatMediaRelations: () => goatMediaRelations,
  goatRelations: () => goatRelations,
  goats: () => goats,
  insertAnimalSchema: () => insertAnimalSchema,
  insertCarouselItemSchema: () => insertCarouselItemSchema,
  insertContactInfoSchema: () => insertContactInfoSchema,
  insertDogDocumentSchema: () => insertDogDocumentSchema,
  insertDogMediaSchema: () => insertDogMediaSchema,
  insertDogSchema: () => insertDogSchema,
  insertDogsHeroSchema: () => insertDogsHeroSchema,
  insertGalleryPhotoSchema: () => insertGalleryPhotoSchema,
  insertGoatDocumentSchema: () => insertGoatDocumentSchema,
  insertGoatLitterSchema: () => insertGoatLitterSchema,
  insertGoatMediaSchema: () => insertGoatMediaSchema,
  insertGoatSchema: () => insertGoatSchema,
  insertLitterSchema: () => insertLitterSchema,
  insertMarketScheduleSchema: () => insertMarketScheduleSchema,
  insertMarketSectionSchema: () => insertMarketSectionSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPrincipleSchema: () => insertPrincipleSchema,
  insertPrintifyProductSchema: () => insertPrintifyProductSchema,
  insertProductSchema: () => insertProductSchema,
  insertSheepDocumentSchema: () => insertSheepDocumentSchema,
  insertSheepLitterSchema: () => insertSheepLitterSchema,
  insertSheepMediaSchema: () => insertSheepMediaSchema,
  insertSheepSchema: () => insertSheepSchema,
  insertSiteContentSchema: () => insertSiteContentSchema,
  insertSiteSchema: () => insertSiteSchema,
  insertUserSchema: () => insertUserSchema,
  litterRelations: () => litterRelations,
  litter_interest_signups: () => litter_interest_signups,
  litters: () => litters,
  marketSchedules: () => marketSchedules,
  marketSchedulesRelations: () => marketSchedulesRelations,
  marketSections: () => marketSections,
  marketSectionsRelations: () => marketSectionsRelations,
  orderItemRelations: () => orderItemRelations,
  orderItems: () => orderItems,
  orderRelations: () => orderRelations,
  orders: () => orders,
  principleRelations: () => principleRelations,
  principles: () => principles,
  printifyProducts: () => printifyProducts,
  printifyProductsRelations: () => printifyProductsRelations,
  productRelations: () => productRelations,
  products: () => products,
  selectAnimalSchema: () => selectAnimalSchema,
  selectCarouselItemSchema: () => selectCarouselItemSchema,
  selectContactInfoSchema: () => selectContactInfoSchema,
  selectDogDocumentSchema: () => selectDogDocumentSchema,
  selectDogMediaSchema: () => selectDogMediaSchema,
  selectDogSchema: () => selectDogSchema,
  selectDogsHeroSchema: () => selectDogsHeroSchema,
  selectGalleryPhotoSchema: () => selectGalleryPhotoSchema,
  selectGoatDocumentSchema: () => selectGoatDocumentSchema,
  selectGoatLitterSchema: () => selectGoatLitterSchema,
  selectGoatMediaSchema: () => selectGoatMediaSchema,
  selectGoatSchema: () => selectGoatSchema,
  selectLitterSchema: () => selectLitterSchema,
  selectMarketScheduleSchema: () => selectMarketScheduleSchema,
  selectMarketSectionSchema: () => selectMarketSectionSchema,
  selectOrderItemSchema: () => selectOrderItemSchema,
  selectOrderSchema: () => selectOrderSchema,
  selectPrincipleSchema: () => selectPrincipleSchema,
  selectPrintifyProductSchema: () => selectPrintifyProductSchema,
  selectProductSchema: () => selectProductSchema,
  selectSheepDocumentSchema: () => selectSheepDocumentSchema,
  selectSheepLitterSchema: () => selectSheepLitterSchema,
  selectSheepMediaSchema: () => selectSheepMediaSchema,
  selectSheepSchema: () => selectSheepSchema,
  selectSiteContentSchema: () => selectSiteContentSchema,
  selectSiteSchema: () => selectSiteSchema,
  selectUserSchema: () => selectUserSchema,
  sheep: () => sheep,
  sheepDocuments: () => sheepDocuments,
  sheepDocumentsRelations: () => sheepDocumentsRelations,
  sheepLitterRelations: () => sheepLitterRelations,
  sheepLitters: () => sheepLitters,
  sheepMedia: () => sheepMedia,
  sheepMediaRelations: () => sheepMediaRelations,
  sheepRelations: () => sheepRelations,
  siteContent: () => siteContent,
  sites: () => sites,
  users: () => users
});
import { pgTable, text, serial, integer, timestamp, date, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  domain: text("domain"),
  name: text("name"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  username: text("username").unique().notNull(),
  password: text("password").notNull()
});
var siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  key: text("key").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(),
  // "image" or "text"
  updatedAt: timestamp("updated_at").defaultNow()
});
var carouselItems = pgTable("carousel_items", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // "dog" or "goat"
  breed: text("breed"),
  age: integer("age"),
  description: text("description"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  section: text("section").notNull(),
  // "bakery", "market_garden", "animal_products"
  category: text("category").notNull(),
  description: text("description"),
  price: text("price"),
  unit: text("unit"),
  // e.g., "loaf", "dozen", "lb"
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  availableForPurchase: boolean("available_for_purchase").default(false),
  seasonal: boolean("seasonal").default(false),
  availableFrom: date("available_from"),
  availableTo: date("available_to"),
  ingredients: text("ingredients"),
  nutritionInfo: text("nutrition_info"),
  allergens: text("allergens"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dogsHero = pgTable("dogs_hero", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dogMedia = pgTable("dog_media", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dogId: integer("dog_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var dogs = pgTable("dogs", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  registrationName: text("registration_name"),
  breed: text("breed").notNull(),
  gender: text("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  description: text("description"),
  motherId: integer("mother_id").references(() => dogs.id),
  fatherId: integer("father_id").references(() => dogs.id),
  litterId: integer("litter_id").references(() => litters.id),
  puppy: boolean("puppy").default(false).notNull(),
  available: boolean("available").default(false).notNull(),
  sold: boolean("sold").default(false).notNull(),
  died: boolean("died").default(false).notNull(),
  display: boolean("display").default(true).notNull(),
  price: text("price"),
  profileImageUrl: text("profile_image_url"),
  healthData: text("health_data"),
  color: text("color"),
  dewclaws: text("dewclaws"),
  furLength: text("fur_length"),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  pedigree: text("pedigree"),
  narrativeDescription: text("narrative_description"),
  order: integer("order").notNull().default(0),
  outsideBreeder: boolean("outside_breeder").default(false),
  placementCity: text("placement_city"),
  placementState: text("placement_state"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var dogDocuments = pgTable("dog_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dogId: integer("dog_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // 'health' or 'pedigree'
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var animalRelations = relations(animals, ({ one }) => ({
  user: one(users, {
    fields: [animals.id],
    references: [users.id]
  })
}));
var productRelations = relations(products, ({ one }) => ({
  section: one(marketSections, {
    fields: [products.section],
    references: [marketSections.name]
  })
}));
var dogRelations = relations(dogs, ({ many, one }) => ({
  media: many(dogMedia),
  documents: many(dogDocuments),
  mother: one(dogs, {
    fields: [dogs.motherId],
    references: [dogs.id]
  }),
  father: one(dogs, {
    fields: [dogs.fatherId],
    references: [dogs.id]
  }),
  litter: one(litters, {
    fields: [dogs.litterId],
    references: [litters.id]
  }),
  motherOf: many(dogs, { relationName: "mother" }),
  fatherOf: many(dogs, { relationName: "father" })
}));
var dogMediaRelations = relations(dogMedia, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogMedia.dogId],
    references: [dogs.id]
  })
}));
var litters = pgTable("litters", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  isCurrentLitter: boolean("is_current_litter").default(false),
  isPastLitter: boolean("is_past_litter").default(false),
  isPlannedLitter: boolean("is_planned_litter").default(false),
  expectedBreedingDate: date("expected_breeding_date"),
  expectedPickupDate: date("expected_pickup_date"),
  waitlistLink: text("waitlist_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var litterRelations = relations(litters, ({ one }) => ({
  mother: one(dogs, {
    fields: [litters.motherId],
    references: [dogs.id]
  }),
  father: one(dogs, {
    fields: [litters.fatherId],
    references: [dogs.id]
  })
}));
var insertSiteSchema = createInsertSchema(sites);
var selectSiteSchema = createSelectSchema(sites);
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var insertCarouselItemSchema = createInsertSchema(carouselItems);
var selectCarouselItemSchema = createSelectSchema(carouselItems);
var insertAnimalSchema = createInsertSchema(animals);
var selectAnimalSchema = createSelectSchema(animals);
var insertProductSchema = createInsertSchema(products);
var selectProductSchema = createSelectSchema(products);
var insertSiteContentSchema = createInsertSchema(siteContent);
var selectSiteContentSchema = createSelectSchema(siteContent);
var insertDogsHeroSchema = createInsertSchema(dogsHero);
var selectDogsHeroSchema = createSelectSchema(dogsHero);
var insertDogSchema = createInsertSchema(dogs);
var selectDogSchema = createSelectSchema(dogs);
var insertDogMediaSchema = createInsertSchema(dogMedia);
var selectDogMediaSchema = createSelectSchema(dogMedia);
var dogDocumentsRelations = relations(dogDocuments, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogDocuments.dogId],
    references: [dogs.id]
  })
}));
var insertDogDocumentSchema = createInsertSchema(dogDocuments);
var selectDogDocumentSchema = createSelectSchema(dogDocuments);
var insertLitterSchema = createInsertSchema(litters);
var selectLitterSchema = createSelectSchema(litters);
var principles = pgTable("principles", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var principleRelations = relations(principles, ({}) => ({
  // No relations for now, but defining empty relations object to satisfy type requirements
}));
var insertPrincipleSchema = createInsertSchema(principles);
var selectPrincipleSchema = createSelectSchema(principles);
var contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  email: text("email"),
  phone: text("phone"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertContactInfoSchema = createInsertSchema(contactInfo);
var selectContactInfoSchema = createSelectSchema(contactInfo);
var goats = pgTable("goats", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  registrationName: text("registration_name"),
  breed: text("breed").notNull(),
  gender: text("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  description: text("description"),
  motherId: integer("mother_id").references(() => goats.id),
  fatherId: integer("father_id").references(() => goats.id),
  damName: text("dam_name"),
  sireName: text("sire_name"),
  litterId: integer("litter_id").references(() => goatLitters.id),
  kid: boolean("kid").default(false).notNull(),
  available: boolean("available").default(false).notNull(),
  sold: boolean("sold").default(false).notNull(),
  died: boolean("died").default(false).notNull(),
  display: boolean("display").default(true).notNull(),
  price: text("price"),
  bucklingPrice: text("buckling_price"),
  wetherPrice: text("wether_price"),
  profileImageUrl: text("profile_image_url"),
  healthData: text("health_data"),
  color: text("color"),
  milkStars: text("milk_stars"),
  laArScores: text("la_ar_scores"),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  pedigree: text("pedigree"),
  narrativeDescription: text("narrative_description"),
  order: integer("order").notNull().default(0),
  outsideBreeder: boolean("outside_breeder").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var goatMedia = pgTable("goat_media", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  goatId: integer("goat_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var goatDocuments = pgTable("goat_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  goatId: integer("goat_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // 'health' or 'pedigree'
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var goatLitters = pgTable("goat_litters", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  isCurrentLitter: boolean("is_current_litter").default(false),
  isPastLitter: boolean("is_past_litter").default(false),
  isPlannedLitter: boolean("is_planned_litter").default(false),
  expectedBreedingDate: date("expected_breeding_date"),
  expectedPickupDate: date("expected_pickup_date"),
  waitlistLink: text("waitlist_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var goatRelations = relations(goats, ({ many, one }) => ({
  media: many(goatMedia),
  documents: many(goatDocuments),
  mother: one(goats, {
    fields: [goats.motherId],
    references: [goats.id]
  }),
  father: one(goats, {
    fields: [goats.fatherId],
    references: [goats.id]
  }),
  litter: one(goatLitters, {
    fields: [goats.litterId],
    references: [goatLitters.id]
  }),
  motherOf: many(goats, { relationName: "mother" }),
  fatherOf: many(goats, { relationName: "father" })
}));
var goatMediaRelations = relations(goatMedia, ({ one }) => ({
  goat: one(goats, {
    fields: [goatMedia.goatId],
    references: [goats.id]
  })
}));
var goatLitterRelations = relations(goatLitters, ({ one, many }) => ({
  mother: one(goats, {
    fields: [goatLitters.motherId],
    references: [goats.id]
  }),
  father: one(goats, {
    fields: [goatLitters.fatherId],
    references: [goats.id]
  }),
  kids: many(goats)
}));
var goatDocumentsRelations = relations(goatDocuments, ({ one }) => ({
  goat: one(goats, {
    fields: [goatDocuments.goatId],
    references: [goats.id]
  })
}));
var insertGoatSchema = createInsertSchema(goats);
var selectGoatSchema = createSelectSchema(goats);
var insertGoatMediaSchema = createInsertSchema(goatMedia);
var selectGoatMediaSchema = createSelectSchema(goatMedia);
var insertGoatDocumentSchema = createInsertSchema(goatDocuments);
var selectGoatDocumentSchema = createSelectSchema(goatDocuments);
var insertGoatLitterSchema = createInsertSchema(goatLitters);
var selectGoatLitterSchema = createSelectSchema(goatLitters);
var marketSections = pgTable("market_sections", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  // "about", "bakery", "market_garden", "animal_products"
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var marketSectionsRelations = relations(marketSections, ({ many }) => ({
  products: many(products)
}));
var insertMarketSectionSchema = createInsertSchema(marketSections);
var selectMarketSectionSchema = createSelectSchema(marketSections);
var marketSchedules = pgTable("market_schedules", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  location: text("location").notNull(),
  address: text("address").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sheep = pgTable("sheep", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  registrationName: text("registration_name"),
  breed: text("breed").notNull(),
  gender: text("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  description: text("description"),
  motherId: integer("mother_id").references(() => sheep.id),
  fatherId: integer("father_id").references(() => sheep.id),
  damName: text("dam_name"),
  sireName: text("sire_name"),
  litterId: integer("litter_id").references(() => sheepLitters.id),
  lamb: boolean("lamb").default(false).notNull(),
  available: boolean("available").default(false).notNull(),
  sold: boolean("sold").default(false).notNull(),
  died: boolean("died").default(false).notNull(),
  display: boolean("display").default(true).notNull(),
  price: text("price"),
  ramPrice: text("ram_price"),
  wetherPrice: text("wether_price"),
  profileImageUrl: text("profile_image_url"),
  healthData: text("health_data"),
  color: text("color"),
  fleeceType: text("fleece_type"),
  fleeceWeight: decimal("fleece_weight", { precision: 5, scale: 2 }),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 5, scale: 2 }),
  pedigree: text("pedigree"),
  narrativeDescription: text("narrative_description"),
  order: integer("order").notNull().default(0),
  outsideBreeder: boolean("outside_breeder").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sheepMedia = pgTable("sheep_media", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  sheepId: integer("sheep_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var sheepDocuments = pgTable("sheep_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  sheepId: integer("sheep_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  // 'health' or 'pedigree'
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var sheepLitters = pgTable("sheep_litters", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  isCurrentLitter: boolean("is_current_litter").default(false),
  isPastLitter: boolean("is_past_litter").default(false),
  isPlannedLitter: boolean("is_planned_litter").default(false),
  expectedBreedingDate: date("expected_breeding_date"),
  expectedPickupDate: date("expected_pickup_date"),
  waitlistLink: text("waitlist_link"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("farm"),
  // 'farm', 'events', 'general'
  order: integer("order").notNull().default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var marketSchedulesRelations = relations(marketSchedules, ({}) => ({}));
var galleryPhotosRelations = relations(galleryPhotos, ({}) => ({}));
var insertGalleryPhotoSchema = createInsertSchema(galleryPhotos);
var selectGalleryPhotoSchema = createSelectSchema(galleryPhotos);
var insertMarketScheduleSchema = createInsertSchema(marketSchedules);
var selectMarketScheduleSchema = createSelectSchema(marketSchedules);
var sheepRelations = relations(sheep, ({ many, one }) => ({
  media: many(sheepMedia),
  documents: many(sheepDocuments),
  mother: one(sheep, {
    fields: [sheep.motherId],
    references: [sheep.id]
  }),
  father: one(sheep, {
    fields: [sheep.fatherId],
    references: [sheep.id]
  }),
  litter: one(sheepLitters, {
    fields: [sheep.litterId],
    references: [sheepLitters.id]
  }),
  motherOf: many(sheep, { relationName: "mother" }),
  fatherOf: many(sheep, { relationName: "father" })
}));
var sheepMediaRelations = relations(sheepMedia, ({ one }) => ({
  sheep: one(sheep, {
    fields: [sheepMedia.sheepId],
    references: [sheep.id]
  })
}));
var sheepLitterRelations = relations(sheepLitters, ({ one, many }) => ({
  mother: one(sheep, {
    fields: [sheepLitters.motherId],
    references: [sheep.id]
  }),
  father: one(sheep, {
    fields: [sheepLitters.fatherId],
    references: [sheep.id]
  }),
  lambs: many(sheep)
}));
var sheepDocumentsRelations = relations(sheepDocuments, ({ one }) => ({
  sheep: one(sheep, {
    fields: [sheepDocuments.sheepId],
    references: [sheep.id]
  })
}));
var insertSheepSchema = createInsertSchema(sheep);
var selectSheepSchema = createSelectSchema(sheep);
var insertSheepMediaSchema = createInsertSchema(sheepMedia);
var selectSheepMediaSchema = createSelectSchema(sheepMedia);
var insertSheepDocumentSchema = createInsertSchema(sheepDocuments);
var selectSheepDocumentSchema = createSelectSchema(sheepDocuments);
var insertSheepLitterSchema = createInsertSchema(sheepLitters);
var selectSheepLitterSchema = createSelectSchema(sheepLitters);
var litter_interest_signups = pgTable("litter_interest_signups", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  litterId: integer("litter_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow()
});
var printifyProducts = pgTable("printify_products", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  printifyId: text("printify_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  tags: jsonb("tags"),
  images: jsonb("images"),
  variants: jsonb("variants"),
  blueprintId: integer("blueprint_id"),
  externalId: text("external_id"),
  printifyUrl: text("printify_url"),
  visible: boolean("visible").default(true),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at").defaultNow()
});
var printifyProductsRelations = relations(printifyProducts, ({ one }) => ({
  site: one(sites, {
    fields: [printifyProducts.siteId],
    references: [sites.id]
  })
}));
var insertPrintifyProductSchema = createInsertSchema(printifyProducts);
var selectPrintifyProductSchema = createSelectSchema(printifyProducts);
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  pickupLocationId: integer("pickup_location_id").references(() => marketSchedules.id),
  pickupDate: date("pickup_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  // "pending", "confirmed", "ready", "completed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  // Store name at time of order
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var orderRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  pickupLocation: one(marketSchedules, {
    fields: [orders.pickupLocationId],
    references: [marketSchedules.id]
  })
}));
var orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id]
  })
}));
var insertOrderSchema = createInsertSchema(orders);
var selectOrderSchema = createSelectSchema(orders);
var insertOrderItemSchema = createInsertSchema(orderItems);
var selectOrderItemSchema = createSelectSchema(orderItems);

// db/resilient-db.ts
import ws from "ws";
neonConfig.webSocketConstructor = ws;
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = true;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
var db = drizzle(process.env.DATABASE_URL, { schema: schema_exports });

// server/routes.ts
init_helpers();
import { eq as eq2, and as and2 } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";
import multer2 from "multer";
import path3 from "path";
import fs4 from "fs-extra";
import express from "express";

// server/routes/sheep.ts
import { Router } from "express";

// db/connection.ts
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
import { neonConfig as neonConfig2 } from "@neondatabase/serverless";
import ws2 from "ws";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
neonConfig2.webSocketConstructor = ws2;
neonConfig2.fetchConnectionCache = true;
neonConfig2.wsConnectionTimeout = 3e4;
neonConfig2.pipelineConnect = false;
neonConfig2.useSecureWebSocket = true;
function createDbConnection() {
  return process.env.DATABASE_URL;
}
var db2 = drizzle2(createDbConnection(), { schema: schema_exports });

// server/routes/sheep.ts
import { eq, desc, asc, and } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs2 from "fs-extra";
import { nanoid } from "nanoid";

// server/utils/s3.ts
import fs from "fs-extra";
import { S3Client, PutObjectCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
async function uploadToS3(file) {
  console.log("==== S3 UPLOAD ATTEMPT ====");
  console.log("AWS Credentials Check:");
  console.log(`- AWS_REGION: ${process.env.AWS_REGION ? "Set" : "Not set"}`);
  console.log(`- AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 6)}...)` : "Not set"}`);
  console.log(`- AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? `Set (length: ${process.env.AWS_SECRET_ACCESS_KEY.length})` : "Not set"}`);
  console.log(`- AWS_BUCKET_NAME: ${process.env.AWS_BUCKET_NAME ? "Set" : "Not set"}`);
  console.log(`- S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME ? "Set" : "Not set"}`);
  if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_BUCKET_NAME && !process.env.S3_BUCKET_NAME) {
    console.error("S3 Upload - Missing AWS credentials");
    return null;
  }
  if (!file) {
    console.error("S3 Upload - No file provided");
    return null;
  }
  if (!file.originalname) {
    console.error("S3 Upload - File missing originalname");
    return null;
  }
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME;
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
  try {
    console.log("Checking S3 bucket CORS configuration...");
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: ["ETag"]
            }
          ]
        }
      })
    );
    console.log("CORS configuration set successfully");
  } catch (error) {
    console.error("Error setting CORS configuration", error);
  }
  try {
    const fileKey = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    console.log(`S3 Upload - Processing file: ${file.originalname}`);
    let fileContent;
    if (file.buffer) {
      console.log(`Using buffer content with size: ${file.buffer.length} bytes`);
      fileContent = file.buffer;
    } else if (file.path) {
      console.log(`Reading file from path: ${file.path}`);
      fileContent = await fs.readFile(file.path);
    } else {
      throw new Error("File has neither buffer nor path");
    }
    if (!fileContent) {
      throw new Error("Failed to get file content");
    }
    console.log(`File content obtained, size: ${fileContent.length} bytes`);
    console.log(`Content type: ${file.mimetype || "application/octet-stream"}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: file.mimetype || "application/octet-stream"
        // Remove ACL setting as it might cause issues with some bucket configurations
      })
    );
    const url = `https://${bucketName}.s3.amazonaws.com/${fileKey}`;
    console.log(`S3 Upload - Success. URL: ${url}`);
    return url;
  } catch (error) {
    console.error("S3 Upload - Error during upload:", error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    throw error;
  }
}

// server/routes/sheep.ts
var router = Router();
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir2 = path.join(process.cwd(), "uploads");
    fs2.ensureDirSync(uploadDir2);
    cb(null, uploadDir2);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = nanoid(10);
    cb(null, `sheep-${uniqueSuffix}-${file.originalname}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50MB limit
});
router.get("/api/sheep", async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";
    const whereCondition = isAdmin ? void 0 : and(eq(sheep.display, true), eq(sheep.died, false));
    const result = await db2.query.sheep.findMany({
      where: whereCondition,
      orderBy: [asc(sheep.order), desc(sheep.createdAt)],
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching sheep:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/api/sheep/admin", async (req, res) => {
  try {
    const result = await db2.query.sheep.findMany({
      orderBy: [asc(sheep.order), desc(sheep.createdAt)],
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching sheep for admin:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/api/sheep/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isAdmin = req.query.admin === "true";
    const whereCondition = isAdmin ? eq(sheep.id, id) : and(eq(sheep.id, id), eq(sheep.display, true), eq(sheep.died, false));
    const result = await db2.query.sheep.findFirst({
      where: whereCondition,
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    if (!result) {
      return res.status(404).json({ error: "Sheep not found" });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching sheep by ID:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/api/sheep", upload.single("profileImage"), async (req, res) => {
  try {
    const data = req.body;
    let profileImageUrl = null;
    if (req.file) {
      const s3Result = await uploadToS3(req.file);
      profileImageUrl = s3Result;
    }
    const media = data.media ? typeof data.media === "string" ? JSON.parse(data.media) : data.media : [];
    const documents = data.documents ? typeof data.documents === "string" ? JSON.parse(data.documents) : data.documents : [];
    const processedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "display" || key === "sold" || key === "available" || key === "lamb" || key === "outsideBreeder" || key === "died") {
        processedData[key] = value === true || value === "true";
      } else if (key === "price" || key === "ramPrice" || key === "wetherPrice") {
        processedData[key] = value === "" || value === null || value === void 0 ? null : value;
      } else if (key !== "media" && key !== "documents") {
        processedData[key] = value;
      }
    }
    if (profileImageUrl) {
      processedData.profileImageUrl = profileImageUrl;
    }
    const result = await db2.transaction(async (tx) => {
      const insertResult = await tx.insert(sheep).values(processedData).returning();
      const newSheep = insertResult[0];
      if (media.length > 0) {
        const mediaValues = media.map((item, index) => ({
          sheepId: newSheep.id,
          url: item.url,
          type: item.type || "image",
          order: index
        }));
        await tx.insert(sheepMedia).values(mediaValues);
      }
      if (documents.length > 0) {
        const documentValues = documents.map((doc) => ({
          sheepId: newSheep.id,
          url: doc.url,
          type: doc.type || "health",
          name: doc.name || "Document",
          mimeType: doc.mimeType || "application/pdf"
        }));
        await tx.insert(sheepDocuments).values(documentValues);
      }
      return newSheep;
    });
    res.json(result);
  } catch (error) {
    console.error("Error creating sheep:", error);
    res.status(500).json({ error: error.message });
  }
});
router.put("/api/sheep/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const { media = [], documents = [], ...sheepData } = data;
    const processedData = {};
    for (const [key, value] of Object.entries(sheepData)) {
      if (key === "price" || key === "ramPrice" || key === "wetherPrice") {
        if (value === "" || value === null || value === void 0) {
          processedData[key] = null;
        } else {
          processedData[key] = value;
        }
      } else if (key === "display") {
        const displayValue = value === true;
        processedData[key] = displayValue;
      } else if (key === "sold" || key === "available" || key === "lamb" || key === "outsideBreeder" || key === "died") {
        const boolValue = value === true;
        processedData[key] = boolValue;
      } else {
        processedData[key] = value;
      }
    }
    await db2.transaction(async (tx) => {
      await tx.update(sheep).set(processedData).where(eq(sheep.id, id));
      await tx.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
      if (media.length > 0) {
        const mediaValues = media.map((item, index) => ({
          sheepId: id,
          url: item.url,
          type: item.type || "image",
          order: index
        }));
        await tx.insert(sheepMedia).values(mediaValues);
      }
      await tx.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
      if (documents.length > 0) {
        const documentValues = documents.map((doc) => ({
          sheepId: id,
          url: doc.url,
          type: doc.type || "health",
          name: doc.name || "Document",
          mimeType: doc.mimeType || "application/pdf"
        }));
        await tx.insert(sheepDocuments).values(documentValues);
      }
    });
    const updatedSheep = await db2.query.sheep.findFirst({
      where: eq(sheep.id, id),
      with: {
        media: {
          orderBy: [asc(sheepMedia.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(updatedSheep);
  } catch (error) {
    console.error("Error updating sheep:", error);
    res.status(500).json({ error: error.message });
  }
});
router.delete("/api/sheep/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sheepToDelete = await db2.query.sheep.findFirst({
      where: eq(sheep.id, id),
      with: {
        media: true,
        documents: true
      }
    });
    if (!sheepToDelete) {
      return res.status(404).json({ error: "Sheep not found" });
    }
    await db2.transaction(async (tx) => {
      await tx.delete(sheepMedia).where(eq(sheepMedia.sheepId, id));
      await tx.delete(sheepDocuments).where(eq(sheepDocuments.sheepId, id));
      await tx.delete(sheep).where(eq(sheep.id, id));
    });
    res.json({ message: "Sheep deleted successfully" });
  } catch (error) {
    console.error("Error deleting sheep:", error);
    res.status(500).json({ error: error.message });
  }
});
var sheep_default = router;

// server/routes.ts
import Stripe from "stripe";
var uploadDir = path3.join(process.cwd(), "uploads");
fs4.ensureDirSync(uploadDir);
var storage2 = multer2.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file-" + uniqueSuffix + path3.extname(file.originalname));
  }
});
var upload2 = multer2({
  storage: storage2,
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB limit
    files: 10
    // Allow up to 10 files at once
  }
});
var stripeSecretKey = process.env.STRIPE_SECRET_KEY_LIVE || process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY_LIVE or STRIPE_SECRET_KEY");
}
var stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16"
});
var productCache = [];
var cacheLastUpdated = null;
var CACHE_DURATION_MS = 12 * 60 * 60 * 1e3;
function registerRoutes(app2) {
  app2.get("/api/files/:filename", async (req, res) => {
    try {
      const file = await db.query.fileStorage.findFirst({
        where: eq2(fileStorage.fileName, req.params.filename)
      });
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      const buffer = Buffer.from(file.data, "base64");
      res.setHeader("Content-Type", file.mimeType);
      res.send(buffer);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });
  const SessionStore = MemoryStore(session);
  app2.use(session({
    store: new SessionStore({ checkPeriod: 864e5 }),
    secret: "farm-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days in milliseconds
    }
  }));
  (async () => {
    const adminUser = await db.query.users.findFirst({
      where: eq2(users.username, "admin")
    });
    if (!adminUser) {
      const defaultPassword = process.env.NODE_ENV === "production" ? process.env.ADMIN_PASSWORD?.replace(/\s+/g, "") || "AustenAlcott" : "AustenAlcott";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword
      });
    }
    const defaultContent = [
      { key: "logo", value: "/images/logo.png", type: "image" },
      { key: "hero_background", value: "https://images.unsplash.com/photo-1611501807352-03324d70054c", type: "image" },
      { key: "hero_text", value: "Welcome to Little Way Acres", type: "text" },
      { key: "hero_subtext", value: "Experience the charm of sustainable farming, meet our beloved animals, and enjoy fresh, locally grown produce at our farmers market.", type: "text" },
      { key: "about_title", value: "About Our Farm", type: "text" },
      { key: "mission_text", value: "Dedicated to sustainable farming practices and providing the highest quality produce and animal products to our local community.", type: "text" },
      // Animals Card
      { key: "animals_title", value: "Our Animals", type: "text" },
      { key: "animals_text", value: "Our Colorado Mountain Dogs are exceptional working dogs bred for livestock protection. Known for their gentle nature with family and fierce loyalty in guarding, these magnificent animals combine the best traits of various mountain dog breeds. Each puppy is raised with hands-on care and early socialization to ensure they develop into well-rounded guardians.", type: "text" },
      { key: "animals_image", value: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e", type: "image" },
      { key: "animals_button_text", value: "Learn More About Our Dogs", type: "text" },
      { key: "animals_redirect", value: "/dogs", type: "text" },
      // Goats Card
      { key: "bakery_title", value: "Our Goats", type: "text" },
      { key: "bakery_text", value: "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production. Perfect for small homesteads, they're easy to handle and maintain. Our goats are registered, health-tested, and raised with love to ensure they make wonderful additions to your family or farming operation.", type: "text" },
      { key: "bakery_image", value: "https://images.unsplash.com/photo-1533318087102-b3ad366ed041", type: "image" },
      { key: "bakery_button_text", value: "Learn About Our Goats", type: "text" },
      { key: "bakery_redirect", value: "/goats", type: "text" },
      // Products Card
      { key: "products_title", value: "Farmers Market", type: "text" },
      { key: "products_text", value: "Visit our Farmers Market for a delightful selection of homemade and farm-fresh goods. Savor our artisanal sourdough bread and buttery croissants, baked fresh daily. Enjoy our seasonal mixed salad greens, farm-fresh eggs, pasture-raised chicken, and pure local honey. Every product reflects our commitment to quality and sustainable farming practices.", type: "text" },
      { key: "products_image", value: "https://images.unsplash.com/photo-1488459716781-31db52582fe9", type: "image" },
      { key: "products_button_text", value: "Visit Our Market", type: "text" },
      { key: "products_redirect", value: "/market", type: "text" }
    ];
    for (const content of defaultContent) {
      const exists = await db.query.siteContent.findFirst({
        where: eq2(siteContent.key, content.key)
      });
      if (!exists) {
        await db.insert(siteContent).values(content);
      }
    }
    const existingCarouselItems = await db.query.carouselItems.findMany();
    if (existingCarouselItems.length === 0) {
      const defaultCarouselItems = [
        {
          title: "Colorado Mountain Dogs",
          description: "Our exceptional working dogs bred for livestock protection. Known for their gentle nature with family and fierce loyalty in guarding, these magnificent animals are raised with hands-on care and early socialization.",
          imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
          order: 1
        },
        {
          title: "Nigerian Dwarf Goats",
          description: "Our beloved Nigerian Dwarf Goats, known for their friendly personalities and rich milk production. Perfect for small homesteads, they're registered, health-tested, and raised with love.",
          imageUrl: "https://images.unsplash.com/photo-1533318087102-b3ad366ed041",
          order: 2
        },
        {
          title: "Farm Fresh Products",
          description: "Visit our Farmers Market for homemade and farm-fresh goods. From artisanal bread to seasonal produce, every product reflects our commitment to quality and sustainable farming.",
          imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
          order: 3
        }
      ];
      for (const item of defaultCarouselItems) {
        await db.insert(carouselItems).values(item);
      }
    }
    const existingHero = await db.query.dogsHero.findFirst();
    app2.get("/api/site-content/:key", async (req, res) => {
      try {
        const content = await db.query.siteContent.findFirst({
          where: (siteContent2, { eq: eq6 }) => eq6(siteContent2.key, req.params.key)
        });
        if (!content || !content.value) {
          return res.status(404).send("Image not found");
        }
        res.redirect(content.value);
      } catch (error) {
        console.error("Error fetching content image:", error);
        res.status(500).send("Error fetching image");
      }
    });
    if (!existingHero) {
      await db.insert(dogsHero).values({
        title: "Colorado Mountain Dogs",
        subtitle: "Loyal guardians bred for livestock protection, combining strength with gentle temperament",
        imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"
      });
    }
    const existingDogs = await db.query.dogs.findMany();
    if (existingDogs.length === 0) {
      const sampleDogs = [
        {
          name: "Luna",
          breed: "Colorado Mountain Dog",
          birthDate: "2022-01-15",
          description: "Luna is a gentle giant with exceptional guarding instincts. She's great with children and livestock alike.",
          imageUrl: "https://images.unsplash.com/photo-1583511655826-05700442b31b",
          isAvailable: true,
          order: 1
        },
        {
          name: "Atlas",
          breed: "Colorado Mountain Dog",
          birthDate: "2021-06-20",
          description: "Atlas is a proven guardian with a calm demeanor. He excels at protecting livestock and is well-socialized.",
          imageUrl: "https://images.unsplash.com/photo-1583511666407-5f06533f2113",
          isAvailable: true,
          order: 2
        },
        {
          name: "Sierra",
          breed: "Colorado Mountain Dog",
          birthDate: "2023-03-10",
          description: "Sierra is a young, energetic guardian in training. She shows great promise in both protection and companionship.",
          imageUrl: "https://images.unsplash.com/photo-1583511666383-67ab5c547eb8",
          isAvailable: true,
          order: 3
        },
        {
          name: "Rocky",
          breed: "Colorado Mountain Dog",
          birthDate: "2020-08-25",
          description: "Rocky is an experienced guardian with a perfect track record. He's calm, confident, and excellent with other dogs.",
          imageUrl: "https://images.unsplash.com/photo-1583511666450-662b12363a55",
          isAvailable: true,
          order: 4
        }
      ];
      for (const dog of sampleDogs) {
        await db.insert(dogs).values(dog);
      }
    }
    const existingGoats = await db.query.goats.findMany();
    if (existingGoats.length === 0) {
      const sampleGoats = [
        {
          name: "Luna",
          gender: "female",
          birthDate: "2023-03-15",
          breed: "Nigerian Dwarf",
          description: "Luna is a beautiful Nigerian Dwarf doe with excellent milking genetics.",
          color: "Black and white",
          available: true,
          kid: false,
          outsideBreeder: false,
          order: 1,
          profileImageUrl: "/images/goats/luna.jpg"
        },
        {
          name: "Zeus",
          gender: "male",
          birthDate: "2022-06-20",
          breed: "Nigerian Dwarf",
          description: "Zeus is our primary breeding buck, known for producing quality offspring.",
          color: "Brown and white",
          available: false,
          kid: false,
          outsideBreeder: false,
          order: 2,
          profileImageUrl: "/images/goats/zeus.jpg"
        },
        {
          name: "Daisy",
          gender: "female",
          birthDate: "2023-01-10",
          breed: "Nigerian Dwarf",
          description: "Daisy is a sweet-natured doe with great milking potential.",
          color: "Tri-colored",
          available: true,
          kid: false,
          outsideBreeder: false,
          order: 3,
          profileImageUrl: "/images/goats/daisy.jpg"
        }
      ];
      for (const goat of sampleGoats) {
        await db.insert(goats).values(goat);
      }
    }
    const existingGoatLitters = await db.query.goatLitters.findMany();
    if (existingGoatLitters.length === 0) {
      const goatsList = await db.query.goats.findMany();
      const mothers = goatsList.filter((g) => g.gender === "female");
      const fathers = goatsList.filter((g) => g.gender === "male");
      if (mothers.length > 0 && fathers.length > 0) {
        const sampleLitters = [
          {
            motherId: mothers[0].id,
            fatherId: fathers[0].id,
            dueDate: "2024-04-15",
            isVisible: true
          },
          {
            motherId: mothers[mothers.length - 1].id,
            fatherId: fathers[0].id,
            dueDate: "2024-05-20",
            isVisible: true
          }
        ];
        for (const litter of sampleLitters) {
          await db.insert(goatLitters).values(litter);
        }
      }
    }
    const existingMarketSections = await db.query.marketSections.findMany();
    if (existingMarketSections.length === 0) {
      const defaultSections = [
        {
          name: "about",
          title: "About Our Market",
          description: "Learn more about our farmers market and what we offer",
          imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
          order: 1
        },
        {
          name: "bakery",
          title: "Bakery",
          description: "Fresh baked goods made daily with locally sourced ingredients",
          imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
          order: 2
        },
        {
          name: "animal_products",
          title: "Animal Products",
          description: "Fresh eggs, dairy, and other farm-fresh animal products",
          imageUrl: "https://images.unsplash.com/photo-1533318087102-b3ad366ed041",
          order: 4
        },
        {
          name: "apparel",
          title: "Farm Apparel",
          description: "High-quality clothing and accessories featuring Little Way Acres designs",
          imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
          order: 5
        }
      ];
      for (const section of defaultSections) {
        await db.insert(marketSections).values(section);
      }
    }
  })();
  app2.get("/api/site-content", async (req, res) => {
    const siteId = getCurrentSiteId(req);
    const content = await db.query.siteContent.findMany({
      where: eq2(siteContent.siteId, siteId)
    });
    res.json(content);
  });
  app2.put("/api/site-content/:key", upload2.single("file"), async (req, res) => {
    const key = req.params.key;
    console.log(`=== SITE CONTENT UPDATE: ${key} ===`);
    console.log("Request body:", req.body);
    console.log("Request file:", req.file ? "Present" : "None");
    try {
      let value = req.body.value;
      if (value && value.startsWith("data:image")) {
        const base64Data = value.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const filename = `file-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
        await fs4.writeFile(path3.join(uploadDir, filename), buffer);
        value = `/uploads/${filename}`;
      } else if (req.file && (key === "hero_background" || key.includes("image"))) {
        value = `/uploads/${req.file.filename}`;
      }
      const existingContent = await db.query.siteContent.findFirst({
        where: eq2(siteContent.key, key)
      });
      if (!existingContent) {
        const siteId = getCurrentSiteId(req);
        const content = await db.insert(siteContent).values({
          siteId,
          key,
          value,
          type: key.includes("image") ? "image" : "text"
        }).returning();
        res.json(content[0]);
      } else {
        const siteId = getCurrentSiteId(req);
        const content = await db.update(siteContent).set({
          siteId,
          value,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(siteContent.key, key)).returning();
        res.json(content[0]);
      }
    } catch (error) {
      console.error(`Error updating site content for key ${key}:`, error);
      res.status(500).json({ message: "Failed to update site content" });
    }
  });
  app2.get("/api/site-content/cmd-description", async (_req, res) => {
    try {
      const content = await db.query.siteContent.findFirst({
        where: eq2(siteContent.key, "cmd_description")
      });
      if (!content) {
        const newContent = await db.insert(siteContent).values({
          key: "cmd_description",
          value: "Colorado Mountain Dogs are exceptional working dogs bred for livestock protection.",
          type: "text"
        }).returning();
        res.json(newContent[0]);
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching CMD description:", error);
      res.status(500).json({ message: "Failed to fetch CMD description" });
    }
  });
  app2.post("/api/site-content/cmd-description", async (req, res) => {
    try {
      const { value } = req.body;
      const existingContent = await db.query.siteContent.findFirst({
        where: eq2(siteContent.key, "cmd_description")
      });
      if (existingContent) {
        const siteId = getCurrentSiteId(req);
        const content = await db.update(siteContent).set({
          siteId,
          value,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq2(siteContent.key, "cmd_description")).returning();
        res.json(content[0]);
      } else {
        const siteId = getCurrentSiteId(req);
        const content = await db.insert(siteContent).values({
          siteId,
          key: "cmd_description",
          value,
          type: "text"
        }).returning();
        res.json(content[0]);
      }
    } catch (error) {
      console.error("Error updating CMD description:", error);
      res.status(500).json({ message: "Failed to update CMD description" });
    }
  });
  app2.get("/api/animals", async (req, res) => {
    const type = req.query.type;
    const allAnimals = await db.query.animals.findMany({
      where: type ? eq2(animals.type, type) : void 0
    });
    res.json(allAnimals);
  });
  app2.post("/api/animals", async (req, res) => {
    const animal = await db.insert(animals).values(req.body).returning();
    res.json(animal[0]);
  });
  app2.put("/api/animals/:id", async (req, res) => {
    const animal = await db.update(animals).set(req.body).where(eq2(animals.id, parseInt(req.params.id))).returning();
    res.json(animal[0]);
  });
  app2.delete("/api/animals/:id", async (req, res) => {
    await db.delete(animals).where(eq2(animals.id, parseInt(req.params.id)));
    res.json({ message: "Deleted successfully" });
  });
  app2.get("/api/market-sections", async (_req, res) => {
    try {
      const sections = await db.query.marketSections.findMany({
        orderBy: (marketSections2, { asc: asc3 }) => [asc3(marketSections2.order)]
      });
      res.json(sections);
    } catch (error) {
      console.error("Error fetching market sections:", error);
      res.status(500).json({ message: "Failed to fetch market sections" });
    }
  });
  app2.post("/api/market-sections", async (req, res) => {
    try {
      const section = await db.insert(marketSections).values(req.body).returning();
      res.json(section[0]);
    } catch (error) {
      console.error("Error creating market section:", error);
      res.status(500).json({ message: "Failed to create market section" });
    }
  });
  app2.put("/api/market-sections/:id", async (req, res) => {
    try {
      const section = await db.update(marketSections).set({
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(marketSections.id, parseInt(req.params.id))).returning();
      res.json(section[0]);
    } catch (error) {
      console.error("Error updating market section:", error);
      res.status(500).json({ message: "Failed to update market section" });
    }
  });
  app2.delete("/api/market-sections/:id", async (req, res) => {
    try {
      await db.delete(marketSections).where(eq2(marketSections.id, parseInt(req.params.id)));
      res.json({ message: "Market section deleted successfully" });
    } catch (error) {
      console.error("Error deleting market section:", error);
      res.status(500).json({ message: "Failed to delete market section" });
    }
  });
  app2.get("/api/market-schedules", async (_req, res) => {
    try {
      const schedules = await db.query.marketSchedules.findMany({
        orderBy: (marketSchedules2, { asc: asc3 }) => [asc3(marketSchedules2.order)]
      });
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching market schedules:", error);
      res.status(500).json({ message: "Failed to fetch market schedules" });
    }
  });
  app2.post("/api/market-schedules", async (req, res) => {
    try {
      const schedule = await db.insert(marketSchedules).values(req.body).returning();
      res.json(schedule[0]);
    } catch (error) {
      console.error("Error creating market schedule:", error);
      res.status(500).json({ message: "Failed to create market schedule" });
    }
  });
  app2.put("/api/market-schedules/:id", async (req, res) => {
    try {
      const { location, address, dayOfWeek, startTime, endTime, description, order, isActive } = req.body;
      const schedule = await db.update(marketSchedules).set({
        location,
        address,
        dayOfWeek,
        startTime,
        endTime,
        description,
        order,
        isActive,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(marketSchedules.id, parseInt(req.params.id))).returning();
      res.json(schedule[0]);
    } catch (error) {
      console.error("Error updating market schedule:", error);
      res.status(500).json({ message: "Failed to update market schedule" });
    }
  });
  app2.delete("/api/market-schedules/:id", async (req, res) => {
    try {
      await db.delete(marketSchedules).where(eq2(marketSchedules.id, parseInt(req.params.id)));
      res.json({ message: "Market schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting market schedule:", error);
      res.status(500).json({ message: "Failed to delete market schedule" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    const section = req.query.section;
    try {
      const allProducts = await db.query.products.findMany({
        where: section ? eq2(products.section, section) : void 0,
        orderBy: (products2, { asc: asc3 }) => [asc3(products2.order)]
      });
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/products", async (req, res) => {
    try {
      const product = await db.insert(products).values(req.body).returning();
      res.json(product[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.put("/api/products/:id", async (req, res) => {
    try {
      const product = await db.update(products).set({
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(products.id, parseInt(req.params.id))).returning();
      res.json(product[0]);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", async (req, res) => {
    try {
      await db.delete(products).where(eq2(products.id, parseInt(req.params.id)));
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/deployment-status", (_req, res) => {
    res.json({ isProduction: process.env.NODE_ENV === "production" });
  });
  app2.get("/api/carousel", async (req, res) => {
    const siteId = getCurrentSiteId(req);
    const items = await db.query.carouselItems.findMany({
      where: eq2(carouselItems.siteId, siteId),
      orderBy: (carouselItems2, { asc: asc3 }) => [asc3(carouselItems2.order)]
    });
    res.json(items);
  });
  app2.post("/api/carousel", async (req, res) => {
    const items = await db.query.carouselItems.findMany();
    const maxOrder = items.reduce((max, item2) => Math.max(max, item2.order), 0);
    const item = await db.insert(carouselItems).values({ ...req.body, order: maxOrder + 1 }).returning();
    res.json(item[0]);
  });
  app2.put("/api/carousel/:id", async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (updateData.createdAt) {
        updateData.createdAt = new Date(updateData.createdAt);
      }
      const item = await db.update(carouselItems).set(updateData).where(eq2(carouselItems.id, parseInt(req.params.id))).returning();
      res.json(item[0]);
    } catch (error) {
      console.error("Error updating carousel item:", error);
      res.status(500).json({ message: "Failed to update carousel item" });
    }
  });
  app2.delete("/api/carousel/:id", async (req, res) => {
    await db.delete(carouselItems).where(eq2(carouselItems.id, parseInt(req.params.id)));
    const items = await db.query.carouselItems.findMany({
      orderBy: (carouselItems2, { asc: asc3 }) => [asc3(carouselItems2.order)]
    });
    for (let i = 0; i < items.length; i++) {
      await db.update(carouselItems).set({ order: i + 1 }).where(eq2(carouselItems.id, items[i].id));
    }
    res.json({ message: "Deleted successfully" });
  });
  app2.get("/api/dogs-hero", async (_req, res) => {
    const hero = await db.query.dogsHero.findMany();
    res.json(hero);
  });
  app2.put("/api/dogs-hero/:id", upload2.single("image"), async (req, res) => {
    try {
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      if (!imageUrl) {
        return res.status(400).json({ message: "No image URL or file provided" });
      }
      const hero = await db.update(dogsHero).set({
        imageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(dogsHero.id, parseInt(req.params.id))).returning();
      res.json(hero[0]);
    } catch (error) {
      console.error("Error updating hero image:", error);
      res.status(500).json({ message: "Failed to update hero image" });
    }
  });
  app2.get("/api/dogs", async (req, res) => {
    const siteId = getCurrentSiteId(req);
    const isAdmin = req.query.admin === "true" || Boolean(req.session.isAdmin);
    console.log(`GET /api/dogs - isAdmin: ${isAdmin}`);
    console.log(`Session admin status: ${Boolean(req.session.isAdmin)}`);
    console.log(`Admin query param: ${req.query.admin}`);
    const whereCondition = isAdmin ? eq2(dogs.siteId, siteId) : and2(eq2(dogs.siteId, siteId), eq2(dogs.display, true));
    const allDogs = await db.query.dogs.findMany({
      where: whereCondition,
      orderBy: (dogs2, { asc: asc3 }) => [asc3(dogs2.order)],
      with: {
        media: {
          orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
        },
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    const processedDogs = allDogs.map((dog) => {
      if (!dog.profileImageUrl && dog.media && dog.media.length > 0) {
        const firstImage = dog.media.find((m) => m.type === "image");
        if (firstImage) {
          return {
            ...dog,
            profileImageUrl: firstImage.url
          };
        }
      }
      return dog;
    });
    res.json(processedDogs);
  });
  app2.post("/api/dogs", async (req, res) => {
    const { media, documents, ...dogData } = req.body;
    try {
      const dog = await db.transaction(async (tx) => {
        const [newDog] = await tx.insert(dogs).values(dogData).returning();
        if (media && media.length > 0) {
          await tx.insert(dogMedia).values(
            media.map((item, index) => ({
              dogId: newDog.id,
              url: item.url,
              type: item.type,
              order: index
            }))
          );
        }
        if (documents && documents.length > 0) {
          await tx.insert(dogDocuments).values(
            documents.map((doc) => ({
              dogId: newDog.id,
              url: doc.url,
              type: doc.type,
              name: doc.name,
              mimeType: doc.mimeType
            }))
          );
        }
        const dogWithRelations = await tx.query.dogs.findFirst({
          where: eq2(dogs.id, newDog.id),
          with: {
            media: true,
            documents: true,
            mother: true,
            father: true,
            litter: true
          }
        });
        return dogWithRelations;
      });
      res.json(dog);
    } catch (error) {
      console.error("Error creating dog:", error);
      res.status(500).json({ message: "Failed to create dog" });
    }
  });
  app2.put("/api/dogs/:id", async (req, res) => {
    const { media, documents, ...dogData } = req.body;
    const dogId = parseInt(req.params.id);
    try {
      console.log("Updating dog with ID:", dogId);
      console.log("Received dog data:", dogData);
      console.log("Sold status in request:", dogData.sold);
      console.log("Display status in request:", dogData.display);
      const dog = await db.transaction(async (tx) => {
        const existingDog = await tx.query.dogs.findFirst({
          where: eq2(dogs.id, dogId)
        });
        if (!existingDog) {
          console.log("Dog not found:", dogId);
          return res.status(404).json({ message: "Dog not found" });
        }
        console.log("Existing dog data:", existingDog);
        console.log("Display value before processing:", dogData.display);
        console.log("Display value type:", typeof dogData.display);
        const displayValue = dogData.display === true;
        console.log("Processed display value using strict comparison:", displayValue);
        const updateData = {
          ...dogData,
          height: dogData.height !== void 0 && dogData.height !== "" ? parseFloat(dogData.height) : null,
          weight: dogData.weight !== void 0 && dogData.weight !== "" ? parseFloat(dogData.weight) : null,
          price: dogData.price !== void 0 && dogData.price !== "" ? parseFloat(dogData.price) : null,
          // Use strict boolean comparison for all boolean fields
          sold: dogData.sold === true,
          available: dogData.available === true,
          puppy: dogData.puppy === true,
          died: dogData.died === true,
          display: displayValue,
          // Value is pre-processed with strict comparison
          outsideBreeder: dogData.outsideBreeder === true,
          updatedAt: /* @__PURE__ */ new Date(),
          // Handle string fields with null
          description: dogData.description || null,
          narrativeDescription: dogData.narrativeDescription || null,
          healthData: dogData.healthData || null,
          color: dogData.color || null,
          dewclaws: dogData.dewclaws || null,
          furLength: dogData.furLength || null,
          pedigree: dogData.pedigree || null,
          registrationName: dogData.registrationName || null,
          // Handle IDs
          motherId: dogData.motherId || null,
          fatherId: dogData.fatherId || null,
          litterId: dogData.litterId || null,
          breed: "Colorado Mountain Dogs"
        };
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] === void 0) {
            delete updateData[key];
          }
        });
        await tx.update(dogs).set(updateData).where(eq2(dogs.id, dogId));
        if (media) {
          await tx.delete(dogMedia).where(eq2(dogMedia.dogId, dogId));
          if (media.length > 0) {
            await tx.insert(dogMedia).values(
              media.map((item, index) => ({
                dogId,
                url: item.url,
                type: item.type,
                order: index
              }))
            );
          }
        }
        if (documents) {
          await tx.delete(dogDocuments).where(eq2(dogDocuments.dogId, dogId));
          if (documents.length > 0) {
            await tx.insert(dogDocuments).values(
              documents.map((doc) => ({
                dogId,
                url: doc.url,
                type: doc.type,
                name: doc.name,
                mimeType: doc.mimeType
              }))
            );
          }
        }
        const updatedDog = await tx.query.dogs.findFirst({
          where: eq2(dogs.id, dogId),
          with: {
            media: true,
            documents: true,
            mother: true,
            father: true,
            litter: true
          }
        });
        console.log("Updated dog data:", updatedDog);
        return updatedDog;
      });
      res.json(dog);
    } catch (error) {
      console.error("Error updating dog:", error);
      res.status(500).json({ message: "Failed to update dog" });
    }
  });
  app2.put("/api/dogs/:id/reorder", async (req, res) => {
    const dog = await db.update(dogs).set({
      order: req.body.order,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(dogs.id, parseInt(req.params.id))).returning();
    res.json(dog[0]);
  });
  app2.post("/api/upload", upload2.array("file", 10), async (req, res) => {
    try {
      console.log("\n\n=== UPLOAD REQUEST RECEIVED ===");
      console.log("Headers:", req.headers);
      console.log("Files:", req.files ? req.files.map((f) => ({
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
        path: f.path
      })) : "No files");
      console.log("Request body:", req.body);
      if (!req.files) {
        console.error("No files in request - files object is undefined");
        return res.status(400).json({ message: "No files provided in request" });
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error("No files in request");
        return res.status(400).json({ message: "No files uploaded" });
      }
      const { uploadToS3: uploadToS33 } = await Promise.resolve().then(() => (init_s3(), s3_exports));
      const { retry: retry2 } = await Promise.resolve().then(() => (init_helpers(), helpers_exports));
      console.log(`Processing ${req.files.length} files for S3 upload`);
      const uploadedFiles = await Promise.all(req.files.map(async (file, index) => {
        console.log(`
=== Processing file ${index + 1}/${req.files.length} ===`);
        console.log("File details:", {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path
        });
        console.log("Uploading to S3...");
        const s3Url = await retry2(
          () => uploadToS33(file),
          3,
          // max 3 retries
          2e3
          // start with 2 second delay
        );
        console.log(`S3 upload successful: ${s3Url}`);
        try {
          if (file.path && fs4.existsSync(file.path)) {
            fs4.unlinkSync(file.path);
            console.log(`Deleted local temp file: ${file.path}`);
          }
        } catch (cleanupError) {
          console.warn(`Warning: Could not delete temp file ${file.path}:`, cleanupError);
        }
        return {
          url: s3Url,
          type: file.mimetype.split("/")[0],
          originalName: file.originalname,
          mimeType: file.mimetype
        };
      }));
      console.log("=== S3 UPLOADS COMPLETED SUCCESSFULLY ===");
      console.log("Results:", uploadedFiles);
      res.json(uploadedFiles);
    } catch (error) {
      console.error("\n=== S3 UPLOAD ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          try {
            if (file.path && fs4.existsSync(file.path)) {
              fs4.unlinkSync(file.path);
              console.log(`Cleaned up temp file after error: ${file.path}`);
            }
          } catch (cleanupError) {
            console.warn(`Warning: Could not delete temp file ${file.path}:`, cleanupError);
          }
        });
      }
      return res.status(500).json({
        message: "Failed to upload files to S3",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.use("/uploads", express.static(uploadDir, {
    setHeaders: (res, filePath) => {
      const ext = path3.extname(filePath).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime"
      };
      if (mimeTypes[ext]) {
        res.setHeader("Content-Type", mimeTypes[ext]);
      }
    }
  }));
  app2.get("/api/litters", async (req, res) => {
    const siteId = getCurrentSiteId(req);
    const allLitters = await db.query.litters.findMany({
      where: eq2(litters.siteId, siteId),
      orderBy: (litters2, { desc: desc5 }) => [desc5(litters2.dueDate)],
      with: {
        mother: {
          with: {
            media: {
              orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
            }
          }
        },
        father: {
          with: {
            media: {
              orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
            }
          }
        }
      }
    });
    const littersWithPuppies = await Promise.all(
      allLitters.map(async (litter) => {
        const puppyCount = await db.query.dogs.findMany({
          where: and2(
            eq2(dogs.litterId, litter.id),
            eq2(dogs.puppy, true)
          )
        });
        return {
          ...litter,
          puppyCount: puppyCount.length
        };
      })
    );
    res.json(littersWithPuppies);
  });
  app2.post("/api/litters", async (req, res) => {
    try {
      console.log("Creating litter with data:", req.body);
      const formattedData = {
        ...req.body,
        dueDate: req.body.dueDate,
        isCurrentLitter: req.body.isCurrentLitter || false,
        isPastLitter: req.body.isPastLitter || false,
        isPlannedLitter: req.body.isPlannedLitter || false,
        expectedBreedingDate: req.body.expectedBreedingDate || null,
        expectedPickupDate: req.body.expectedPickupDate || null,
        waitlistLink: req.body.waitlistLink || null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Formatted data:", formattedData);
      const litter = await db.insert(litters).values(formattedData).returning();
      const litterWithParents = await db.query.litters.findFirst({
        where: eq2(litters.id, litter[0].id),
        with: {
          mother: true,
          father: true
        }
      });
      res.json(litterWithParents);
    } catch (error) {
      console.error("Error creating litter:", error);
      res.status(500).json({ message: "Failed to create litter" });
    }
  });
  app2.put("/api/litters/:id", async (req, res) => {
    try {
      console.log("Updating litter with data:", req.body);
      const { dueDate, motherId, fatherId, isVisible, isCurrentLitter, isPastLitter, isPlannedLitter, expectedBreedingDate, expectedPickupDate, waitlistLink } = req.body;
      const updateData = {
        dueDate,
        motherId,
        fatherId,
        isVisible,
        isCurrentLitter: isCurrentLitter || false,
        isPastLitter: isPastLitter || false,
        isPlannedLitter: isPlannedLitter || false,
        expectedBreedingDate: expectedBreedingDate || null,
        expectedPickupDate: expectedPickupDate || null,
        waitlistLink: waitlistLink || null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Formatted update data:", updateData);
      const litter = await db.update(litters).set(updateData).where(eq2(litters.id, parseInt(req.params.id))).returning();
      const litterWithParents = await db.query.litters.findFirst({
        where: eq2(litters.id, litter[0].id),
        with: {
          mother: true,
          father: true
        }
      });
      res.json(litterWithParents);
    } catch (error) {
      console.error("Error updating litter - Full error:", error);
      res.status(500).json({ message: "Failed to update litter", error: error.message });
    }
  });
  app2.delete("/api/litters/:id", async (req, res) => {
    try {
      const litterId = parseInt(req.params.id);
      await db.delete(litter_interest_signups).where(eq2(litter_interest_signups.litterId, litterId));
      await db.delete(litters).where(eq2(litters.id, litterId));
      res.json({ message: "Litter deleted successfully" });
    } catch (error) {
      console.error("Error deleting litter:", error);
      res.status(500).json({ message: "Failed to delete litter" });
    }
  });
  app2.get("/api/litters/:id", async (req, res) => {
    try {
      const litterId = parseInt(req.params.id);
      if (isNaN(litterId)) {
        return res.status(400).json({ message: "Invalid litter ID" });
      }
      const litter = await db.query.litters.findFirst({
        where: eq2(litters.id, litterId),
        with: {
          mother: {
            with: {
              media: {
                orderBy: (media, { asc: asc3 }) => [asc3(media.order)]
              },
              documents: true
            }
          },
          father: {
            with: {
              media: {
                orderBy: (media, { asc: asc3 }) => [asc3(media.order)]
              },
              documents: true
            }
          }
        }
      });
      if (!litter) {
        return res.status(404).json({ message: "Litter not found" });
      }
      const puppies = await db.query.dogs.findMany({
        where: and2(
          eq2(dogs.litterId, litterId),
          eq2(dogs.died, false)
        ),
        with: {
          media: {
            orderBy: (media, { asc: asc3 }) => [asc3(media.order)]
          },
          documents: true
        },
        orderBy: (dogs2, { asc: asc3 }) => [asc3(dogs2.order)]
      });
      res.json({
        ...litter,
        puppies
      });
    } catch (error) {
      console.error("Error fetching litter:", error);
      res.status(500).json({ message: "Failed to fetch litter" });
    }
  });
  app2.get("/api/litters/list/current", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const allLitters = await db.query.litters.findMany({
        where: and2(
          eq2(litters.siteId, siteId),
          eq2(litters.isVisible, true),
          eq2(litters.isCurrentLitter, true)
        ),
        orderBy: (litters2, { desc: desc5 }) => [desc5(litters2.dueDate)],
        with: {
          mother: {
            with: {
              media: true
            }
          },
          father: {
            with: {
              media: true
            }
          }
        }
      });
      const littersWithPuppies = await Promise.all(allLitters.map(async (litter) => {
        const puppies = await db.query.dogs.findMany({
          where: and2(
            eq2(dogs.litterId, litter.id),
            eq2(dogs.died, false)
          ),
          with: {
            media: true
          }
        });
        return {
          ...litter,
          puppies: puppies || []
        };
      }));
      res.json(littersWithPuppies);
    } catch (error) {
      console.error("Error fetching current litters:", error);
      res.status(500).json({ message: "Failed to fetch current litters" });
    }
  });
  app2.get("/api/litters/list/future", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const allLitters = await db.query.litters.findMany({
        where: and2(
          eq2(litters.siteId, siteId),
          eq2(litters.isVisible, true),
          eq2(litters.isPlannedLitter, true)
        ),
        orderBy: (litters2, { desc: desc5 }) => [desc5(litters2.dueDate)],
        with: {
          mother: {
            with: {
              media: true
            }
          },
          father: {
            with: {
              media: true
            }
          }
        }
      });
      res.json(allLitters);
    } catch (error) {
      console.error("Error fetching future litters:", error);
      res.status(500).json({ message: "Failed to fetch future litters" });
    }
  });
  app2.get("/api/litters/list/past", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const allLitters = await db.query.litters.findMany({
        where: and2(
          eq2(litters.siteId, siteId),
          eq2(litters.isVisible, true),
          eq2(litters.isPastLitter, true)
        ),
        with: {
          mother: {
            with: {
              media: {
                orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
              }
            }
          },
          father: {
            with: {
              media: {
                orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
              }
            }
          }
        }
      });
      const littersWithPuppies = await Promise.all(
        allLitters.map(async (litter) => {
          const puppies = await db.query.dogs.findMany({
            where: and2(
              eq2(dogs.litterId, litter.id),
              eq2(dogs.died, false)
            ),
            with: {
              media: {
                orderBy: (dogMedia2, { asc: asc3 }) => [asc3(dogMedia2.order)]
              }
            }
          });
          if (puppies.length > 0 && puppies.some((puppy) => puppy.birthDate)) {
            return {
              ...litter,
              puppies
            };
          }
          return null;
        })
      );
      const validLitters = littersWithPuppies.filter((litter) => litter !== null);
      const sortedLitters = validLitters.sort((a, b) => {
        const aDate = new Date(a.puppies[0].birthDate);
        const bDate = new Date(b.puppies[0].birthDate);
        return bDate.getTime() - aDate.getTime();
      });
      res.json(sortedLitters);
    } catch (error) {
      console.error("Error fetching past litters:", error);
      res.status(500).json({ message: "Failed to fetch past litters" });
    }
  });
  app2.get("/api/principles", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const allPrinciples = await db.query.principles.findMany({
        where: eq2(principles.siteId, siteId),
        orderBy: (principles2, { asc: asc3 }) => [asc3(principles2.order)]
      });
      res.json(allPrinciples);
    } catch (error) {
      console.error("Error fetching principles:", error);
      res.status(500).json({ message: "Failed to fetch principles" });
    }
  });
  app2.post("/api/principles", async (req, res) => {
    try {
      const principle = await db.insert(principles).values(req.body).returning();
      res.json(principle[0]);
    } catch (error) {
      console.error("Error creating principle:", error);
      res.status(500).json({ message: "Failed to create principle" });
    }
  });
  app2.put("/api/principles/:id", async (req, res) => {
    try {
      const principle = await db.update(principles).set({
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(principles.id, parseInt(req.params.id))).returning();
      res.json(principle[0]);
    } catch (error) {
      console.error("Error updating principle:", error);
      res.status(500).json({ message: "Failed to update principle" });
    }
  });
  app2.delete("/api/principles/:id", async (req, res) => {
    try {
      await db.delete(principles).where(eq2(principles.id, parseInt(req.params.id)));
      res.json({ message: "Principle deleted successfully" });
    } catch (error) {
      console.error("Error deleting principle:", error);
      res.status(500).json({ message: "Failed to delete principle" });
    }
  });
  app2.get("/api/about-cards", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const cardKeys = [
        "about_card_1_title",
        "about_card_1_description",
        "about_card_1_icon",
        "about_card_2_title",
        "about_card_2_description",
        "about_card_2_icon",
        "about_card_3_title",
        "about_card_3_description",
        "about_card_3_icon",
        "about_section_title",
        "about_section_description"
      ];
      const content = await db.query.siteContent.findMany({
        where: (siteContent2, { or, eq: eq6, and: and6 }) => and6(
          eq6(siteContent2.siteId, siteId),
          or(...cardKeys.map((key) => eq6(siteContent2.key, key)))
        )
      });
      const aboutCards = {
        sectionTitle: content.find((c) => c.key === "about_section_title")?.value || "What We Offer",
        sectionDescription: content.find((c) => c.key === "about_section_description")?.value || "Discover our range of services",
        cards: [1, 2, 3].map((i) => ({
          title: content.find((c) => c.key === `about_card_${i}_title`)?.value || "",
          description: content.find((c) => c.key === `about_card_${i}_description`)?.value || "",
          icon: content.find((c) => c.key === `about_card_${i}_icon`)?.value || ""
        }))
      };
      res.json(aboutCards);
    } catch (error) {
      console.error("Error fetching about cards:", error);
      res.status(500).json({ message: "Failed to fetch about cards" });
    }
  });
  app2.get("/api/contact-info", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const contact = await db.query.contactInfo.findFirst({
        where: eq2(contactInfo.siteId, siteId)
      });
      if (contact) {
        res.json(contact);
      } else {
        res.status(404).json({ message: "Contact info not found" });
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });
  app2.put("/api/about-cards", async (req, res) => {
    try {
      const { sectionTitle, sectionDescription, cards } = req.body;
      const updates = [
        { key: "about_section_title", value: sectionTitle, type: "text" },
        { key: "about_section_description", value: sectionDescription, type: "text" },
        ...cards.flatMap((card, index) => [
          { key: `about_card_${index + 1}_title`, value: card.title, type: "text" },
          { key: `about_card_${index + 1}_description`, value: card.description, type: "text" },
          { key: `about_card_${index + 1}_icon`, value: card.icon, type: "text" }
        ])
      ];
      for (const update of updates) {
        const existing = await db.query.siteContent.findFirst({
          where: eq2(siteContent.key, update.key)
        });
        if (existing) {
          await db.update(siteContent).set({ value: update.value, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(siteContent.key, update.key));
        } else {
          await db.insert(siteContent).values(update);
        }
      }
      res.json({ message: "About cards updated successfully" });
    } catch (error) {
      console.error("Error updating about cards:", error);
      res.status(500).json({ message: "Failed to update about cards" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, items, customerInfo, pickupLocation } = req.body;
      console.log("Creating payment intent for amount:", amount);
      console.log("Items:", items);
      if (amount < 0.5) {
        return res.status(400).json({
          message: "Order total must be at least $0.50"
        });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          orderItems: JSON.stringify(items),
          itemCount: items.length.toString(),
          orderTotal: `$${amount.toFixed(2)}`
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/update-payment-intent", async (req, res) => {
    try {
      const { paymentIntentId, customerInfo, pickupLocation } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }
      const pickupInstructions = pickupLocation?.location?.toLowerCase().includes("little way acres") ? "Look for the farm stand with clear totes, find the bag marked with your name, arrive during pickup hours, enjoy your LWA order!" : "Look for the Little Way Acres stand. We are usually placed in a spot between 59-57.";
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const items = paymentIntent.metadata?.orderItems ? JSON.parse(paymentIntent.metadata.orderItems) : [];
      const itemsList = items.map(
        (item) => `${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
      ).join(", ");
      const receiptDescription = `Order Items: ${itemsList}. Pickup: ${pickupLocation?.location || "TBD"} - ${pickupLocation ? `${pickupLocation.dayOfWeek} ${pickupLocation.startTime} - ${pickupLocation.endTime}` : "TBD"} - ${pickupInstructions}`;
      console.log("Updating payment intent with customer info:", customerInfo?.email);
      const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        description: receiptDescription,
        metadata: {
          customerName: customerInfo ? `${customerInfo.firstName} ${customerInfo.lastName}` : "",
          customerEmail: customerInfo?.email || "",
          customerPhone: customerInfo?.phone || "",
          pickupLocation: pickupLocation?.location || "",
          pickupAddress: pickupLocation?.address || "",
          pickupTime: pickupLocation ? `${pickupLocation.dayOfWeek} ${pickupLocation.startTime} - ${pickupLocation.endTime}` : "",
          pickupInstructions,
          orderItems: itemsList
          // Add items list to metadata as well
        }
      });
      res.json({ success: true, paymentIntent: updatedPaymentIntent });
    } catch (error) {
      console.error("Error updating payment intent:", error);
      res.status(500).json({ message: "Error updating payment intent: " + error.message });
    }
  });
  app2.post("/api/send-order-confirmation", async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Order confirmation handled by Stripe receipt system"
      });
    } catch (error) {
      console.error("Error in order confirmation endpoint:", error);
      res.status(500).json({ message: "Error in order confirmation: " + error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const trimmedUsername = username?.trim();
      const trimmedPassword = password?.trim();
      console.log("Login attempt:", {
        original: { username, password },
        trimmed: { username: trimmedUsername, password: trimmedPassword },
        lengths: {
          originalUsername: username?.length,
          trimmedUsername: trimmedUsername?.length,
          originalPassword: password?.length,
          trimmedPassword: trimmedPassword?.length
        }
      });
      if (trimmedUsername === "LWA" && trimmedPassword === "Tecumseh1-") {
        req.session.isAdmin = true;
        req.session.username = trimmedUsername;
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ success: true });
    });
  });
  app2.get("/api/auth/status", (req, res) => {
    if (req.session.isAdmin) {
      res.json({ isLoggedIn: true, username: req.session.username });
    } else {
      res.json({ isLoggedIn: false });
    }
  });
  app2.get("/api/sites", async (_req, res) => {
    try {
      const allSites = await db.query.sites.findMany({
        orderBy: (sites2, { asc: asc3 }) => [asc3(sites2.name)]
      });
      res.json(allSites);
    } catch (error) {
      console.error("Error fetching sites:", error);
      res.status(500).json({ message: "Failed to fetch sites" });
    }
  });
  app2.get("/api/goats", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const isAdmin = req.query.admin === "true" || Boolean(req.session.isAdmin);
      const whereCondition = isAdmin ? eq2(goats.siteId, siteId) : and2(eq2(goats.siteId, siteId), eq2(goats.display, true));
      const allGoats = await db.query.goats.findMany({
        where: whereCondition,
        orderBy: (goats2, { asc: asc3 }) => [asc3(goats2.order)],
        with: {
          media: {
            orderBy: (goatMedia4, { asc: asc3 }) => [asc3(goatMedia4.order)]
          },
          documents: true,
          mother: true,
          father: true,
          litter: true
        }
      });
      const processedGoats = allGoats.map((goat) => {
        if (!goat.profileImageUrl && goat.media && goat.media.length > 0) {
          const firstImage = goat.media.find((m) => m.type === "image");
          if (firstImage) {
            return {
              ...goat,
              profileImageUrl: firstImage.url
            };
          }
        }
        return goat;
      });
      res.json(processedGoats);
    } catch (error) {
      console.error("Error fetching goats:", error);
      res.status(500).json({ message: "Failed to fetch goats" });
    }
  });
  app2.get("/api/goat-litters", async (req, res) => {
    const siteId = getCurrentSiteId(req);
    const allGoatLitters = await db.query.goatLitters.findMany({
      where: eq2(goatLitters.siteId, siteId),
      with: {
        mother: {
          with: {
            media: {
              orderBy: (goatMedia4, { asc: asc3 }) => [asc3(goatMedia4.order)]
            },
            documents: true
          }
        },
        father: {
          with: {
            media: {
              orderBy: (goatMedia4, { asc: asc3 }) => [asc3(goatMedia4.order)]
            },
            documents: true
          }
        },
        puppies: {
          with: {
            media: {
              orderBy: (m, { asc: asc3 }) => [asc3(m.order)]
            }
          }
        }
      }
    });
    res.json(allGoatLitters);
  });
  app2.post("/api/goat-litters", async (req, res) => {
    try {
      console.log("Creating goat litter with data:", req.body);
      const formattedData = {
        ...req.body,
        dueDate: req.body.dueDate,
        isCurrentLitter: req.body.isCurrentLitter || false,
        isPastLitter: req.body.isPastLitter || false,
        isPlannedLitter: req.body.isPlannedLitter || false,
        expectedBreedingDate: req.body.expectedBreedingDate || null,
        expectedPickupDate: req.body.expectedPickupDate || null,
        waitlistLink: req.body.waitlistLink || null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Formatted data:", formattedData);
      const litter = await db.insert(goatLitters).values(formattedData).returning();
      const litterWithParents = await db.query.goatLitters.findFirst({
        where: eq2(goatLitters.id, litter[0].id),
        with: {
          mother: true,
          father: true
        }
      });
      res.json(litterWithParents);
    } catch (error) {
      console.error("Error creating goat litter:", error);
      res.status(500).json({ message: "Failed to create goat litter" });
    }
  });
  app2.put("/api/goat-litters/:id", async (req, res) => {
    try {
      console.log("Updating goat litter with data:", req.body);
      const { dueDate, motherId, fatherId, isVisible, isCurrentLitter, isPastLitter, isPlannedLitter, expectedBreedingDate, expectedPickupDate, waitlistLink } = req.body;
      const updateData = {
        dueDate,
        motherId,
        fatherId,
        isVisible,
        isCurrentLitter: isCurrentLitter || false,
        isPastLitter: isPastLitter || false,
        isPlannedLitter: isPlannedLitter || false,
        expectedBreedingDate: expectedBreedingDate || null,
        expectedPickupDate: expectedPickupDate || null,
        waitlistLink: waitlistLink || null,
        updatedAt: /* @__PURE__ */ new Date()
      };
      console.log("Formatted update data:", updateData);
      const litter = await db.update(goatLitters).set(updateData).where(eq2(goatLitters.id, parseInt(req.params.id))).returning();
      const litterWithParents = await db.query.goatLitters.findFirst({
        where: eq2(goatLitters.id, litter[0].id),
        with: {
          mother: true,
          father: true
        }
      });
      res.json(litterWithParents);
    } catch (error) {
      console.error("Error updating goat litter - Full error:", error);
      res.status(500).json({ message: "Failed to update goat litter", error: error.message });
    }
  });
  app2.delete("/api/goat-litters/:id", async (req, res) => {
    try {
      const litterId = parseInt(req.params.id);
      await db.delete(goatLitters).where(eq2(goatLitters.id, litterId));
      res.json({ message: "Goat litter deleted successfully" });
    } catch (error) {
      console.error("Error deleting goat litter:", error);
      res.status(500).json({ message: "Failed to delete goat litter" });
    }
  });
  app2.get("/api/gallery-photos", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const photos = await db.query.galleryPhotos.findMany({
        where: and2(eq2(galleryPhotos.siteId, siteId), eq2(galleryPhotos.isVisible, true)),
        orderBy: (galleryPhotos2, { asc: asc3 }) => [asc3(galleryPhotos2.order), asc3(galleryPhotos2.createdAt)]
      });
      res.json(photos);
    } catch (error) {
      console.error("Error fetching gallery photos:", error);
      res.status(500).json({ message: "Failed to fetch gallery photos" });
    }
  });
  app2.post("/api/gallery-photos", async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const siteId = getCurrentSiteId(req);
      const photo = await db.insert(galleryPhotos).values({
        ...req.body,
        siteId
      }).returning();
      res.json(photo[0]);
    } catch (error) {
      console.error("Error creating gallery photo:", error);
      res.status(500).json({ message: "Failed to create gallery photo" });
    }
  });
  app2.put("/api/gallery-photos/:id", async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const photo = await db.update(galleryPhotos).set({
        ...req.body,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(galleryPhotos.id, parseInt(req.params.id))).returning();
      res.json(photo[0]);
    } catch (error) {
      console.error("Error updating gallery photo:", error);
      res.status(500).json({ message: "Failed to update gallery photo" });
    }
  });
  app2.delete("/api/gallery-photos/:id", async (req, res) => {
    try {
      if (!req.session.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      await db.delete(galleryPhotos).where(eq2(galleryPhotos.id, parseInt(req.params.id)));
      res.json({ message: "Gallery photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery photo:", error);
      res.status(500).json({ message: "Failed to delete gallery photo" });
    }
  });
  async function syncPrintifyProducts() {
    try {
      const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
      const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
      if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
        console.error("Printify API credentials not configured");
        return;
      }
      console.log("Starting Printify product sync...");
      let actualShopId = PRINTIFY_SHOP_ID;
      if (!/^\d+$/.test(PRINTIFY_SHOP_ID)) {
        const shopsResponse = await fetch(
          "https://api.printify.com/v1/shops.json",
          {
            headers: {
              "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        if (shopsResponse.ok) {
          const shopsData = await shopsResponse.json();
          const targetShop = shopsData.find(
            (shop) => shop.title.toLowerCase().includes("little way acres") || shop.title.toLowerCase().includes("lwa")
          ) || shopsData[0];
          if (targetShop) {
            actualShopId = targetShop.id.toString();
          }
        }
      }
      let response = await fetch(
        `https://api.printify.com/v1/shops/${actualShopId}/products.json?published=true`,
        {
          headers: {
            "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        response = await fetch(
          `https://api.printify.com/v1/shops/${actualShopId}/products.json`,
          {
            headers: {
              "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
      }
      if (!response.ok) {
        throw new Error(`Printify API error: ${response.status}`);
      }
      const data = await response.json();
      const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, "").trim();
      };
      const now = /* @__PURE__ */ new Date();
      const productsToInsert = data.data.map((product) => {
        const variants = product.variants?.map((variant) => ({
          ...variant,
          price: variant.price / 100
        })) || [];
        const urlSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const productUrl = product.external?.id ? `https://little-way-acres.printify.me/product/${product.external.id}/${urlSlug}` : product.id ? `https://little-way-acres.printify.me/product/${product.id}/${urlSlug}` : `https://little-way-acres.printify.me/`;
        return {
          printifyId: product.id,
          title: product.title,
          description: stripHtml(product.description),
          tags: product.tags || [],
          images: product.images || [],
          variants,
          blueprintId: product.blueprint_id,
          externalId: product.external?.id || null,
          printifyUrl: productUrl,
          visible: product.visible,
          isLocked: product.is_locked,
          lastSyncedAt: now,
          updatedAt: now
        };
      });
      await db.delete(printifyProducts);
      if (productsToInsert.length > 0) {
        await db.insert(printifyProducts).values(productsToInsert);
      }
      await updateProductCache();
      console.log(`Synced ${productsToInsert.length} products from Printify`);
      return productsToInsert.length;
    } catch (error) {
      console.error("Error syncing Printify products:", error);
      throw error;
    }
  }
  async function updateProductCache() {
    try {
      const cachedProducts = await db.select().from(printifyProducts).orderBy(printifyProducts.title);
      productCache = cachedProducts.map((product) => ({
        id: product.printifyId,
        title: product.title,
        description: product.description,
        tags: product.tags,
        images: product.images,
        variants: product.variants,
        blueprintId: product.blueprintId,
        external_id: product.externalId,
        printifyUrl: product.printifyUrl,
        visible: product.visible,
        is_locked: product.isLocked,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      }));
      cacheLastUpdated = /* @__PURE__ */ new Date();
      console.log(`Updated in-memory cache with ${productCache.length} products`);
    } catch (error) {
      console.error("Error updating product cache:", error);
    }
  }
  function isCacheFresh() {
    if (!cacheLastUpdated || productCache.length === 0) return false;
    return Date.now() - cacheLastUpdated.getTime() < CACHE_DURATION_MS;
  }
  app2.get("/api/printify/products", async (req, res) => {
    try {
      res.set("Cache-Control", "public, max-age=300");
      if (isCacheFresh() && productCache.length > 0) {
        return res.json(productCache);
      }
      const dbProducts = await db.select({
        printifyId: printifyProducts.printifyId,
        title: printifyProducts.title,
        description: printifyProducts.description,
        tags: printifyProducts.tags,
        images: printifyProducts.images,
        variants: printifyProducts.variants,
        blueprintId: printifyProducts.blueprintId,
        externalId: printifyProducts.externalId,
        printifyUrl: printifyProducts.printifyUrl,
        visible: printifyProducts.visible,
        isLocked: printifyProducts.isLocked,
        createdAt: printifyProducts.createdAt,
        updatedAt: printifyProducts.updatedAt,
        lastSyncedAt: printifyProducts.lastSyncedAt
      }).from(printifyProducts).where(eq2(printifyProducts.visible, true)).orderBy(printifyProducts.title);
      if (dbProducts.length > 0) {
        const lastSync = dbProducts[0].lastSyncedAt;
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1e3 * 60 * 60);
        if (hoursSinceSync < 12) {
          productCache = dbProducts.map((product) => ({
            id: product.printifyId,
            title: product.title,
            description: product.description,
            tags: product.tags,
            images: product.images,
            variants: product.variants,
            blueprintId: product.blueprintId,
            external_id: product.externalId,
            printifyUrl: product.printifyUrl,
            visible: product.visible,
            is_locked: product.isLocked,
            created_at: product.createdAt,
            updated_at: product.updatedAt
          }));
          cacheLastUpdated = /* @__PURE__ */ new Date();
          return res.json(productCache);
        }
      }
      await syncPrintifyProducts();
      return res.json(productCache);
    } catch (error) {
      console.error("Error fetching Printify products:", error);
      res.status(500).json({
        message: "Failed to fetch Printify products",
        error: error.message
      });
    }
  });
  app2.post("/api/printify/sync", async (req, res) => {
    try {
      const count = await syncPrintifyProducts();
      res.json({
        message: "Printify products synced successfully",
        count
      });
    } catch (error) {
      console.error("Error syncing Printify products:", error);
      res.status(500).json({
        message: "Failed to sync Printify products",
        error: error.message
      });
    }
  });
  app2.get("/api/printify/products/direct", async (req, res) => {
    try {
      const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
      const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
      if (!PRINTIFY_API_TOKEN || !PRINTIFY_SHOP_ID) {
        return res.status(500).json({
          message: "Printify API credentials not configured"
        });
      }
      let actualShopId = PRINTIFY_SHOP_ID;
      if (!/^\d+$/.test(PRINTIFY_SHOP_ID)) {
        const shopsResponse = await fetch(
          "https://api.printify.com/v1/shops.json",
          {
            headers: {
              "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        if (shopsResponse.ok) {
          const shopsData = await shopsResponse.json();
          const targetShop = shopsData.find(
            (shop) => shop.title.toLowerCase().includes("little way acres") || shop.title.toLowerCase().includes("lwa")
          ) || shopsData[0];
          if (targetShop) {
            actualShopId = targetShop.id.toString();
          }
        }
      }
      console.log(`Attempting to fetch products for shop ID: ${actualShopId}`);
      let response = await fetch(
        `https://api.printify.com/v1/shops/${actualShopId}/products.json?published=true`,
        {
          headers: {
            "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        response = await fetch(
          `https://api.printify.com/v1/shops/${actualShopId}/products.json`,
          {
            headers: {
              "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
      }
      console.log(`Products API response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`API Error Response: ${errorText}`);
        throw new Error(`Printify API error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      console.log("=== PRINTIFY API RESPONSE SUMMARY ===");
      if (data.data && data.data.length > 0) {
        const firstProduct = data.data[0];
        console.log("Product ID:", firstProduct.id);
        console.log("Product external:", firstProduct.external);
        console.log("Product user_defined_id:", firstProduct.user_defined_id);
        console.log("Product shop_id:", firstProduct.shop_id);
      }
      console.log("=== END SUMMARY ===");
      const stripHtml = (html) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, "").trim();
      };
      const transformedProducts = data.data.map((product) => {
        const variants = product.variants?.map((variant) => ({
          ...variant,
          price: variant.price / 100
          // Convert cents to dollars
        })) || [];
        const urlSlug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const productUrl = product.external?.id ? `https://little-way-acres.printify.me/product/${product.external.id}/${urlSlug}` : product.id ? `https://little-way-acres.printify.me/product/${product.id}/${urlSlug}` : `https://little-way-acres.printify.me/`;
        return {
          id: product.id,
          title: product.title,
          description: stripHtml(product.description),
          tags: product.tags,
          images: product.images,
          created_at: product.created_at,
          updated_at: product.updated_at,
          visible: product.visible,
          is_locked: product.is_locked,
          external_id: product.external_id,
          blueprintId: product.blueprint_id,
          userDefinedId: product.user_defined_id,
          printifyUrl: productUrl,
          variants
        };
      });
      res.json(transformedProducts);
    } catch (error) {
      console.error("Error fetching Printify products:", error);
      res.status(500).json({
        message: "Failed to fetch Printify products",
        error: error.message
      });
    }
  });
  app2.get("/api/printify/shops", async (req, res) => {
    try {
      const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
      if (!PRINTIFY_API_TOKEN) {
        return res.status(500).json({
          message: "Printify API token not configured"
        });
      }
      const response = await fetch(
        "https://api.printify.com/v1/shops.json",
        {
          headers: {
            "Authorization": `Bearer ${PRINTIFY_API_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );
      console.log(`Shops API response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Shops API Error Response: ${errorText}`);
        throw new Error(`Printify Shops API error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`Found ${data.length} shops`);
      res.json(data);
    } catch (error) {
      console.error("Error fetching Printify shops:", error);
      res.status(500).json({
        message: "Failed to fetch Printify shops",
        error: error.message
      });
    }
  });
  setTimeout(async () => {
    try {
      const products2 = await db.select().from(printifyProducts);
      if (products2.length === 0) {
        console.log("No cached products found, performing initial sync...");
        await syncPrintifyProducts();
      } else {
        console.log("Initializing in-memory cache...");
        await updateProductCache();
      }
    } catch (error) {
      console.error("Error during initial sync:", error);
    }
  }, 5e3);
  setInterval(async () => {
    try {
      console.log("Performing scheduled Printify sync...");
      await syncPrintifyProducts();
    } catch (error) {
      console.error("Error during scheduled sync:", error);
    }
  }, 12 * 60 * 60 * 1e3);
  app2.get("/api/orders", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const environment = req.query.env;
      let allOrders = await db.query.orders.findMany({
        where: eq2(orders.siteId, siteId),
        with: {
          items: {
            with: {
              product: true
            }
          },
          pickupLocation: true
        },
        orderBy: (orders2, { desc: desc5 }) => desc5(orders2.createdAt)
      });
      if (environment === "test") {
        allOrders = allOrders.filter(
          (order) => order.stripePaymentIntentId?.includes("test") || order.stripePaymentIntentId?.startsWith("pi_test")
        );
      } else if (environment === "prod") {
        allOrders = allOrders.filter(
          (order) => !order.stripePaymentIntentId?.includes("test") && !order.stripePaymentIntentId?.startsWith("pi_test") && !order.stripePaymentIntentId?.includes("demo")
        );
      }
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/summary", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const environment = req.query.env;
      let allOrders = await db.query.orders.findMany({
        where: eq2(orders.siteId, siteId),
        with: {
          items: true,
          pickupLocation: true
        },
        orderBy: (orders2, { desc: desc5 }) => desc5(orders2.createdAt)
      });
      if (environment === "test") {
        allOrders = allOrders.filter(
          (order) => order.stripePaymentIntentId?.includes("test") || order.stripePaymentIntentId?.startsWith("pi_test")
        );
      } else if (environment === "prod") {
        allOrders = allOrders.filter(
          (order) => !order.stripePaymentIntentId?.includes("test") && !order.stripePaymentIntentId?.startsWith("pi_test") && !order.stripePaymentIntentId?.includes("demo")
        );
      }
      const summary = allOrders.reduce((acc, order) => {
        const pickupDate = order.pickupDate;
        const dateKey = pickupDate;
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: pickupDate,
            totalOrders: 0,
            totalRevenue: 0,
            orders: []
          };
        }
        acc[dateKey].totalOrders += 1;
        acc[dateKey].totalRevenue += parseFloat(order.totalAmount);
        acc[dateKey].orders.push(order);
        return acc;
      }, {});
      const summaryArray = Object.values(summary).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      res.json(summaryArray);
    } catch (error) {
      console.error("Error fetching orders summary:", error);
      res.status(500).json({ message: "Failed to fetch orders summary" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const {
        stripePaymentIntentId,
        customerName,
        customerEmail,
        customerPhone,
        pickupLocationId,
        pickupDate,
        totalAmount,
        cartItems
      } = req.body;
      const existingOrder = await db.query.orders.findFirst({
        where: eq2(orders.stripePaymentIntentId, stripePaymentIntentId)
      });
      if (existingOrder) {
        console.log(`Order already exists for payment intent ${stripePaymentIntentId}, returning existing order ID: ${existingOrder.id}`);
        return res.json({ success: true, orderId: existingOrder.id });
      }
      const newOrder = await db.insert(orders).values({
        siteId,
        stripePaymentIntentId,
        customerName,
        customerEmail,
        customerPhone,
        pickupLocationId,
        pickupDate,
        totalAmount,
        status: "confirmed"
      }).returning();
      const orderId = newOrder[0].id;
      for (const item of cartItems) {
        await db.insert(orderItems).values({
          siteId,
          orderId,
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price.replace("$", "")),
          totalPrice: parseFloat(item.price.replace("$", "")) * item.quantity
        });
      }
      console.log(`Successfully created new order ${orderId} for payment intent ${stripePaymentIntentId}`);
      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.use(sheep_default);
  app2.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /

Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`);
  });
  app2.get("/sitemap.xml", async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const staticPages = [
      "",
      "/dogs",
      "/dogs/breeding-goals",
      "/dogs/how-to-purchase",
      "/dogs/males",
      "/dogs/females",
      "/dogs/available",
      "/dogs/litters/current",
      "/dogs/litters/future",
      "/dogs/litters/past",
      "/goats",
      "/goats/males",
      "/goats/females",
      "/goats/available",
      "/goats/litters/current",
      "/goats/litters/upcoming",
      "/goats/litters/past",
      "/sheep",
      "/sheep/males",
      "/sheep/females",
      "/sheep/available",
      "/sheep/total-vegetation-management",
      "/sheep/litters/current",
      "/sheep/litters/upcoming",
      "/sheep/litters/past",
      "/bees",
      "/chickens",
      "/market",
      "/market/bakery",
      "/market/animal-products",
      "/market/apparel",
      "/gallery"
    ];
    try {
      const siteId = getCurrentSiteId(req);
      const allDogLitters = await db.query.litters.findMany({
        where: and2(eq2(litters.siteId, siteId), eq2(litters.isVisible, true))
      });
      const allDogs = await db.query.dogs.findMany({
        where: and2(eq2(dogs.siteId, siteId), eq2(dogs.display, true))
      });
      const allGoatLitters = await db.query.goatLitters.findMany({
        where: and2(eq2(goatLitters.siteId, siteId), eq2(goatLitters.isVisible, true))
      });
      const allGoats = await db.query.goats.findMany({
        where: and2(
          eq2(goats.siteId, siteId),
          eq2(goats.display, true),
          eq2(goats.outsideBreeder, false)
        )
      });
      const allSheepLitters = await db.query.sheepLitters.findMany({
        where: and2(eq2(sheepLitters.siteId, siteId), eq2(sheepLitters.isVisible, true))
      });
      const dynamicPages = [
        ...allDogLitters.map((litter) => `/dogs/litters/${litter.id}`),
        ...allDogs.map((dog) => `/dogs/${dog.id}`),
        ...allGoatLitters.map((litter) => `/goats/litters/${litter.id}`),
        ...allGoats.map((goat) => `/goats/${goat.id}`),
        ...allSheepLitters.map((litter) => `/sheep/litters/${litter.id}`)
      ];
      const allPages = [...staticPages, ...dynamicPages];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : page.includes("/breeding-goals") || page.includes("/how-to-purchase") ? "0.9" : "0.8"}</priority>
  </url>`).join("\n")}
</urlset>`;
      res.type("application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs5 from "fs";
import path5, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path4, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path4.resolve(__dirname, "db"),
      "@": path4.resolve(__dirname, "client", "src")
    }
  },
  root: path4.resolve(__dirname, "client"),
  build: {
    outDir: path4.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const siteUrl = `${protocol}://${host}`;
    const heroImagePath = "/path/to/hero.jpg";
    try {
      const clientTemplate = path5.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs5.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid2()}"`);
      const metaTags = `
        <meta property="og:url" content="${siteUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Little Way Acres" />
        <meta property="og:description" content="Description of Little Way Acres" />
        <meta property="og:image" content="${siteUrl}${heroImagePath}" />
      `;
      template = template.replace("<head>", "<head>" + metaTags);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path5.resolve(__dirname2, "public");
  if (!fs5.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path5.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv2 from "dotenv";
import compression from "compression";

// server/routes/proxy.ts
import express3 from "express";
import fetch2 from "node-fetch";
var router2 = express3.Router();
router2.get("/proxy-image", async (req, res) => {
  try {
    const { url } = req.query;
    console.log("[Image Proxy] Received request for URL:", url);
    if (!url || typeof url !== "string") {
      console.error("[Image Proxy] Missing or invalid URL parameter");
      return res.status(400).send("URL parameter is required");
    }
    if (url.includes("/api/proxy-image")) {
      console.error("[Image Proxy] Recursive proxy detected:", url);
      return res.status(400).send("Recursive proxy requests are not allowed");
    }
    console.log("[Image Proxy] Fetching image from:", url);
    const response = await fetch2(url);
    if (!response.ok) {
      console.error("[Image Proxy] Failed to fetch image:", response.statusText);
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    console.log("[Image Proxy] Image fetched successfully, content-type:", response.headers.get("content-type"));
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.set("Content-Type", contentType);
    }
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    response.body.pipe(res);
    response.body.on("end", () => {
      console.log("[Image Proxy] Image streaming completed");
    });
  } catch (error) {
    console.error("[Image Proxy] Error:", error);
    res.status(500).send("Failed to proxy image");
  }
});
var proxy_default = router2;

// server/routes/goats.ts
import express4 from "express";
import { eq as eq3, and as and3, desc as desc2 } from "drizzle-orm";
var router3 = express4.Router();
router3.get("/api/goats", async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";
    const whereCondition = isAdmin ? void 0 : and3(eq3(goats.display, true), eq3(goats.died, false));
    const allGoats = await db.query.goats.findMany({
      where: whereCondition,
      with: {
        media: true,
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    res.json(allGoats);
  } catch (error) {
    console.error("Error fetching goats:", error);
    res.status(500).json({
      error: "Failed to fetch goats",
      details: error.message || "Unknown error"
    });
  }
});
router3.get("/api/goats/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const isAdmin = req.query.admin === "true";
    const whereCondition = isAdmin ? eq3(goats.id, id) : and3(eq3(goats.id, id), eq3(goats.display, true), eq3(goats.died, false));
    const goat = await db.query.goats.findFirst({
      where: whereCondition,
      with: {
        media: true,
        documents: true,
        mother: true,
        father: true,
        litter: true
      }
    });
    if (!goat) {
      return res.status(404).json({ error: "Goat not found" });
    }
    res.json(goat);
  } catch (error) {
    console.error("Error fetching goat:", error);
    res.status(500).json({
      error: "Failed to fetch goat",
      details: error.message || "Unknown error"
    });
  }
});
router3.post("/api/goats", async (req, res) => {
  try {
    const data = req.body;
    console.log("Creating new goat with data:", JSON.stringify(data));
    const { media = [], documents = [], ...goatData } = data;
    const [goatResult] = await db.insert(goats).values(goatData).returning({ id: goats.id });
    const goatId = goatResult.id;
    if (media.length > 0) {
      const mediaValues = media.map((item, index) => ({
        goatId,
        url: item.url,
        type: item.type || "image",
        order: index
      }));
      await db.insert(goatMedia).values(mediaValues);
    }
    if (documents.length > 0) {
      const documentValues = documents.map((doc) => ({
        goatId,
        url: doc.url,
        type: doc.type || "health",
        name: doc.name || "Document",
        mimeType: doc.mimeType || "application/pdf"
      }));
      await db.insert(goatDocuments).values(documentValues);
    }
    const createdGoat = await db.query.goats.findFirst({
      where: eq3(goats.id, goatId),
      with: {
        media: true,
        documents: true
      }
    });
    res.status(201).json(createdGoat);
  } catch (error) {
    console.error("Error creating goat:", error);
    res.status(500).json({
      error: "Failed to create goat",
      details: error.message || "Unknown error"
    });
  }
});
router3.put("/api/goats/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    console.log("Updating goat with ID:", id);
    console.log("Request body:", JSON.stringify(data));
    const { media = [], documents = [], ...goatData } = data;
    const processedData = {};
    for (const [key, value] of Object.entries(goatData)) {
      if (key === "price" || key === "bucklingPrice" || key === "wetherPrice") {
        if (value === "" || value === null || value === void 0) {
          processedData[key] = null;
        } else {
          processedData[key] = value;
        }
      } else if (key === "display") {
        console.log("Goat display field - original value:", value);
        const displayValue = value === true;
        console.log("Goat display field - processed value with strict comparison:", displayValue);
        processedData[key] = displayValue;
      } else if (key === "sold" || key === "available" || key === "kid" || key === "outsideBreeder" || key === "died") {
        console.log(`Goat ${key} field - original value:`, value);
        const boolValue = value === true;
        console.log(`Goat ${key} field - processed value with strict comparison:`, boolValue);
        processedData[key] = boolValue;
      } else {
        processedData[key] = value;
      }
    }
    await db.transaction(async (tx) => {
      await tx.update(goats).set(processedData).where(eq3(goats.id, id));
      await tx.delete(goatMedia).where(eq3(goatMedia.goatId, id));
      if (media.length > 0) {
        const mediaValues = media.map((item, index) => ({
          goatId: id,
          url: item.url,
          type: item.type || "image",
          order: index
        }));
        await tx.insert(goatMedia).values(mediaValues);
      }
      await tx.delete(goatDocuments).where(eq3(goatDocuments.goatId, id));
      if (documents.length > 0) {
        const documentValues = documents.map((doc) => ({
          goatId: id,
          url: doc.url,
          type: doc.type || "health",
          name: doc.name || "Document",
          mimeType: doc.mimeType || "application/pdf"
        }));
        await tx.insert(goatDocuments).values(documentValues);
      }
    });
    const updatedGoat = await db.query.goats.findFirst({
      where: eq3(goats.id, id),
      with: {
        media: true,
        documents: true
      }
    });
    res.json(updatedGoat);
  } catch (error) {
    console.error("Error updating goat:", error);
    res.status(500).json({
      error: "Failed to update goat",
      details: error.message || "Unknown error"
    });
  }
});
router3.delete("/api/goats/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.transaction(async (tx) => {
      await tx.delete(goatMedia).where(eq3(goatMedia.goatId, id));
      await tx.delete(goatDocuments).where(eq3(goatDocuments.goatId, id));
      await tx.delete(goats).where(eq3(goats.id, id));
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting goat:", error);
    res.status(500).json({
      error: "Failed to delete goat",
      details: error.message || "Unknown error"
    });
  }
});
router3.get("/api/goats/:id/media", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const media = await db.query.goatMedia.findMany({
      where: eq3(goatMedia.goatId, id),
      orderBy: [desc2(goatMedia.order)]
    });
    res.json(media);
  } catch (error) {
    console.error("Error fetching goat media:", error);
    res.status(500).json({
      error: "Failed to fetch goat media",
      details: error.message || "Unknown error"
    });
  }
});
router3.get("/api/goats/:id/documents", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const documents = await db.query.goatDocuments.findMany({
      where: eq3(goatDocuments.goatId, id)
    });
    res.json(documents);
  } catch (error) {
    console.error("Error fetching goat documents:", error);
    res.status(500).json({
      error: "Failed to fetch goat documents",
      details: error.message || "Unknown error"
    });
  }
});
var goats_default = router3;

// server/routes/goat-litters.ts
import express5 from "express";
import { eq as eq4, and as and4 } from "drizzle-orm";
var router4 = express5.Router();
router4.get("/api/goat-litters/list/current", async (req, res) => {
  try {
    const allLitters = await db.query.goatLitters.findMany({
      where: and4(
        eq4(goatLitters.isVisible, true),
        eq4(goatLitters.isCurrentLitter, true)
      ),
      orderBy: (goatLitters3, { desc: desc5 }) => [desc5(goatLitters3.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithKids = await Promise.all(allLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: and4(
          eq4(goats.litterId, litter.id),
          eq4(goats.died, false)
        ),
        with: {
          media: true
        }
      });
      return {
        ...litter,
        kids: kids || []
      };
    }));
    res.json(littersWithKids);
  } catch (error) {
    console.error("Error fetching current goat litters:", error);
    res.status(500).json({
      error: "Failed to fetch current goat litters",
      details: error.message || "Unknown error"
    });
  }
});
router4.get("/api/goat-litters/list/past", async (req, res) => {
  try {
    const pastLitters = await db.query.goatLitters.findMany({
      where: and4(
        eq4(goatLitters.isVisible, true),
        eq4(goatLitters.isPastLitter, true)
      ),
      orderBy: (goatLitters3, { desc: desc5 }) => [desc5(goatLitters3.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithKids = await Promise.all(pastLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: and4(
          eq4(goats.litterId, litter.id),
          eq4(goats.died, false)
        ),
        with: {
          media: true
        }
      });
      return {
        ...litter,
        kids
      };
    }));
    res.json(littersWithKids);
  } catch (error) {
    console.error("Error fetching past goat litters:", error);
    res.status(500).json({
      error: "Failed to fetch past goat litters",
      details: error.message || "Unknown error"
    });
  }
});
router4.get("/api/goat-litters", async (req, res) => {
  try {
    const allLitters = await db.query.goatLitters.findMany({
      orderBy: (goatLitters3, { desc: desc5 }) => [desc5(goatLitters3.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithKids = await Promise.all(allLitters.map(async (litter) => {
      const kids = await db.query.goats.findMany({
        where: and4(
          eq4(goats.litterId, litter.id),
          eq4(goats.died, false)
        ),
        with: {
          media: true,
          documents: true
        }
      });
      return {
        ...litter,
        kids
      };
    }));
    res.json(littersWithKids);
  } catch (error) {
    console.error("Error fetching goat litters:", error);
    res.status(500).json({
      error: "Failed to fetch goat litters",
      details: error.message || "Unknown error"
    });
  }
});
router4.post("/api/goat-litters", async (req, res) => {
  try {
    const data = req.body;
    console.log("Creating new goat litter with data:", JSON.stringify(data));
    const [litterResult] = await db.insert(goatLitters).values({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible ?? true,
      isCurrentLitter: data.isCurrentLitter ?? false,
      isPastLitter: data.isPastLitter ?? false,
      isPlannedLitter: data.isPlannedLitter ?? false,
      expectedBreedingDate: data.expectedBreedingDate || null,
      expectedPickupDate: data.expectedPickupDate || null
    }).returning({ id: goatLitters.id });
    const litterId = litterResult.id;
    const createdLitter = await db.query.goatLitters.findFirst({
      where: eq4(goatLitters.id, litterId),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    res.status(201).json(createdLitter);
  } catch (error) {
    console.error("Error creating goat litter:", error);
    res.status(500).json({
      error: "Failed to create goat litter",
      details: error.message || "Unknown error"
    });
  }
});
router4.get("/api/goat-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const litter = await db.query.goatLitters.findFirst({
      where: eq4(goatLitters.id, id),
      with: {
        mother: {
          with: {
            media: true,
            documents: true
          }
        },
        father: {
          with: {
            media: true,
            documents: true
          }
        }
      }
    });
    if (!litter) {
      return res.status(404).json({ error: "Goat litter not found" });
    }
    const kids = await db.query.goats.findMany({
      where: and4(
        eq4(goats.litterId, id),
        eq4(goats.died, false)
      ),
      with: {
        media: true,
        documents: true
      }
    });
    res.json({
      ...litter,
      kids
    });
  } catch (error) {
    console.error("Error fetching goat litter:", error);
    res.status(500).json({
      error: "Failed to fetch goat litter",
      details: error.message || "Unknown error"
    });
  }
});
router4.put("/api/goat-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    console.log("Updating goat litter with ID:", id);
    console.log("Request body:", JSON.stringify(data));
    await db.update(goatLitters).set({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible,
      isCurrentLitter: data.isCurrentLitter,
      isPastLitter: data.isPastLitter,
      isPlannedLitter: data.isPlannedLitter,
      expectedBreedingDate: data.expectedBreedingDate || null,
      expectedPickupDate: data.expectedPickupDate || null
    }).where(eq4(goatLitters.id, id));
    const updatedLitter = await db.query.goatLitters.findFirst({
      where: eq4(goatLitters.id, id),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const kids = await db.query.goats.findMany({
      where: eq4(goats.litterId, id),
      with: {
        media: true
      }
    });
    res.json({
      ...updatedLitter,
      kids
    });
  } catch (error) {
    console.error("Error updating goat litter:", error);
    res.status(500).json({
      error: "Failed to update goat litter",
      details: error.message || "Unknown error"
    });
  }
});
router4.delete("/api/goat-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const kids = await db.query.goats.findMany({
      where: eq4(goats.litterId, id)
    });
    await db.transaction(async (tx) => {
      for (const kid of kids) {
        await tx.update(goats).set({ litterId: null }).where(eq4(goats.id, kid.id));
      }
      await tx.delete(goatLitters).where(eq4(goatLitters.id, id));
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting goat litter:", error);
    res.status(500).json({
      error: "Failed to delete goat litter",
      details: error.message || "Unknown error"
    });
  }
});
var goat_litters_default = router4;

// server/routes/sheep-litters.ts
import { Router as Router2 } from "express";
import { eq as eq5, desc as desc4, and as and5 } from "drizzle-orm";
var router5 = Router2();
router5.get("/api/sheep-litters/list/current", async (req, res) => {
  try {
    const allLitters = await db2.query.sheepLitters.findMany({
      where: and5(
        eq5(sheepLitters.isVisible, true),
        eq5(sheepLitters.isCurrentLitter, true)
      ),
      orderBy: [desc4(sheepLitters.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithLambs = await Promise.all(allLitters.map(async (litter) => {
      const lambs = await db2.query.sheep.findMany({
        where: and5(
          eq5(sheep.litterId, litter.id),
          eq5(sheep.died, false)
        ),
        with: {
          media: true
        }
      });
      return {
        ...litter,
        lambs: lambs || []
      };
    }));
    res.json(littersWithLambs);
  } catch (error) {
    console.error("Error fetching current sheep litters:", error);
    res.status(500).json({
      error: "Failed to fetch current sheep litters",
      details: error.message || "Unknown error"
    });
  }
});
router5.get("/api/sheep-litters/list/past", async (req, res) => {
  try {
    const pastLitters = await db2.query.sheepLitters.findMany({
      where: and5(
        eq5(sheepLitters.isVisible, true),
        eq5(sheepLitters.isPastLitter, true)
      ),
      orderBy: [desc4(sheepLitters.dueDate)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithLambs = await Promise.all(pastLitters.map(async (litter) => {
      const lambs = await db2.query.sheep.findMany({
        where: and5(
          eq5(sheep.litterId, litter.id),
          eq5(sheep.died, false)
        ),
        with: {
          media: true
        }
      });
      return {
        ...litter,
        lambs
      };
    }));
    res.json(littersWithLambs);
  } catch (error) {
    console.error("Error fetching past sheep litters:", error);
    res.status(500).json({
      error: "Failed to fetch past sheep litters",
      details: error.message || "Unknown error"
    });
  }
});
router5.get("/api/sheep-litters", async (req, res) => {
  try {
    const result = await db2.query.sheepLitters.findMany({
      orderBy: [desc4(sheepLitters.createdAt)],
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const littersWithLambs = await Promise.all(
      result.map(async (litter) => {
        const lambs = await db2.query.sheep.findMany({
          where: eq5(sheep.litterId, litter.id),
          with: {
            media: true
          }
        });
        return {
          ...litter,
          lambs
        };
      })
    );
    res.json(littersWithLambs);
  } catch (error) {
    console.error("Error fetching sheep litters:", error);
    res.status(500).json({ error: error.message });
  }
});
router5.get("/api/sheep-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db2.query.sheepLitters.findFirst({
      where: eq5(sheepLitters.id, id),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    if (!result) {
      return res.status(404).json({ error: "Sheep litter not found" });
    }
    const lambs = await db2.query.sheep.findMany({
      where: eq5(sheep.litterId, id),
      with: {
        media: true
      }
    });
    res.json({
      ...result,
      lambs
    });
  } catch (error) {
    console.error("Error fetching sheep litter by ID:", error);
    res.status(500).json({ error: error.message });
  }
});
router5.post("/api/sheep-litters", async (req, res) => {
  try {
    const data = req.body;
    console.log("Creating sheep litter with data:", JSON.stringify(data));
    const result = await db2.insert(sheepLitters).values({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible,
      isCurrentLitter: data.isCurrentLitter,
      isPastLitter: data.isPastLitter,
      isPlannedLitter: data.isPlannedLitter,
      expectedBreedingDate: data.expectedBreedingDate || null,
      expectedPickupDate: data.expectedPickupDate || null,
      waitlistLink: data.waitlistLink || null
    }).returning();
    const createdLitter = await db2.query.sheepLitters.findFirst({
      where: eq5(sheepLitters.id, result[0].id),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const lambs = await db2.query.sheep.findMany({
      where: eq5(sheep.litterId, result[0].id),
      with: {
        media: true
      }
    });
    res.json({
      ...createdLitter,
      lambs
    });
  } catch (error) {
    console.error("Error creating sheep litter:", error);
    res.status(500).json({ error: error.message });
  }
});
router5.put("/api/sheep-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    console.log("Updating sheep litter with ID:", id);
    console.log("Request body:", JSON.stringify(data));
    await db2.update(sheepLitters).set({
      motherId: data.motherId,
      fatherId: data.fatherId,
      dueDate: data.dueDate,
      isVisible: data.isVisible,
      isCurrentLitter: data.isCurrentLitter,
      isPastLitter: data.isPastLitter,
      isPlannedLitter: data.isPlannedLitter,
      expectedBreedingDate: data.expectedBreedingDate || null,
      expectedPickupDate: data.expectedPickupDate || null,
      waitlistLink: data.waitlistLink || null
    }).where(eq5(sheepLitters.id, id));
    const updatedLitter = await db2.query.sheepLitters.findFirst({
      where: eq5(sheepLitters.id, id),
      with: {
        mother: {
          with: {
            media: true
          }
        },
        father: {
          with: {
            media: true
          }
        }
      }
    });
    const lambs = await db2.query.sheep.findMany({
      where: eq5(sheep.litterId, id),
      with: {
        media: true
      }
    });
    res.json({
      ...updatedLitter,
      lambs
    });
  } catch (error) {
    console.error("Error updating sheep litter:", error);
    res.status(500).json({ error: error.message });
  }
});
router5.delete("/api/sheep-litters/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const associatedSheep = await db2.query.sheep.findMany({
      where: eq5(sheep.litterId, id)
    });
    if (associatedSheep.length > 0) {
      return res.status(400).json({
        error: "Cannot delete litter with associated sheep. Please remove or reassign the sheep first."
      });
    }
    await db2.delete(sheepLitters).where(eq5(sheepLitters.id, id));
    res.json({ message: "Sheep litter deleted successfully" });
  } catch (error) {
    console.error("Error deleting sheep litter:", error);
    res.status(500).json({ error: error.message });
  }
});
var sheep_litters_default = router5;

// server/middleware/db-error-handler.ts
var DB_CONNECTION_ERROR_PATTERNS = [
  "connection reset",
  "socket hang up",
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "Connection terminated",
  "Failed to fetch",
  "Control plane request failed",
  "could not connect to server",
  "connection refused"
];
var dbErrorHandler = (err, req, res, next) => {
  if (isDatabaseConnectionError(err)) {
    console.warn("Database connection error detected, returning friendly response", {
      url: req.url,
      method: req.method,
      errorMessage: err.message
    });
    return res.status(503).json({
      error: "Database service temporarily unavailable",
      message: "We are experiencing temporary technical issues. Please try again in a moment.",
      retryable: true
    });
  }
  next(err);
};
function isDatabaseConnectionError(err) {
  if (!err) return false;
  const errorMessage = err.message || err.toString();
  return DB_CONNECTION_ERROR_PATTERNS.some(
    (pattern) => errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

// server/index.ts
dotenv2.config();
function validateEnvironment() {
  const requiredAwsVars = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_BUCKET_NAME"];
  const missingAwsVars = requiredAwsVars.filter((varName) => !process.env[varName]);
  if (missingAwsVars.length > 0) {
    console.warn(`\u26A0\uFE0F WARNING: Missing AWS variables: ${missingAwsVars.join(", ")}`);
    console.warn("S3 file uploads will not work until these are set in Replit Secrets.");
  } else {
    console.log("\u2705 Environment validation: All required S3 credentials found.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Ensure this is set in your Replit Secrets for deployment.");
  } else {
    console.log("\u2705 Environment validation: Database URL found.");
  }
}
validateEnvironment();
console.log("============ ENVIRONMENT CHECK ============");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("AWS_REGION:", process.env.AWS_REGION || "Not set");
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...)` : "Not set");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Set (length: " + process.env.AWS_SECRET_ACCESS_KEY.length + ")" : "Not set");
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || "Not set");
console.log("==========================================");
var app = express6();
app.use(compression({
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  // Only compress responses > 1KB
  level: 6,
  // Compression level (1-9, 6 is good balance)
  memLevel: 8
}));
app.set("trust proxy", true);
app.use((req, res, next) => {
  const host = req.get("host");
  if (host && host.startsWith("www.")) {
    const nonWwwHost = host.slice(4);
    const protocol = req.header("x-forwarded-proto") || "https";
    return res.redirect(301, `${protocol}://${nonWwwHost}${req.originalUrl}`);
  }
  next();
});
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
  });
  next();
});
app.use((req, res, next) => {
  const url = req.url;
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Expires", new Date(Date.now() + 31536e6).toUTCString());
  } else if (url.match(/\.(css|js)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592e6).toUTCString());
  } else if (!url.startsWith("/api") && url.match(/\.(html|json|xml|txt)$/i)) {
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Expires", new Date(Date.now() + 36e5).toUTCString());
  }
  next();
});
app.use(express6.json({ limit: "50mb" }));
app.use(express6.urlencoded({ extended: false, limit: "50mb" }));
app.use("/api", proxy_default);
app.use(goats_default);
app.use(goat_litters_default);
app.use(sheep_default);
app.use(sheep_litters_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path6 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path6.startsWith("/api")) {
      let logLine = `${req.method} ${path6} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = registerRoutes(app);
  app.use(dbErrorHandler);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server error:", err);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const PORT = 5e3;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();
