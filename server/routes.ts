import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { animals, products, users, siteContent, carouselItems, dogs, dogsHero, dogMedia, litters, dogDocuments, principles, contactInfo, fileStorage, goats, goatMedia, goatLitters, goatDocuments, marketSections, marketSchedules } from "@db/schema";
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
    cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Allow up to 10 files at once
  }
});

export function registerRoutes(app: Express): Server {
  app.get("/api/files/:filename", async (req, res) => {
    try {
      const file = await db.query.fileStorage.findFirst({
        where: eq(fileStorage.fileName, req.params.filename)
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      const buffer = Buffer.from(file.data, 'base64');
      res.setHeader('Content-Type', file.mimeType);
      res.send(buffer);
    } catch (error) {
      console.error("Error serving file:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

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
      { key: "bakery_redirect", value: "/goats", type: "text" },
      // Products Card
      { key: "products_title", value: "Farmers Market", type: "text" },
      { key: "products_text", value: "Visit our Farmers Market for a delightful selection of homemade and farm-fresh goods. Savor our artisanal sourdough bread and buttery croissants, baked fresh daily. Enjoy our seasonal mixed salad greens, farm-fresh eggs, pasture-raised chicken, and pure local honey. Every product reflects our commitment to quality and sustainable farming practices.", type: "text" },
      { key: "products_image", value: "https://images.unsplash.com/photo-1488459716781-31db52582fe9", type: "image" },
      { key: "products_button_text", value: "Visit Our Market", type: "text" },
      { key: "products_redirect", value: "/market", type: "text" },
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

    // Add sample goats if none exist
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
          profileImageUrl: "/images/goats/luna.jpg",
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
          profileImageUrl: "/images/goats/zeus.jpg",
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
          profileImageUrl: "/images/goats/daisy.jpg",
        }
      ];

      for (const goat of sampleGoats) {
        await db.insert(goats).values(goat);
      }
    }

    // Add sample goat litters if none exist
    const existingGoatLitters = await db.query.goatLitters.findMany();

    if (existingGoatLitters.length === 0) {
      const goatsList = await db.query.goats.findMany();
      const mothers = goatsList.filter(g => g.gender === 'female');
      const fathers = goatsList.filter(g => g.gender === 'male');

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
  })();

  // Site content routes
  app.get("/api/site-content", async (req, res) => {
    const content = await db.query.siteContent.findMany();
    res.json(content);
  });

  app.put("/api/site-content/:key", upload.single('file'), async (req, res) => {
    const key = req.params.key;
    try {
      let value = req.body.value;

      // Handle base64 image data from cropper
      if (value && value.startsWith('data:image')) {
        const base64Data = value.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `file-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        value = `/uploads/${filename}`;
      }
      // If this is a file upload (for hero_background or other images)
      else if (req.file && (key === 'hero_background' || key.includes('image'))) {
        value = `/uploads/${req.file.filename}`;
      }

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

  // CMD Description content routes
  app.get("/api/site-content/cmd-description", async (_req, res) => {
    try {
      const content = await db.query.siteContent.findFirst({
        where: eq(siteContent.key, "cmd_description"),
      });

      if (!content) {
        // If content doesn't exist, create it with default value
        const newContent = await db.insert(siteContent)
          .values({
            key: "cmd_description",
            value: "Colorado Mountain Dogs are exceptional working dogs bred for livestock protection.",
            type: "text",
          })
          .returning();
        res.json(newContent[0]);
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching CMD description:", error);
      res.status(500).json({ message: "Failed to fetch CMD description" });
    }
  });

  app.post("/api/site-content/cmd-description", async (req, res) => {
    try {
      const { value } = req.body;

      const existingContent = await db.query.siteContent.findFirst({
        where: eq(siteContent.key, "cmd_description"),
      });

      if (existingContent) {
        const content = await db.update(siteContent)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteContent.key, "cmd_description"))
          .returning();
        res.json(content[0]);
      } else {
        const content = await db.insert(siteContent)
          .values({
            key: "cmd_description",
            value,
            type: "text",
          })
          .returning();
        res.json(content[0]);
      }
    } catch (error) {
      console.error("Error updating CMD description:", error);
      res.status(500).json({ message: "Failed to update CMD description" });
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

  // Market Section routes
  app.get("/api/market-sections", async (_req, res) => {
    try {
      const sections = await db.query.marketSections.findMany({
        orderBy: (marketSections, { asc }) => [asc(marketSections.order)],
      });
      res.json(sections);
    } catch (error) {
      console.error("Error fetching market sections:", error);
      res.status(500).json({ message: "Failed to fetch market sections" });
    }
  });

  app.post("/api/market-sections", async (req, res) => {
    try {
      const section = await db.insert(marketSections)
        .values(req.body)
        .returning();
      res.json(section[0]);
    } catch (error) {
      console.error("Error creating market section:", error);
      res.status(500).json({ message: "Failed to create market section" });
    }
  });

  app.put("/api/market-sections/:id", async (req, res) => {
    try {
      const section = await db.update(marketSections)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(marketSections.id, parseInt(req.params.id)))
        .returning();
      res.json(section[0]);
    } catch (error) {
      console.error("Error updating market section:", error);
      res.status(500).json({ message: "Failed to update market section" });
    }
  });

  app.delete("/api/market-sections/:id", async (req, res) => {
    try {
      await db.delete(marketSections)
        .where(eq(marketSections.id, parseInt(req.params.id)));
      res.json({ message: "Market section deleted successfully" });
    } catch (error) {
      console.error("Error deleting market section:", error);
      res.status(500).json({ message: "Failed to delete market section" });
    }
  });


  // Market Schedule routes
  app.get("/api/market-schedules", async (_req, res) => {
    try {
      const schedules = await db.query.marketSchedules.findMany({
        orderBy: (marketSchedules, { asc }) => [asc(marketSchedules.order)],
      });
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching market schedules:", error);
      res.status(500).json({ message: "Failed to fetch market schedules" });
    }
  });

  app.post("/api/market-schedules", async (req, res) => {
    try {
      const schedule = await db.insert(marketSchedules)
        .values(req.body)
        .returning();
      res.json(schedule[0]);
    } catch (error) {
      console.error("Error creating market schedule:", error);
      res.status(500).json({ message: "Failed to create market schedule" });
    }
  });

  app.put("/api/market-schedules/:id", async (req, res) => {
    try {
      const { location, address, dayOfWeek, startTime, endTime, description, order, isActive } = req.body;
      const schedule = await db.update(marketSchedules)
        .set({
          location,
          address,
          dayOfWeek,
          startTime,
          endTime,
          description,
          order,
          isActive,
          updatedAt: new Date()
        })
        .where(eq(marketSchedules.id, parseInt(req.params.id)))
        .returning();
      res.json(schedule[0]);
    } catch (error) {
      console.error("Error updating market schedule:", error);
      res.status(500).json({ message: "Failed to update market schedule" });
    }
  });

  app.delete("/api/market-schedules/:id", async (req, res) => {
    try {
      await db.delete(marketSchedules)
        .where(eq(marketSchedules.id, parseInt(req.params.id)));
      res.json({ message: "Market schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting market schedule:", error);
      res.status(500).json({ message: "Failed to delete market schedule" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    const section = req.query.section as string;
    try {
      const allProducts = await db.query.products.findMany({
        where: section ? eq(products.section, section) : undefined,
        orderBy: (products, { asc }) => [asc(products.order)],
      });
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = await db.insert(products).values(req.body).returning();
      res.json(product[0]);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const product = await db.update(products)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(products.id, parseInt(req.params.id)))
        .returning();
      res.json(product[0]);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await db.delete(products)
        .where(eq(products.id, parseInt(req.params.id)));
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
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

  // Update the POST /api/dogs route to handle parent and litter information
  app.post("/api/dogs", async (req, res) => {
    const { media, documents, ...dogData } = req.body;

    try {
      const dog = await db.transaction(async (tx) => {
        const [newDog] = await tx.insert(dogs).values(dogData).returning();

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
      res.status(500).json({ message: "Failed to create dog" });
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

        // Update dog media
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

  app.post("/api/upload", upload.array("file", 10), async (req, res) => {
    try {
      console.log('=== Upload Request Received ===');
      console.log('Headers:', req.headers);
      console.log('Files:', req.files ? req.files.map(f => ({
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
        path: f.path
      })) : 'No files');
      console.log('Request body:', req.body);
      console.log('Request body:', req.body);

      if (!req.files) {
        console.error('No files in request - files object is undefined');
        return res.status(400).json({ message: "No files provided in request" });
      }
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        console.error('No files in request');
        return res.status(400).json({ message: "No files uploaded" });
      }

      console.log(`Processing ${req.files.length} files`);
      const uploadedFiles = await Promise.all(req.files.map(async (file) => {
        console.log('Processing file:', {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path
        });

        const targetPath = path.join(uploadDir, file.filename);
        await fs.ensureDir(uploadDir);

        if (file.path !== targetPath) {
          console.log('Copying file to:', targetPath);
          await fs.copy(file.path, targetPath);
        }

        return {
          url: `/uploads/${file.filename}`,
          type: file.mimetype.split('/')[0],
          originalName: file.originalname,
          mimeType: file.mimetype
        };
      }));

      console.log('Files processed successfully:', uploadedFiles);
      res.json(uploadedFiles);
    } catch (error) {
      console.error('=== Upload Error ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      return res.status(500).json({
        message: "Failed to process uploaded files",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Serve uploaded files statically with proper MIME types
  app.use('/uploads', express.static(uploadDir, {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime'
      };
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    }
  }));

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
      // Extract only the fields we want to update
      const { dueDate, motherId, fatherId, isVisible } = req.body;

      const updateData = {
        dueDate,
        motherId,
        fatherId,
        isVisible,
        updatedAt: new Date(),
      };

      const litter = await db.update(litters)
        .set(updateData)
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
      console.error("Error updating litter - Full error:", error);
      res.status(500).json({ message: "Failed to update litter", error: error.message });
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

  //Improved litter routes from edited snippet
  app.get("/api/litters/:id", async (req, res) => {
    try {
      const litterId = parseInt(req.params.id);

      if (isNaN(litterId)) {
        return res.status(400).json({ message: "Invalid litter ID" });
      }

      const litter = await db.query.litters.findFirst({
        where: eq(litters.id, litterId),
        with: {
          mother: {
            with: {
              media: {
                orderBy: (media, { asc }) => [asc(media.order)],
              },
              documents: true,
            },
          },
          father: {
            with: {
              media: {
                orderBy: (media, { asc }) => [asc(media.order)],
              },
              documents: true,
            },
          },
        },
      });

      if (!litter) {
        return res.status(404).json({ message: "Litter not found" });
      }

      // Fetch puppies separately since they're not directly related in the schema
      const puppies = await db.query.dogs.findMany({
        where: eq(dogs.litterId, litterId),
        with: {
          media: {
            orderBy: (media, { asc }) => [asc(media.order)],
          },
          documents: true,
        },
        orderBy: (dogs, { asc }) => [asc(dogs.order)],
      });

      res.json({
        ...litter,
        puppies,
      });
    } catch (error) {
      console.error("Error fetching litter:", error);
      res.status(500).json({ message: "Failed to fetch litter" });
    }
  });

  app.get("/api/litters/list/past", async (_req, res) => {
    try {
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

      //      // For each litter, fetch its puppies
      const littersWithPuppies = await Promise.all(
        allLitters.map(async (litter) => {
          const puppies = await db.query.dogs.findMany({
            where: eq(dogs.litterId, litter.id),
            with: {
              media: {
                orderBy: (dogMedia, { asc }) => [asc(dogMedia.order)],
              },
            },
          });

          // Only include if thereare puppies and at least one puppy has a birth date
          if (puppies.length > 0 && puppies.some(puppy => puppy.birthDate)) {
            return {
              ...litter,
              puppies,
            };
          }
          return null;
        })
      );

      // Filter out null entries (litters without puppies or birth dates)
      const validLitters = littersWithPuppies.filter(litter => litter !== null);

      // Sort by the first puppy's birth date in descending order (most recent first)
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
      const { id } = req.params;
      const { title, description, imageUrl } = req.body;

      const updateData = {
        title,
        description,
        imageUrl,
        updatedAt: new Date(),
      };

      const principle = await db.update(principles)
        .set(updateData)
        .where(eq(principles.id, parseInt(id)))
        .returning();

      res.json(principle[0]);
    } catch (error) {
      console.error("Error updating principle:", error);
      res.status(500).json({ message: "Failed to update principle" });
    }
  });

  app.delete("/api/principles/:id", async (req, res) => {
    try {
      const result = await db.delete(principles)
        .where(eq(principles.id, parseInt(req.params.id)))
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ message: "Principle not found" });
      }

      res.json(result[0]);
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

  // Add these routes after the litter routes
  // Goat routes
  app.get("/api/goats", async (_req, res) => {
    try {
      const allGoats = await db.query.goats.findMany({
        orderBy: (goats, { asc }) => [asc(goats.order)],
        with: {
          media: {
            orderBy: (goatMedia, { asc }) => [asc(goatMedia.order)],
          },
          documents: true,
          mother: true,
          father: true,
          litter: true,
        }
      });

      // Set first media image as profile picture if none exists
      const processedGoats = allGoats.map(goat => {
        if (!goat.profileImageUrl && goat.media && goat.media.length > 0) {
          const firstImage = goat.media.find(m => m.type === 'image');
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

  // Get specific goat
  app.get("/api/goats/:id", async (req, res) => {
    try {
      const goatId = parseInt(req.params.id);
      const goat = await db.query.goats.findFirst({
        where: eq(goats.id, goatId),
        with: {
          media: {
            orderBy: (goatMedia, { asc }) => [asc(goatMedia.order)],
          },
          documents: true,
          mother: true,
          father: true,
          litter: true,
        }
      });

      if (!goat) {
        return res.status(404).json({ message: "Goat not found" });
      }

      res.json(goat);
    } catch (error) {
      console.error("Error fetching goat:", error);
      res.status(500).json({ message: "Failed to fetch goat" });
    }
  });

  // Create new goat
  app.post("/api/goats", async (req, res) => {
    try {
      console.log('Creating goat with data:', req.body);
      const goat = await db.insert(goats).values(req.body).returning();
      console.log('Created goat:', goat[0]);
      res.json(goat[0]);
    } catch (error) {
      console.error("Error creating goat:", error);
      res.status(500).json({ message: "Failed to create goat" });
    }
  });

  // Update goat
  app.put("/api/goats/:id", async (req, res) => {
    try {
      console.log('Updating goat with data:', req.body);
      const goat = await db.update(goats)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(goats.id, parseInt(req.params.id)))
        .returning();
      console.log('Updated goat:', goat[0]);
      res.json(goat[0]);
    } catch (error) {
      console.error("Error updating goat:", error);
      res.status(500).json({ message: "Failed to update goat" });
    }
  });

  // Delete goat
  app.delete("/api/goats/:id", async (req, res) => {
    try {
      await db.delete(goats)
        .where(eq(goats.id, parseInt(req.params.id)));
      res.json({ message: "Goat deleted successfully" });
    } catch (error) {
      console.error("Error deleting goat:", error);
      res.status(500).json({ message: "Failed to delete goat" });
    }
  });

  // Goat Litter routes
  app.get("/api/goat-litters", async (_req, res) => {
    try {
      const allLitters = await db.query.goatLitters.findMany({
        with: {
          mother: true,
          father: true,
        },
      });
      res.json(allLitters);
    } catch (error) {
      console.error("Error fetching goat litters:", error);
      res.status(500).json({ message: "Failed to fetch goat litters" });
    }
  });

  app.post("/api/goat-litters", async (req, res) => {
    try {
      const litter = await db.insert(goatLitters)
        .values(req.body)
        .returning();

      const litterWithRelations = await db.query.goatLitters.findFirst({
        where: eq(goatLitters.id, litter[0].id),
        with: {
          mother: true,
          father: true,
        },
      });

      res.json(litterWithRelations);
    } catch (error) {
      console.error("Error creating goat litter:", error);
      res.status(500).json({ message: "Failed to create goat litter" });
    }
  });

  app.put("/api/goat-litters/:id", async (req, res) => {
    try {
      const litterId = parseInt(req.params.id);
      const litter = await db.update(goatLitters)
        .set({
          ...req.body,
          updatedAt: new Date()
        })
        .where(eq(goatLitters.id, litterId))
        .returning();

      const litterWithRelations = await db.query.goatLitters.findFirst({
        where: eq(goatLitters.id, litter[0].id),
        with: {
          mother: true,
          father: true,
        },
      });

      res.json(litterWithRelations);
    } catch (error) {
      console.error("Error updating goat litter:", error);
      res.status(500).json({ message: "Failed to update goat litter" });
    }
  });

  app.delete("/api/goat-litters/:id", async (req, res) => {
    try {
      await db.delete(goatLitters)
        .where(eq(goatLitters.id, parseInt(req.params.id)));
      res.json({ message: "Goat litter deleted successfully" });
    } catch (error) {
      console.error("Error deleting goat litter:", error);
      res.status(500).json({ message: "Failed to delete goat litter" });
    }
  });

  // Theme management routes
  app.get("/api/theme", (_req, res) => {
    try {
      const themeFilePath = path.join(process.cwd(), "theme.json");
      const themeConfig = fs.readJsonSync(themeFilePath);
      res.json(themeConfig);
    } catch (error) {
      console.error("Error reading theme config:", error);
      res.status(500).json({ message: "Failed to read theme configuration" });
    }
  });

  app.put("/api/theme", async (req, res) => {
    try {
      const themeFilePath = path.join(process.cwd(), "theme.json");
      await fs.writeJson(themeFilePath, req.body, { spaces: 2 });
      res.json({ message: "Theme updated successfully" });
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme configuration" });
    }
  });
  // Add the pages endpoint to the existing routes
  app.get("/api/pages", async (_req, res) => {
    try {
      const pages = [
        {
          id: 1,
          name: "Home",
          fields: {
            hero_title: "Welcome to Little Way Acres",
            hero_subtitle: "Experience sustainable farming and community",
            hero_image: "/images/hero.jpg",
            about_content: "Discover our commitment to sustainable farming...",
            contact_info: "Get in touch with us...",
          },
        },
        {
          id: 2,
          name: "Dogs",
          fields: {
            title: "Our Colorado Mountain Dogs",
            description: "Learn about our exceptional working dogs...",
            hero_image: "/images/dogs-hero.jpg",
            breeding_info: "Our breeding program focuses on...",
          },
        },
        {
          id: 3,
          name: "Goats",
          fields: {
            title: "Nigerian Dwarf Goats",
            description: "Explore our goat breeding program...",
            hero_image: "/images/goats-hero.jpg",
            care_info: "Our approach to goat care...",
          },
        },
        {
          id: 4,
          name: "Market",
          fields: {
            title: "Farm Market",
            description: "Fresh produce and products...",
            hero_image: "/images/market-hero.jpg",
            schedule_info: "Market hours and locations...",
          },
        },
      ];

      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.put("/api/pages/:id/fields/:field", async (req, res) => {
    try {
      const { id, field } = req.params;
      const { value } = req.body;

      // Here you would typically update the database
      // For now, we'll just return success
      res.json({ id, field, value });
    } catch (error) {
      console.error("Error updating page field:", error);
      res.status(500).json({ message: "Failed to update page field" });
    }
  });

  // Add these routes before the httpServer creation
  app.get("/api/about-cards", async (_req, res) => {
    try {
      // Fetch all about card related content
      const cardKeys = [
        'about_card_1_title', 'about_card_1_description', 'about_card_1_icon',
        'about_card_2_title', 'about_card_2_description', 'about_card_2_icon',
        'about_card_3_title', 'about_card_3_description', 'about_card_3_icon',
        'about_section_title', 'about_section_description'
      ];

      const content = await db.query.siteContent.findMany({
        where: (siteContent, { or, eq }) =>
          or(...cardKeys.map(key => eq(siteContent.key, key)))
      });

      // Transform into a more usable structure
      const aboutCards = {
        sectionTitle: content.find(c => c.key === 'about_section_title')?.value || 'What We Offer',
        sectionDescription: content.find(c => c.key === 'about_section_description')?.value || 'Discover our range of services',
        cards: [1, 2, 3].map(i => ({
          title: content.find(c => c.key === `about_card_${i}_title`)?.value || '',
          description: content.find(c => c.key === `about_card_${i}_description`)?.value || '',
          icon: content.find(c => c.key === `about_card_${i}_icon`)?.value || ''
        }))
      };

      res.json(aboutCards);
    } catch (error) {
      console.error("Error fetching about cards:", error);
      res.status(500).json({ message: "Failed to fetch about cards" });
    }
  });

  app.put("/api/about-cards", async (req, res) => {
    try {
      const { sectionTitle, sectionDescription, cards } = req.body;

      const updates = [
        { key: 'about_section_title', value: sectionTitle, type: 'text' },
        { key: 'about_section_description', value: sectionDescription, type: 'text' },
        ...cards.flatMap((card: any, index: number) => [
          { key: `about_card_${index + 1}_title`, value: card.title, type: 'text' },
          { key: `about_card_${index + 1}_description`, value: card.description, type: 'text' },
          { key: `about_card_${index + 1}_icon`, value: card.icon, type: 'text' }
        ])
      ];

      // Update or insert each content item
      for (const update of updates) {
        const existing = await db.query.siteContent.findFirst({
          where: eq(siteContent.key, update.key)
        });

        if (existing) {
          await db.update(siteContent)
            .set({ value: update.value, updatedAt: new Date() })
            .where(eq(siteContent.key, update.key));
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

  const httpServer = createServer(app);
  return httpServer;
}