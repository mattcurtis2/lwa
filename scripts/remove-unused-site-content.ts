
import { db } from "@db";
import { siteContent } from "@db/schema";
import { eq } from "drizzle-orm";
import prompts from "prompts";

// List of keys to be kept regardless of usage analysis
const ESSENTIAL_KEYS = [
  'logo', 
  'hero_background', 
  'hero_text', 
  'hero_subtext',
  'og_image',
  // Add any other keys you want to keep here
];

// Keys that seem to be used in page sections
const CONTENT_SECTION_KEYS = [
  'animals_title', 'animals_text', 'animals_image', 'animals_button_text', 'animals_redirect',
  'bakery_title', 'bakery_text', 'bakery_image', 'bakery_button_text', 'bakery_redirect',
  'products_title', 'products_text', 'products_image', 'products_button_text', 'products_redirect',
  'mission_title', 'mission_text',
  'about_title', 'about_text'
];

// Keys likely used for page-specific content
const PAGE_SPECIFIC_KEYS = [
  'dog_hero_image', 'dogs_page_description', 'dogs_breeding_program',
  'goat_hero_image', 'goat_hero_title',
  'market_hero_image', 'market_page_title', 'market_description'
];

// Keys that appear to be for the about cards feature
const ABOUT_CARD_KEYS = [
  'about_section_title', 'about_section_description',
  'about_card_1_title', 'about_card_1_description', 'about_card_1_icon',
  'about_card_2_title', 'about_card_2_description', 'about_card_2_icon',
  'about_card_3_title', 'about_card_3_description', 'about_card_3_icon'
];

// Keys that appear to be for principles section
const PRINCIPLES_KEYS = [
  'principles_title', 'principles_description'
];

// Likely unused or deprecated keys
const POTENTIALLY_UNUSED_KEYS = [
  'market_title', 'market_text' // These seem to have been replaced by market_page_title and market_description
];

async function removeUnusedSiteContent() {
  try {
    // Get all site content
    const allContent = await db.query.siteContent.findMany();
    console.log(`Found ${allContent.length} site content entries in database`);
    
    // Group content by category
    const contentByCategory = {
      essential: allContent.filter(c => ESSENTIAL_KEYS.includes(c.key)),
      contentSections: allContent.filter(c => CONTENT_SECTION_KEYS.includes(c.key)),
      pageSpecific: allContent.filter(c => PAGE_SPECIFIC_KEYS.includes(c.key)),
      aboutCards: allContent.filter(c => ABOUT_CARD_KEYS.includes(c.key)),
      principles: allContent.filter(c => PRINCIPLES_KEYS.includes(c.key)),
      potentiallyUnused: allContent.filter(c => POTENTIALLY_UNUSED_KEYS.includes(c.key)),
      other: allContent.filter(c => 
        !ESSENTIAL_KEYS.includes(c.key) && 
        !CONTENT_SECTION_KEYS.includes(c.key) &&
        !PAGE_SPECIFIC_KEYS.includes(c.key) &&
        !ABOUT_CARD_KEYS.includes(c.key) &&
        !PRINCIPLES_KEYS.includes(c.key) &&
        !POTENTIALLY_UNUSED_KEYS.includes(c.key)
      )
    };
    
    // Display content by category
    console.log("\n=== CONTENT ORGANIZATION ===");
    Object.entries(contentByCategory).forEach(([category, items]) => {
      console.log(`\n${category} (${items.length} items):`);
      items.forEach(item => {
        console.log(`  ID: ${item.id}, Key: ${item.key}, Type: ${item.type}`);
      });
    });
    
    // Ask user which categories to remove
    const potentiallyUnusedCount = contentByCategory.potentiallyUnused.length;
    
    if (potentiallyUnusedCount === 0) {
      console.log("\nNo potentially unused content identified.");
      return;
    }
    
    const confirmation = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Do you want to remove the ${potentiallyUnusedCount} potentially unused items?`,
      initial: false
    });
    
    if (!confirmation.proceed) {
      console.log("Operation cancelled.");
      return;
    }
    
    // Remove confirmed unused items
    const unusedIds = contentByCategory.potentiallyUnused.map(item => item.id);
    
    for (const id of unusedIds) {
      const item = await db.query.siteContent.findFirst({
        where: eq(siteContent.id, id)
      });
      
      if (item) {
        await db.delete(siteContent).where(eq(siteContent.id, id));
        console.log(`Deleted: ID: ${id}, Key: ${item.key}`);
      }
    }
    
    console.log(`\nRemoved ${unusedIds.length} unused site content items.`);
    
    // Ask if user wants to remove empty about cards
    const emptyAboutCards = contentByCategory.aboutCards.filter(
      item => item.value === "" || item.value === null
    );
    
    if (emptyAboutCards.length > 0) {
      const confirmAboutCards = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: `Do you want to remove ${emptyAboutCards.length} empty about card entries?`,
        initial: false
      });
      
      if (confirmAboutCards.proceed) {
        for (const item of emptyAboutCards) {
          await db.delete(siteContent).where(eq(siteContent.id, item.id));
          console.log(`Deleted empty about card: ID: ${item.id}, Key: ${item.key}`);
        }
        console.log(`\nRemoved ${emptyAboutCards.length} empty about card entries.`);
      }
    }
  } catch (error) {
    console.error("Error removing unused site content:", error);
  }
}

// Run the removal process
removeUnusedSiteContent().then(() => {
  console.log("\nOperation completed successfully.");
  process.exit(0);
}).catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
