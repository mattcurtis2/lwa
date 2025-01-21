import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { animals, products, users, siteContent } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export function registerRoutes(app: Express): Server {
  const SessionStore = MemoryStore(session);

  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: "farm-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

  // Initialize admin user and site content
  (async () => {
    const adminUser = await db.query.users.findFirst({
      where: eq(users.username, "admin"),
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash(
        process.env.NODE_ENV === 'production' ? process.env.ADMIN_PASSWORD || 'AustenAlcott' : 'AustenAlcott',
        10
      );
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
      });
    }

    const defaultContent = [
      { key: "logo", value: "/images/logo.png", type: "image" },
      { key: "hero_background", value: "https://images.unsplash.com/photo-1611501807352-03324d70054c", type: "image" },
      { key: "hero_text", value: "Welcome to Little Way Acres", type: "text" },
      { key: "hero_subtext", value: "Experience the charm of sustainable farming, meet our beloved animals, and enjoy fresh, locally grown produce at our farmers market.", type: "text" },
      { key: "about_title", value: "About Our Farm", type: "text" },
      { key: "mission_text", value: "Dedicated to sustainable farming practices and providing the highest quality produce and animal products to our local community.", type: "text" },
      { key: "animals_title", value: "Card 1 Title", type: "text" },
      { key: "animals_text", value: "Our Colorado Mountain Dogs are exceptional working dogs bred for livestock protection. Known for their gentle nature with family and fierce loyalty in guarding, these magnificent animals combine the best traits of various mountain dog breeds. Each puppy is raised with hands-on care and early socialization to ensure they develop into well-rounded guardians.", type: "text" },
      { key: "bakery_title", value: "Card 2 Title", type: "text" },
      { key: "bakery_text", value: "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production. Perfect for small homesteads, they're easy to handle and maintain. Our goats are registered, health-tested, and raised with love to ensure they make wonderful additions to your family or farming operation.", type: "text" },
      { key: "products_title", value: "Card 3 Title", type: "text" },
      { key: "products_text", value: "Visit our Farmers Market for a delightful selection of homemade and farm-fresh goods. Savor our artisanal sourdough bread and buttery croissants, baked fresh daily. Enjoy our seasonal mixed salad greens, farm-fresh eggs, pasture-raised chicken, and pure local honey. Every product reflects our commitment to quality and sustainable farming practices.", type: "text" },
    ];

    for (const content of defaultContent) {
      const exists = await db.query.siteContent.findFirst({
        where: eq(siteContent.key, content.key),
      });

      if (!exists) {
        await db.insert(siteContent).values(content);
      }
    }
  })();

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ message: "Logged in successfully" });
  });

  app.get("/api/auth/check-session", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ authenticated: true });
  });

  // Site content routes
  app.get("/api/site-content", async (req, res) => {
    const content = await db.query.siteContent.findMany();
    res.json(content);
  });

  app.put("/api/site-content/:key", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });

    const { value } = req.body;
    const content = await db.update(siteContent)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteContent.key, req.params.key))
      .returning();

    res.json(content[0]);
  });

  // Animals routes
  app.get("/api/animals", async (req, res) => {
    const type = req.query.type as string;
    const allAnimals = await db.query.animals.findMany({
      where: type ? eq(animals.type, type) : undefined,
    });
    res.json(allAnimals);
  });

  app.post("/api/animals", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const animal = await db.insert(animals).values(req.body).returning();
    res.json(animal[0]);
  });

  app.put("/api/animals/:id", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const animal = await db.update(animals)
      .set(req.body)
      .where(eq(animals.id, parseInt(req.params.id)))
      .returning();
    res.json(animal[0]);
  });

  app.delete("/api/animals/:id", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    await db.delete(animals).where(eq(animals.id, parseInt(req.params.id)));
    res.json({ message: "Deleted successfully" });
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    const category = req.query.category as string;
    const allProducts = await db.query.products.findMany({
      where: category ? eq(products.category, category) : undefined,
    });
    res.json(allProducts);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const product = await db.insert(products).values(req.body).returning();
    res.json(product[0]);
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    const product = await db.update(products)
      .set(req.body)
      .where(eq(products.id, parseInt(req.params.id)))
      .returning();
    res.json(product[0]);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ message: "Deleted successfully" });
  });

  // Add a new route to check deployment status
  app.get("/api/deployment-status", (_req, res) => {
    res.json({ isProduction: process.env.NODE_ENV === 'production' });
  });

  const httpServer = createServer(app);
  return httpServer;
}