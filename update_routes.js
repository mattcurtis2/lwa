const fs = require('fs');

// Read the original file
const routesFilePath = 'server/routes.ts';
let content = fs.readFileSync(routesFilePath, 'utf8');

// Find all occurrences of past litters endpoint and keep track of their positions
const pastLittersPattern = /app\.get\("\/api\/litters\/list\/past", async \(_req, res\) => {/g;
let matches = [...content.matchAll(pastLittersPattern)];

if (matches.length >= 1) {
  // Get the position of the second occurrence
  if (matches.length > 1) {
    // There are duplicate endpoints, remove the first one
    const firstPastLittersIndex = matches[0].index;

    // Find the end of the first endpoint
    const endOfFirstEndpoint = content.indexOf('});', firstPastLittersIndex);
    const nextEndpointStart = content.indexOf('app.get', endOfFirstEndpoint);
    
    // Remove the first occurrence
    content = content.substring(0, firstPastLittersIndex) + 
              '// Removed duplicate past litters endpoint\n' + 
              content.substring(nextEndpointStart);
              
    console.log('Removed duplicate endpoint');
  }
  
  // Now update the remaining past litters endpoint
  const remainingPastLittersPattern = /app\.get\("\/api\/litters\/list\/past", async \(_req, res\) => {\s+try {\s+const allLitters = await db\.query\.litters\.findMany\({\s+with: {/;
  
  const replacement = `app.get("/api/litters/list/past", async (req, res) => {
    try {
      const siteId = getCurrentSiteId(req);
      const allLitters = await db.query.litters.findMany({
        where: and(
          eq(litters.siteId, siteId),
          eq(litters.isVisible, true),
          eq(litters.isPastLitter, true)
        ),
        with: {`;
  
  content = content.replace(remainingPastLittersPattern, replacement);
  console.log('Updated past litters endpoint');
}

// Write the updated content back to the file
fs.writeFileSync(routesFilePath, content);
console.log('File updated successfully');
