
import { db } from "@db";
import { siteContent } from "@db/schema";

async function checkUnusedSiteContent() {
  try {
    // Get all site content
    const allContent = await db.query.siteContent.findMany();
    console.log(`Found ${allContent.length} site content entries in database`);
    
    // Organize data by categories
    const emptyContent = allContent.filter(item => item.value === "" || item.value === null);
    
    // Check for about card entries that are empty
    const aboutCardItems = allContent.filter(item => 
      item.key.startsWith('about_card_') && (item.value === "" || item.value === null)
    );
    
    // Check potentially replaced items
    const potentiallyUnused = allContent.filter(item => 
      item.key === 'market_title' || 
      item.key === 'market_text' || 
      (item.key.includes('_title') && allContent.some(other => 
        other.key === item.key.replace('_title', '_page_title')
      ))
    );
    
    // Display usage info
    console.log("\n=== CONTENT USAGE ANALYSIS ===");
    
    console.log(`\nEmpty Content (${emptyContent.length} items):`);
    emptyContent.forEach(item => {
      console.log(`  ID: ${item.id}, Key: ${item.key}`);
    });
    
    console.log(`\nEmpty About Card Entries (${aboutCardItems.length} items):`);
    aboutCardItems.forEach(item => {
      console.log(`  ID: ${item.id}, Key: ${item.key}`);
    });
    
    console.log(`\nPotentially Unused/Replaced Content (${potentiallyUnused.length} items):`);
    potentiallyUnused.forEach(item => {
      console.log(`  ID: ${item.id}, Key: ${item.key}, Value: ${item.value.substring(0, 30)}${item.value.length > 30 ? '...' : ''}`);
    });
    
    // Check duplicate functionality
    const seenKeys = new Set();
    const duplicateFunctionality = [];
    
    // Check for pattern pairs like 'xxx_title' and 'xxx_page_title' where one might be replacing the other
    allContent.forEach(item => {
      const baseKey = item.key.replace('_page_', '_').replace('_section_', '_');
      if (seenKeys.has(baseKey) && baseKey !== item.key) {
        duplicateFunctionality.push({
          id: item.id,
          key: item.key,
          possibleDuplicate: baseKey
        });
      }
      seenKeys.add(baseKey);
      seenKeys.add(item.key);
    });
    
    console.log(`\nPossible Duplicate Functionality (${duplicateFunctionality.length} items):`);
    duplicateFunctionality.forEach(item => {
      console.log(`  ID: ${item.id}, Key: ${item.key}, Possible duplicate of: ${item.possibleDuplicate}`);
    });
    
  } catch (error) {
    console.error("Error checking unused site content:", error);
  }
}

// Run the check
checkUnusedSiteContent().then(() => {
  console.log("\nCheck completed successfully.");
  process.exit(0);
}).catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
