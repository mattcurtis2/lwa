import { db } from "../db";
import { sites, siteContent, animals, products, contactInfo, principles } from "../db/schema";
import dotenv from "dotenv";
import { eq, sql } from "drizzle-orm";

// Load environment variables
dotenv.config();

// Create site data for Crack O' Noon Farm based on real website content
async function createCrackONoonFarm() {
  console.log("Starting creation of Crack O' Noon Farm data...");

  try {
    // Check if site already exists
    const existingSite = await db.select().from(sites).where(eq(sites.domain, "crackonoonfarm.com"));
    
    if (existingSite.length > 0) {
      console.log("Crack O' Noon Farm site already exists, skipping creation");
      return;
    }

    // 1. Create the site - Let's log the query that's being generated
    console.log("Checking sites table structure...");
    const siteColumns = await db.execute(sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'sites'`);
    console.log("Site columns:", siteColumns);
    
    const now = new Date();
    const [site] = await db.insert(sites).values({
      name: "Crack O' Noon Farm",
      domain: "crackonoonfarm.com",
      logo_url: "https://crackonoonfarm.com/wp-content/uploads/2021/04/CONLOGO_2018-2.png",
      favicon_url: "https://crackonoonfarm.com/wp-content/uploads/2021/04/favicon.ico",
      primary_color: "#5e7b3b", // A green color from their website
      created_at: now,
      updated_at: now,
    }).returning();

    console.log("Created site:", site);

    // 2. Add site content
    for (const content of [
      {
        key: "home_hero_title",
        value: "Welcome to Crack O' Noon Farm",
        type: "text",
      },
      {
        key: "home_hero_subtitle",
        value: "A family farm nestled in the foothills of New Mexico's East Mountains",
        type: "text",
      },
      {
        key: "home_section_1_title",
        value: "Our Farm",
        type: "text",
      },
      {
        key: "home_section_1_content",
        value: "Crack O' Noon Farm is a small family farm located in the beautiful East Mountains outside of Albuquerque, New Mexico. We specialize in heritage and rare breeds, focusing on natural living and sustainable practices. Our farm is home to Navajo-Churro sheep, Angora rabbits, and other fiber animals that provide us with wonderful wool and fiber for handcrafting.",
        type: "text",
      },
      {
        key: "home_section_2_title",
        value: "Our Animals",
        type: "text",
      },
      {
        key: "home_section_2_content",
        value: "At Crack O' Noon Farm, we raise heritage Navajo-Churro sheep, the oldest breed of domesticated sheep in North America. These hardy animals are well-adapted to our high desert climate and provide beautiful, distinctive wool. We also raise Angora rabbits for their luxurious fiber, as well as chickens and other farm animals that contribute to our sustainable lifestyle.",
        type: "text",
      },
      {
        key: "home_section_3_title",
        value: "Our Fiber Arts",
        type: "text",
      },
      {
        key: "home_section_3_content",
        value: "We take pride in producing beautiful handcrafted items from our farm-raised fibers. From raw wool to finished yarns, woven goods, and felted items, we participate in the entire process. Our farm store offers a variety of fiber products, including raw fleece, roving, handspun yarns, woven rugs, and more.",
        type: "text",
      },
      {
        key: "about_page_content",
        value: "Founded in 2005, Crack O' Noon Farm (named for our relaxed morning routine) is a small family farm specializing in heritage breeds and sustainable practices. Located at over 7,000 feet elevation in the East Mountains, we work with nature to maintain our land and animals with environmentally conscious methods. We raise Navajo-Churro sheep, Angora rabbits, and focus on fiber arts including spinning, weaving, and felting. Our farm is also home to various heritage breed chickens, ducks, and other animals that contribute to our farm ecosystem.",
        type: "text",
      },
      {
        key: "footer_text",
        value: "© 2025 Crack O' Noon Farm | Located in the East Mountains near Albuquerque, NM",
        type: "text",
      },
    ]) {
      await db.insert(siteContent).values({
        key: content.key,
        value: content.value,
        type: content.type,
        siteId: site.id,
        updatedAt: now,
      });
    }

    console.log("Added site content");

    // 3. Add contact info
    await db.insert(contactInfo).values({
      email: "info@crackonoonfarm.com",
      phone: "(505) 555-1234",
      facebook: "https://www.facebook.com/CrackONoonFarm/",
      instagram: "https://www.instagram.com/crackonoonfarm/",
      siteId: site.id,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Added contact info");

    // 4. Add farm principles
    for (const principle of [
      {
        title: "Heritage Breeds Conservation",
        description: "We're committed to preserving rare and heritage breeds like the Navajo-Churro sheep, helping to maintain genetic diversity and cultural heritage.",
        order: 1,
      },
      {
        title: "Sustainable Farming",
        description: "Our farming practices work with the natural environment, using rotational grazing, organic methods, and water conservation techniques suited to our high desert location.",
        order: 2,
      },
      {
        title: "Traditional Fiber Arts",
        description: "We honor traditional fiber crafts from sheep to finished product, including shearing, spinning, weaving, and felting using methods passed down through generations.",
        order: 3,
      },
      {
        title: "Education",
        description: "Sharing knowledge about fiber arts, sustainable farming, and heritage breeds is central to our mission through workshops, demonstrations, and farm visits.",
        order: 4,
      }
    ]) {
      await db.insert(principles).values({
        title: principle.title,
        description: principle.description,
        imageUrl: "https://example.com/placeholder-principle.jpg", // Required field
        order: principle.order,
        siteId: site.id,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log("Added farm principles");

    // 5. Add animals (sample Navajo-Churro sheep)
    for (const animal of [
      {
        name: "Merlin",
        description: "Multi-horned Navajo-Churro ram with stunning black and white fleece. Merlin has excellent conformation and produces offspring with exceptional wool quality.",
        breed: "Navajo-Churro",
        available: false,
        imageUrl: "https://example.com/placeholder-sheep-1.jpg",
      },
      {
        name: "Aurora",
        description: "Beautiful Navajo-Churro ewe with rare natural blue-gray fleece. Aurora is a gentle mother and consistently produces twins with excellent fiber qualities.",
        breed: "Navajo-Churro",
        available: false,
        imageUrl: "https://example.com/placeholder-sheep-2.jpg",
      },
      {
        name: "Thunder",
        description: "Young Navajo-Churro ram with impressive four-horn pattern and rich brown fleece with white markings. Thunder has excellent conformation and fiber quality.",
        breed: "Navajo-Churro",
        available: true,
        imageUrl: "https://example.com/placeholder-sheep-3.jpg",
      },
      {
        name: "Snowflake",
        description: "Pure white Navajo-Churro ewe lamb with exceptional wool quality. Snowflake comes from a line of ewes known for their excellent mothering abilities and consistent twins.",
        breed: "Navajo-Churro",
        available: true,
        imageUrl: "https://example.com/placeholder-sheep-4.jpg",
      }
    ]) {
      await db.insert(animals).values({
        name: animal.name,
        type: "sheep", // Required field
        description: animal.description,
        breed: animal.breed,
        imageUrl: animal.imageUrl,
        isAvailable: animal.available,
        siteId: site.id,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log("Added animals");

    // 6. Add products (fiber items)
    for (const product of [
      {
        name: "Natural Churro Wool Roving",
        description: "Beautiful Navajo-Churro wool roving ready for spinning or felting. Available in natural colors including white, gray, brown, and black. 4 oz bundles.",
        price: "15.00",
        imageUrl: "https://example.com/placeholder-roving.jpg",
        available: true,
      },
      {
        name: "Handspun Churro Yarn",
        description: "Handspun yarn made from our Navajo-Churro sheep wool. Each skein is approximately 100 yards of worsted weight yarn in natural colors.",
        price: "28.00",
        imageUrl: "https://example.com/placeholder-yarn.jpg",
        available: true,
      },
      {
        name: "Raw Churro Fleece",
        description: "Whole raw fleeces from our Navajo-Churro sheep. Each fleece weighs between 3-5 pounds and comes skirted and ready for washing.",
        price: "35.00",
        imageUrl: "https://example.com/placeholder-fleece.jpg",
        available: true,
      },
      {
        name: "Hand-Woven Rug",
        description: "Traditional-style rugs hand-woven on our farm using our Navajo-Churro wool. Each rug is unique with natural colors and traditional patterns. Size approximately 2' x 3'.",
        price: "225.00",
        imageUrl: "https://example.com/placeholder-rug.jpg",
        available: true,
      },
      {
        name: "Angora Rabbit Fiber",
        description: "Soft, luxurious angora fiber from our Angora rabbits. Perfect for adding to spinning blends or special felting projects. Available in 1 oz packages.",
        price: "12.00",
        imageUrl: "https://example.com/placeholder-angora.jpg",
        available: true,
      }
    ]) {
      await db.insert(products).values({
        name: product.name,
        section: "animal_products", // Required field
        category: "fiber", // Required field
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        inStock: product.available,
        siteId: site.id,
        createdAt: now,
        updatedAt: now,
      });
    }

    console.log("Added products");

    console.log("Successfully created Crack O' Noon Farm data!");
  } catch (error) {
    console.error("Error creating test farm data:", error);
    throw error;
  }
}

// Run the function
createCrackONoonFarm()
  .then(() => {
    console.log("Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });