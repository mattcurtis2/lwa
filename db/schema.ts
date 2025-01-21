import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
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

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertAnimalSchema = createInsertSchema(animals);
export const selectAnimalSchema = createSelectSchema(animals);
export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Animal = typeof animals.$inferSelect;
export type NewAnimal = typeof animals.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
