import { pgTable, text, serial, integer, timestamp, date, jsonb, boolean } from "drizzle-orm/pg-core";
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
  breed: text("breed").notNull(),
  gender: text("gender").notNull(),  // Add gender field
  birthDate: date("birth_date").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const dogRelations = relations(dogs, ({ many }) => ({
  media: many(dogMedia),
}));

export const dogMediaRelations = relations(dogMedia, ({ one }) => ({
  dog: one(dogs, {
    fields: [dogMedia.dogId],
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