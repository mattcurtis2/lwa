import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { animals, products, users } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

export function registerRoutes(app: Express): Server {
  const SessionStore = MemoryStore(session);
  
  app.use(session({
    store: new SessionStore({ checkPeriod: 86400000 }),
    secret: "farm-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));

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

  const httpServer = createServer(app);
  return httpServer;
}
