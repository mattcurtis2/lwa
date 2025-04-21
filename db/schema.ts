import { pgTable, text, serial, integer, timestamp, date, jsonb, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, type InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  domain: text("domain"),
  name: text("name"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const siteContent = pgTable("site_content", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  key: text("key").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(), // "image" or "text"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carouselItems = pgTable("carousel_items", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
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
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(),
  section: text("section").notNull(), // "bakery", "market_garden", "animal_products"
  category: text("category").notNull(),
  description: text("description"),
  price: text("price"),
  unit: text("unit"), // e.g., "loaf", "dozen", "lb"
  imageUrl: text("image_url"),
  inStock: boolean("in_stock").default(true),
  seasonal: boolean("seasonal").default(false),
  availableFrom: date("available_from"),
  availableTo: date("available_to"),
  ingredients: text("ingredients"),
  nutritionInfo: text("nutrition_info"),
  allergens: text("allergens"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogsHero = pgTable("dogs_hero", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogMedia = pgTable("dog_media", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dogId: integer("dog_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dogs = pgTable("dogs", {
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dogDocuments = pgTable("dog_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
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
  section: one(marketSections, {
    fields: [products.section],
    references: [marketSections.name],
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
  siteId: integer("site_id").references(() => sites.id).default(1),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  isCurrentLitter: boolean("is_current_litter").default(false),
  isPastLitter: boolean("is_past_litter").default(false),
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

export const insertSiteSchema = createInsertSchema(sites);
export const selectSiteSchema = createSelectSchema(sites);
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
  siteId: integer("site_id").references(() => sites.id).default(1),
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

export const contactInfo = pgTable("contact_info", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
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

export const goats = pgTable("goats", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goatMedia = pgTable("goat_media", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  goatId: integer("goat_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // "image" or "video"
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goatDocuments = pgTable("goat_documents", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  goatId: integer("goat_id").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'health' or 'pedigree'
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goatLitters = pgTable("goat_litters", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  dueDate: date("due_date").notNull(),
  motherId: integer("mother_id").notNull(),
  fatherId: integer("father_id").notNull(),
  isVisible: boolean("is_visible").default(true),
  isCurrentLitter: boolean("is_current_litter").default(false),
  isPastLitter: boolean("is_past_litter").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goatRelations = relations(goats, ({ many, one }) => ({
  media: many(goatMedia),
  documents: many(goatDocuments),
  mother: one(goats, {
    fields: [goats.motherId],
    references: [goats.id],
  }),
  father: one(goats, {
    fields: [goats.fatherId],
    references: [goats.id],
  }),
  litter: one(goatLitters, {
    fields: [goats.litterId],
    references: [goatLitters.id],
  }),
  motherOf: many(goats, { relationName: "mother" }),
  fatherOf: many(goats, { relationName: "father" }),
}));

export const goatMediaRelations = relations(goatMedia, ({ one }) => ({
  goat: one(goats, {
    fields: [goatMedia.goatId],
    references: [goats.id],
  }),
}));

export const goatLitterRelations = relations(goatLitters, ({ one, many }) => ({
  mother: one(goats, {
    fields: [goatLitters.motherId],
    references: [goats.id],
  }),
  father: one(goats, {
    fields: [goatLitters.fatherId],
    references: [goats.id],
  }),
  puppies: many(goats, {
    fields: [goatLitters.id],
    references: [goats.litterId],
  }),
}));

export const goatDocumentsRelations = relations(goatDocuments, ({ one }) => ({
  goat: one(goats, {
    fields: [goatDocuments.goatId],
    references: [goats.id],
  }),
}));

export const insertGoatSchema = createInsertSchema(goats);
export const selectGoatSchema = createSelectSchema(goats);
export const insertGoatMediaSchema = createInsertSchema(goatMedia);
export const selectGoatMediaSchema = createSelectSchema(goatMedia);
export const insertGoatDocumentSchema = createInsertSchema(goatDocuments);
export const selectGoatDocumentSchema = createSelectSchema(goatDocuments);
export const insertGoatLitterSchema = createInsertSchema(goatLitters);
export const selectGoatLitterSchema = createSelectSchema(goatLitters);

export type GoatWithRelations = InferSelectModel<typeof goats> & {
  media?: GoatMedia[];
  documents?: GoatDocument[];
  mother?: GoatWithRelations | null;
  father?: GoatWithRelations | null;
  litter?: GoatLitterWithRelations | null;
};

export type GoatLitterWithRelations = InferSelectModel<typeof goatLitters> & {
  mother?: GoatWithRelations;
  father?: GoatWithRelations;
  puppies?: GoatWithRelations[];
};


export type Goat = GoatWithRelations;
export type NewGoat = typeof goats.$inferInsert;
export type GoatMedia = typeof goatMedia.$inferSelect;
export type NewGoatMedia = typeof goatMedia.$inferInsert;
export type GoatDocument = typeof goatDocuments.$inferSelect;
export type NewGoatDocument = typeof goatDocuments.$inferInsert;
export type GoatLitter = GoatLitterWithRelations;
export type NewGoatLitter = typeof goatLitters.$inferInsert;

export const marketSections = pgTable("market_sections", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  name: text("name").notNull(), // "about", "bakery", "market_garden", "animal_products"
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketSectionsRelations = relations(marketSections, ({ many }) => ({
  products: many(products),
}));

export const insertMarketSectionSchema = createInsertSchema(marketSections);
export const selectMarketSectionSchema = createSelectSchema(marketSections);

export type MarketSection = typeof marketSections.$inferSelect;
export type NewMarketSection = typeof marketSections.$inferInsert;

export const marketSchedules = pgTable("market_schedules", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketSchedulesRelations = relations(marketSchedules, ({}) => ({}));

export const insertMarketScheduleSchema = createInsertSchema(marketSchedules);
export const selectMarketScheduleSchema = createSelectSchema(marketSchedules);

export type MarketSchedule = typeof marketSchedules.$inferSelect;
export type NewMarketSchedule = typeof marketSchedules.$inferInsert;

export const litter_interest_signups = pgTable("litter_interest_signups", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").references(() => sites.id).default(1),
  litterId: integer("litter_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});