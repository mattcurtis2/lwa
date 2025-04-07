import { db } from '../db/index';
import { sites, carouselItems, animals, products, dogsHero, dogs, litters, principles, contactInfo, goats, goatLitters, marketSections, marketSchedules } from '../db/schema';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Starting migration...');

  try {
    // Create sites table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sites (
        id SERIAL PRIMARY KEY,
        domain TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        logo_url TEXT,
        favicon_url TEXT,
        primary_color TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Created sites table (if it didn\'t exist)');

    // Add siteId column to existing tables if not already present
    const tables = [
      { name: 'carousel_items', column: 'site_id' },
      { name: 'animals', column: 'site_id' },
      { name: 'products', column: 'site_id' },
      { name: 'dogs_hero', column: 'site_id' },
      { name: 'dogs', column: 'site_id' },
      { name: 'litters', column: 'site_id' },
      { name: 'principles', column: 'site_id' },
      { name: 'contact_info', column: 'site_id' },
      { name: 'goats', column: 'site_id' },
      { name: 'goat_litters', column: 'site_id' },
      { name: 'market_sections', column: 'site_id' },
      { name: 'market_schedules', column: 'site_id' }
    ];

    for (const table of tables) {
      try {
        // Check if column exists
        const columnExists = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${table.name} 
          AND column_name = ${table.column};
        `);

        if ((columnExists as any[]).length === 0) {
          await db.execute(sql`
            ALTER TABLE ${sql.identifier(table.name)} 
            ADD COLUMN ${sql.identifier(table.column)} INTEGER REFERENCES sites(id);
          `);
          console.log(`Added ${table.column} to ${table.name} table`);
        } else {
          console.log(`Column ${table.column} already exists in ${table.name} table`);
        }
      } catch (err) {
        console.error(`Error adding column to ${table.name}:`, err);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate().catch(console.error);