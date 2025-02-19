
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
  try {
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed!', error);
    process.exit(1);
  }
};

main();
