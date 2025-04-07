import { db } from "../db";
import { sql } from "drizzle-orm";

async function fixImageColumns() {
  console.log("Starting image column fixes...");

  try {
    // Check if dogs_hero.imageUrl exists and needs to be renamed to image_url
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dogs_hero' AND column_name = 'imagurl'
    `);

    if (result.length > 0) {
      console.log("Renaming imageUrl to image_url in dogs_hero table");
      await db.execute(sql`ALTER TABLE dogs_hero RENAME COLUMN "imageurl" TO "image_url"`);
    } else {
      console.log("Column image_url already exists in dogs_hero table or imageUrl doesn't exist");
    }

    // Check if dogs.profileImageUrl exists and needs to be renamed to profile_image_url
    const dogsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dogs' AND column_name = 'profileimageurl'
    `);

    if (dogsResult.length > 0) {
      console.log("Renaming profileImageUrl to profile_image_url in dogs table");
      await db.execute(sql`ALTER TABLE dogs RENAME COLUMN "profileimageurl" TO "profile_image_url"`);
    } else {
      console.log("Column profile_image_url already exists in dogs table or profileImageUrl doesn't exist");
    }

    // Check if principles.imageUrl exists and needs to be renamed to image_url
    const principlesResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'principles' AND column_name = 'imageurl'
    `);

    if (principlesResult.length > 0) {
      console.log("Renaming imageUrl to image_url in principles table");
      await db.execute(sql`ALTER TABLE principles RENAME COLUMN "imageurl" TO "image_url"`);
    } else {
      console.log("Column image_url already exists in principles table or imageUrl doesn't exist");
    }

    // Check if goats.profileImageUrl exists and needs to be renamed to profile_image_url
    const goatsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'goats' AND column_name = 'profileimageurl'
    `);

    if (goatsResult.length > 0) {
      console.log("Renaming profileImageUrl to profile_image_url in goats table");
      await db.execute(sql`ALTER TABLE goats RENAME COLUMN "profileimageurl" TO "profile_image_url"`);
    } else {
      console.log("Column profile_image_url already exists in goats table or profileImageUrl doesn't exist");
    }

    // Check if market_sections.imageUrl exists and needs to be renamed to image_url
    const marketSectionsResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'market_sections' AND column_name = 'imageurl'
    `);

    if (marketSectionsResult.length > 0) {
      console.log("Renaming imageUrl to image_url in market_sections table");
      await db.execute(sql`ALTER TABLE market_sections RENAME COLUMN "imageurl" TO "image_url"`);
    } else {
      console.log("Column image_url already exists in market_sections table or imageUrl doesn't exist");
    }

    console.log("Image column fixes completed successfully");
  } catch (error) {
    console.error("Error fixing image columns:", error);
    throw error;
  }
}

fixImageColumns()
  .then(() => {
    console.log("Image column fixes script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Image column fixes script failed:", error);
    process.exit(1);
  });