import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkColumns() {
  try {
    const dogsHeroColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dogs_hero'
      ORDER BY column_name
    `);
    
    console.log('dogs_hero columns:', JSON.stringify(dogsHeroColumns, null, 2));
    
    const dogsColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dogs'
      ORDER BY column_name
    `);
    
    console.log('dogs columns:', JSON.stringify(dogsColumns, null, 2));
  } catch (error) {
    console.error('Error checking columns:', error);
  }
}

checkColumns()
  .then(() => {
    console.log("Column check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Column check failed:", error);
    process.exit(1);
  });
