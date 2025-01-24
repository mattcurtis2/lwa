import { pgTable, text, serial, integer, timestamp, date, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(), // "image" or "text"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carouselItems = pgTable("carousel_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "dog" or "goat"
  breed: text("breed"),
  age: integer("age"),
  description: text("description"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "bread", "pastry", "vegetable"
  description: text("description"),
  price: text("price"),
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogsHero = pgTable("dogs_hero", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogMedia = pgTable("dog_media", {
  id: serial("id").primaryKey(),
  dogId: integer("dog_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dogs = pgTable("dogs", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogDocuments = pgTable("dog_documents", {
  id: serial("id").primaryKey(),
  dogId: integer("dog_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'health' or 'pedigree'
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const animalRelations = relations(animals, ({ one }) => ({
  user: one(users, {
    fields: [animals.id],
    references: [users.id],
  }),
}));

export const productRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.id],
    references: [users.id],
  }),
}));

export const dogRelations = relations(dogs, ({ many, one }) => ({
  media: many(dogMedia),
  documents: many(dogDocuments),
  mother: one(dogs, {
    fields: [dogs.motherId],
    references: [dogs.id],
  }),
  father: one(dogs, {
    fields: [dogs.fatherId],
    references: [dogs.id],
  }),
  litter: one(litters, {
    fields: [dogs.litterId],
    references: [litters.id],
  }),
  motherOf: many(dogs, { relationName: "mother" }),
  fatherOf: many(dogs, { relationName: "father" }),
}));

export const dogMediaRelations = relations(dogMedia, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogMedia.dogId],
    references: [dogs.id],
  }),
}));

export const litters = pgTable("litters", {
  id: serial("id").primaryKey(),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const litterRelations = relations(litters, ({ one }) => ({
  mother: one(dogs, {
    fields: [litters.motherId],
    references: [dogs.id],
  }),
  father: one(dogs, {
    fields: [litters.fatherId],
    references: [dogs.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertCarouselItemSchema = createInsertSchema(carouselItems);
export const selectCarouselItemSchema = createSelectSchema(carouselItems);
export const insertAnimalSchema = createInsertSchema(animals);
export const selectAnimalSchema = createSelectSchema(animals);
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertSiteContentSchema = createInsertSchema(siteContent);
export const selectSiteContentSchema = createSelectSchema(siteContent);
export const insertDogsHeroSchema = createInsertSchema(dogsHero);
export const selectDogsHeroSchema = createSelectSchema(dogsHero);
export const insertDogSchema = createInsertSchema(dogs);
export const selectDogSchema = createSelectSchema(dogs);
export const insertDogMediaSchema = createInsertSchema(dogMedia);
export const selectDogMediaSchema = createSelectSchema(dogMedia);

export const dogDocumentsRelations = relations(dogDocuments, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogDocuments.dogId],
    references: [dogs.id],
  }),
}));

export const insertDogDocumentSchema = createInsertSchema(dogDocuments);
export const selectDogDocumentSchema = createSelectSchema(dogDocuments);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CarouselItem = typeof carouselItems.$inferSelect;
export type NewCarouselItem = typeof carouselItems.$inferInsert;
export type Animal = typeof animals.$inferSelect;
export type NewAnimal = typeof animals.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type SiteContent = typeof siteContent.$inferSelect;
export type NewSiteContent = typeof siteContent.$inferInsert;
export type DogsHero = typeof dogsHero.$inferSelect;
export type NewDogsHero = typeof dogsHero.$inferInsert;
export type Dog = typeof dogs.$inferSelect;
export type NewDog = typeof dogs.$inferInsert;
export type DogMedia = typeof dogMedia.$inferSelect;
export type NewDogMedia = typeof dogMedia.$inferInsert;
export type Litter = typeof litters.$inferSelect;
export type NewLitter = typeof litters.$inferInsert;
export const insertLitterSchema = createInsertSchema(litters);
export const selectLitterSchema = createSelectSchema(litters);
export type DogDocument = typeof dogDocuments.$inferSelect;
export type NewDogDocument = typeof dogDocuments.$inferInsert;

export const principles = pgTable("principles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const principleRelations = relations(principles, ({ }) => ({
  // No relations for now, but defining empty relations object to satisfy type requirements
}));

export const insertPrincipleSchema = createInsertSchema(principles);
export const selectPrincipleSchema = createSelectSchema(principles);
export type Principle = typeof principles.$inferSelect;
export type NewPrinciple = typeof principles.$inferInsert;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  siteTitle: text("site_title").notNull(),
  siteDescription: text("site_description"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteSettingsRelations = relations(siteSettings, ({ }) => ({
  // No relations for now
}));

export const insertSiteSettingsSchema = createInsertSchema(siteSettings);
export const selectSiteSettingsSchema = createSelectSchema(siteSettings);
export type SiteSettings = typeof siteSettings.$inferSelect;
export type NewSiteSettings = typeof siteSettings.$inferInsert;

export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  email: text("email"),
  phone: text("phone"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContactInfoSchema = createInsertSchema(contactInfo);
export const selectContactInfoSchema = createSelectSchema(contactInfo);
export type ContactInfo = typeof contactInfo.$inferSelect;
export type NewContactInfo = typeof contactInfo.$inferInsert;