import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { animals, products, users, siteContent, carouselItems, dogs, dogsHero, dogMedia, litters, dogDocuments, principles, contactInfo } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import express from 'express';


// Multer configuration for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
fs.ensureDirSync(uploadDir); // Create uploads directory if it doesn't exist

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.google-apps.document',
      'text/plain',
      // Spreadsheets
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.spreadsheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported formats: images, videos, PDFs, Word docs, and Google docs.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

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
      const defaultPassword = process.env.NODE_ENV === 'production' ?
        process.env.ADMIN_PASSWORD?.replace(/\s+/g, '') || 'AustenAlcott' :
        'AustenAlcott';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
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
      { key: "bakery_redirect", value: "/#goats", type: "text" },
      // Products Card
      { key: "products_title", value: "Farmers Market", type: "text" },
      { key: "products_text", value: "Visit our Farmers Market for a delightful selection of homemade and farm-fresh goods. Savor our artisanal sourdough bread and buttery croissants, baked fresh daily. Enjoy our seasonal mixed salad greens, farm-fresh eggs, pasture-raised chicken, and pure local honey. Every product reflects our commitment to quality and sustainable farming practices.", type: "text" },
      { key: "products_image", value: "https://images.unsplash.com/photo-1488459716781-31db52582fe9", type: "image" },
      { key: "products_button_text", value: "Visit Our Market", type: "text" },
      { key: "products_redirect", value: "/#market", type: "text" },
    ];

    for (const content of defaultContent) {
      const exists = await db.query.siteContent.findFirst({
        where: eq(siteContent.key, content.key),
      });

      if (!exists) {
        await db.insert(siteContent).values(content);
      }
    }

    // Add default carousel items if none exist
    const existingCarouselItems = await db.query.carouselItems.findMany();

    if (existingCarouselItems.length === 0) {
      const defaultCarouselItems = [
        {
          title: "Colorado Mountain Dogs",
          description: "Our exceptional working dogs bred for livestock protection. Known for their gentle nature with family and fierce loyalty in guarding, these magnificent animals are raised with hands-on care and early socialization.",
          imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
          order: 1,
        },
        {
          title: "Nigerian Dwarf Goats",
          description: "Our beloved Nigerian Dwarf Goats, known for their friendly personalities and rich milk production. Perfect for small homesteads, they're registered, health-tested, and raised with love.",
          imageUrl: "https://images.unsplash.com/photo-1533318087102-b3ad366ed041",
          order: 2,
        },
        {
          title: "Farm Fresh Products",
          description: "Visit our Farmers Market for homemade and farm-fresh goods. From artisanal bread to seasonal produce, every product reflects our commitment to quality and sustainable farming.",
          imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9",
          order: 3,
        },
      ];

      for (const item of defaultCarouselItems) {
        await db.insert(carouselItems).values(item);
      }
    }

    // Add default dogs hero content if none exists
    const existingHero = await db.query.dogsHero.findFirst();

    if (!existingHero) {
      await db.insert(dogsHero).values({
        title: "Colorado Mountain Dogs",
        subtitle: "Loyal guardians bred for livestock protection, combining strength with gentle temperament",
        imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
      });
    }

    // Add sample dogs if none exist
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
          order: 1,
        },
        {
          name: "Atlas",
          breed: "Colorado Mountain Dog",
          birthDate: "2021-06-20",
          description: "Atlas is a proven guardian with a calm demeanor. He excels at protecting livestock and is well-socialized.",
          imageUrl: "https://images.unsplash.com/photo-1583511666407-5f06533f2113",
          isAvailable: true,
          order: 2,
        },
        {
          name: "Sierra",
          breed: "Colorado Mountain Dog",
          birthDate: "2023-03-10",
          description: "Sierra is a young, energetic guardian in training. She shows great promise in both protection and companionship.",
          imageUrl: "https://images.unsplash.com/photo-1583511666383-67ab5c547eb8",
          isAvailable: true,
          order: 3,
        },
        {
          name: "Rocky",
          breed: "Colorado Mountain Dog",
          birthDate: "2020-08-25",
          description: "Rocky is an experienced guardian with a perfect track record. He's calm, confident, and excellent with other dogs.",
          imageUrl: "https://images.unsplash.com/photo-1583511666450-662b12363a55",
          isAvailable: true,
          order: 4,
        },
      ];

      for (const dog of sampleDogs) {
        await db.insert(dogs).values(dog);
      }
    }
  })();

  // Site content routes
  app.get("/api/site-content", async (req, res) => {
    const content = await db.query.siteContent.findMany();
    res.json(content);
  });

  app.put("/api/site-content/:key", async (req, res) => {
    const { value } = req.body;
    const key = req.params.key;

    try {
      // Check if the content exists first
      const existingContent = await db.query.siteContent.findFirst({
        where: eq(siteContent.key, key),
      });

      if (!existingContent) {
        // If it doesn't exist, create it
        const content = await db.insert(siteContent)
          .values({
            key,
            value,
            type: key.includes('image') ? 'image' : 'text',
          })
          .returning();
        res.json(content[0]);
      } else {
        // If it exists, update it
        const content = await db.update(siteContent)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteContent.key, key))
          .returning();
        res.json(content[0]);
      }
    } catch (error) {
      console.error(`Error updating site content for key ${key}:`, error);
      res.status(500).json({ message: "Failed to update site content" });
    }
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
    const animal = await db.insert(animals).values(req.body).returning();
    res.json(animal[0]);
  });

  app.put("/api/animals/:id", async (req, res) => {
    const animal = await db.update(animals)
      .set(req.body)
      .where(eq(animals.id, parseInt(req.params.id)))
      .returning();
    res.json(animal[0]);
  });

  app.delete("/api/animals/:id", async (req, res) => {
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
    const product = await db.insert(products).values(req.body).returning();
    res.json(product[0]);
  });

  app.put("/api/products/:id", async (req, res) => {
    const product = await db.update(products)
      .set(req.body)
      .where(eq(products.id, parseInt(req.params.id)))
      .returning();
    res.json(product[0]);
  });

  app.delete("/api/products/:id", async (req, res) => {
    await db.delete(products).where(eq(products.id, parseInt(req.params.id)));
    res.json({ message: "Deleted successfully" });
  });

  // Add a new route to check deployment status
  app.get("/api/deployment-status", (_req, res) => {
    res.json({ isProduction: process.env.NODE_ENV === 'production' });
  });


  // Add carousel routes
  app.get("/api/carousel", async (_req, res) => {
    const items = await db.query.carouselItems.findMany({
      orderBy: (carouselItems, { asc }) => [asc(carouselItems.order)],
    });
    res.json(items);
  });

  app.post("/api/carousel", async (req, res) => {
    // Get the highest order number
    const items = await db.query.carouselItems.findMany();
    const maxOrder = items.reduce((max, item) => Math.max(max, item.order), 0);

    const item = await db.insert(carouselItems)
      .values({ ...req.body, order: maxOrder + 1 })
      .returning();
    res.json(item[0]);
  });

  app.put("/api/carousel/:id", async (req, res) => {
    const item = await db.update(carouselItems)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(carouselItems.id, parseInt(req.params.id)))
      .returning();
    res.json(item[0]);
  });

  app.delete("/api/carousel/:id", async (req, res) => {
    await db.delete(carouselItems)
      .where(eq(carouselItems.id, parseInt(req.params.id)));

    // Reorder remaining items
    const items = await db.query.carouselItems.findMany({
      orderBy: (carouselItems, { asc }) => [asc(carouselItems.order)],
    });

    for (let i = 0; i < items.length; i++) {
      await db.update(carouselItems)
        .set({ order: i + 1 })
        .where(eq(carouselItems.id, items[i].id));
    }

    res.json({ message: "Deleted successfully" });
  });

  // Dogs Hero routes
  app.get("/api/dogs-hero", async (_req, res) => {
    const hero = await db.query.dogsHero.findMany();
    res.json(hero);
  });

  app.put("/api/dogs-hero/:id", upload.single('image'), async (req, res) => {
    try {
      let imageUrl = req.body.imageUrl; // For direct URL updates

      // If a file was uploaded, use its path
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      if (!imageUrl) {
        return res.status(400).json({ message: "No image URL or file provided" });
      }

      const hero = await db.update(dogsHero)
        .set({
          imageUrl,
          updatedAt: new Date()
        })
        .where(eq(dogsHero.id, parseInt(req.params.id)))
        .returning();

      res.json(hero[0]);
    } catch (error) {
      console.error("Error updating hero image:", error);
      res.status(500).json({ message: "Failed to update hero image" });
    }
  });

  // Update the GET /api/dogs route to include parent and litter information
  app.get("/api/dogs", async (_req, res) => {
    const allDogs = await db.query.dogs.findMany({
      orderBy: (dogs, { asc }) => [asc(dogs.order)],
      with: {
        media: {
          orderBy: (dogMedia, { asc }) => [asc(dogMedia.order)],
        },
        documents: true,
        mother: true,
        father: true,
        litter: true,
      },
    });

    // Set first media image as profile picture if none exists
    const processedDogs = allDogs.map(dog => {
      if (!dog.profileImageUrl && dog.media && dog.media.length > 0) {
        const firstImage = dog.media.find(m => m.type === 'image');
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

  app.post("/api/dogs", async (req, res) => {
    const { media, documents, ...dogData } = req.body;

    try {
      // Log incoming data for debugging
      console.log('Received dog data:', JSON.stringify(dogData));

      const dog = await db.transaction(async (tx) => {
        // Ensure all required fields are present and properly formatted
        const dogToInsert = {
          ...dogData,
          // Convert string numbers to actual numbers or null
          height: dogData.height ? Number(dogData.height) : null,
          weight: dogData.weight ? Number(dogData.weight) : null,
          // Ensure IDs are numbers or null
          motherId: dogData.motherId ? Number(dogData.motherId) : null,
          fatherId: dogData.fatherId ? Number(dogData.fatherId) : null,
          litterId: dogData.litterId ? Number(dogData.litterId) : null,
          // Set default values
          order: dogData.order || 0,
          outsideBreeder: dogData.outsideBreeder || false,
        };

        const [newDog] = await tx.insert(dogs).values(dogToInsert).returning();

        // Handle media if present
        if (media && media.length > 0) {
          await tx.insert(dogMedia).values(
            media.map((item: any, index: number) => ({
              dogId: newDog.id,
              url: item.url,
              type: item.type,
              order: index,
            }))
          );
        }

        // Handle documents if present
        if (documents && documents.length > 0) {
          await tx.insert(dogDocuments).values(
            documents.map((doc: any) => ({
              dogId: newDog.id,
              url: doc.url,
              type: doc.type,
              name: doc.name,
              mimeType: doc.mimeType
            }))
          );
        }

        // Return the created dog with all relations
        const dogWithRelations = await tx.query.dogs.findFirst({
          where: eq(dogs.id, newDog.id),
          with: {
            media: true,
            documents: true,
            mother: true,
            father: true,
            litter: true,
          },
        });

        return dogWithRelations;
      });

      res.json(dog);
    } catch (error) {
      console.error("Error creating dog:", error);
      res.status(500).json({ message: "Failed to create dog", error: error.message });
    }
  });

  // Update the PUT /api/dogs/:id route to handle parent and litter information
  app.put("/api/dogs/:id", async (req, res) => {
    const { media, documents, ...dogData } = req.body;
    const dogId = parseInt(req.params.id);

    try {
      const dog = await db.transaction(async (tx) => {
        const existingDog = await tx.query.dogs.findFirst({
          where: eq(dogs.id, dogId),
        });

        if (!existingDog) {
          throw new Error("Dog not found");
        }

        await tx.update(dogs)
          .set({
            ...dogData,
            order: existingDog.order,
            updatedAt: new Date()
          })
          .where(eq(dogs.id, dogId));

        await tx.delete(dogMedia)
          .where(eq(dogMedia.dogId, dogId));

        await tx.delete(dogDocuments)
          .where(eq(dogDocuments.dogId, dogId));

        if (media && media.length > 0) {
          await tx.insert(dogMedia).values(
            media.map((item: any, index: number) => ({
              dogId: dogId,
              url: item.url,
              type: item.type,
              order: index,
            }))
          );
        }

        if (documents && documents.length > 0) {
          await tx.insert(dogDocuments).values(
            documents.map((doc: any) => ({
              dogId: dogId,
              url: doc.url,
              type: doc.type,
              name: doc.name,
              mimeType: doc.mimeType
            }))
          );
        }

        const updatedDog = await tx.query.dogs.findFirst({
          where: eq(dogs.id, dogId),
          with: {
            media: true,
            documents: true,
            mother: true,
            father: true,
            litter: true,
          },
        });

        return updatedDog;
      });

      res.json(dog);
    } catch (error) {
      console.error("Error updating dog:", error);
      res.status(500).json({ message: "Failed to update dog" });
    }
  });

  app.delete("/api/dogs/:id", async (req, res) => {
    await db.delete(dogs).where(eq(dogs.id, parseInt(req.params.id)));
    res.json({ message: "Deleted successfully" });
  });

  // Add reorder endpoint for dogs
  app.put("/api/dogs/:id/reorder", async (req, res) => {
    const dog = await db.update(dogs)
      .set({
        order: req.body.order,
        updatedAt: new Date()
      })
      .where(eq(dogs.id, parseInt(req.params.id)))
      .returning();

    res.json(dog[0]);
  });

  // Add file upload endpoint with updated file types
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.split('/')[0]; // 'image', 'video', 'application', etc.

    res.json({
      url: fileUrl,
      type: fileType,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype
    });
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Add litter routes
  app.get("/api/litters", async (_req, res) => {
    const allLitters = await db.query.litters.findMany({
      with: {
        mother: {
          with: {
            media: {
              orderBy: (dogMedia, { asc }) => [asc(dogMedia.order)],
            },
          },
        },
        father: {
          with: {
            media: {
              orderBy: (dogMedia, { asc }) => [asc(dogMedia.order)],
            },
          },
        },
      },
    });
    res.json(allLitters);
  });

  app.post("/api/litters", async (req, res) => {
    try {
      const litter = await db.insert(litters)
        .values(req.body)
        .returning();

      const litterWithParents = await db.query.litters.findFirst({
        where: eq(litters.id, litter[0].id),
        with: {
          mother: true,
          father: true,
        },
      });

      res.json(litterWithParents);
    } catch (error) {
      console.error("Error creating litter:", error);
      res.status(500).json({ message: "Failed to create litter" });
    }
  });

  app.put("/api/litters/:id", async (req, res) => {
    try {
      const litter = await db.update(litters)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(litters.id, parseInt(req.params.id)))
        .returning();

      const litterWithParents = await db.query.litters.findFirst({
        where: eq(litters.id, litter[0].id),
        with: {
          mother: true,
          father: true,
        },
      });

      res.json(litterWithParents);
    } catch (error) {
      console.error("Error updating litter:", error);
      res.status(500).json({ message: "Failed to update litter" });
    }
  });

  app.delete("/api/litters/:id", async (req, res) => {
    try {
      await db.delete(litters)
        .where(eq(litters.id, parseInt(req.params.id)));
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting litter:", error);
      res.status(500).json({ message: "Failed to delete litter" });
    }
  });

  // Add principles routes
  app.get("/api/principles", async (_req, res) => {
    try {
      const allPrinciples = await db.query.principles.findMany({
        orderBy: (principles, { asc }) => [asc(principles.order)],
      });
      res.json(allPrinciples);
    } catch (error) {
      console.error("Error fetching principles:", error);
      res.status(500).json({ message: "Failed to fetch principles" });
    }
  });

  app.post("/api/principles", async (req, res) => {
    try {
      const principles = await db.insert(principles)
        .values(req.body)
        .returning();
      res.json(principles[0]);
    } catch (error) {
      console.error("Error creating principle:", error);
      res.status(500).json({ message: "Failed to create principle" });
    }
  });

  app.put("/api/principles/:id", async (req, res) => {
    try {
      const principle = await db.update(principles)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(principles.id, parseInt(req.params.id)))
        .returning();
      res.json(principle[0]);
    } catch (error) {
      console.error("Error updating principle:", error);
      res.status(500).json({ message: "Failed to update principle" });
    }
  });

  app.delete("/api/principles/:id", async (req, res) => {
    try {
      await db.delete(principles)
        .where(eq(principles.id, parseInt(req.params.id)));
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting principle:", error);
      res.status(500).json({ message: "Failed to delete principle" });
    }
  });

  app.put("/api/principles/:id/reorder", async (req, res) => {
    try {
      const principle = await db.update(principles)
        .set({
          order: req.body.order,
          updatedAt: new Date()
        })
        .where(eq(principles.id, parseInt(req.params.id)))
        .returning();
      res.json(principle[0]);
    } catch (error) {
      console.error("Error reordering principle:", error);
      res.status(500).json({ message: "Failed to reorder principle" });
    }
  });

  // Add contact info routes
  app.get("/api/contact-info", async (_req, res) => {
    try {
      const info = await db.query.contactInfo.findFirst();
      res.json(info);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ message: "Failed to fetch contact info" });
    }
  });

  app.post("/api/contact-info", async (req, res) => {
    try {
      // Delete existing contact info since we only want one record
      await db.delete(contactInfo);

      const info = await db.insert(contactInfo)
        .values(req.body)
        .returning();
      res.json(info[0]);
    } catch (error) {
      console.error("Error creating contact info:", error);
      res.status(500).json({ message: "Failed to create contact info" });
    }
  });

  app.put("/api/contact-info", async (req, res) => {
    try {
      const existingInfo = await db.query.contactInfo.findFirst();

      if (!existingInfo) {
        // If no record exists, create one
        const info = await db.insert(contactInfo)
          .values(req.body)
          .returning();
        res.json(info[0]);
      } else {
        // Update existing record
        const info = await db.update(contactInfo)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(contactInfo.id, existingInfo.id))
          .returning();
        res.json(info[0]);
      }
    } catch (error) {
      console.error("Error updating contact info:", error);
      res.status(500).json({ message: "Failed to update contact info" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}