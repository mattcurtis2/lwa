import { db } from '../../db';
import { 
  siteContent,
  carouselItems,
  principles,
  contactInfo,
  dogs,
  goats,
  litters,
  goatLitters,
  marketSections,
  marketSchedules,
  products,
  dogsHero
} from '../../db/schema';
import { eq, isNull, and } from 'drizzle-orm';

// Function to filter queries by site
export function filterBySite(siteId: number | null, table: any) {
  if (siteId) {
    return eq(table.siteId, siteId);
  } else {
    // For backward compatibility with existing data
    return isNull(table.siteId);
  }
}

// Get site content by key
export async function getSiteContentByKey(key: string, siteId: number | null) {
  try {
    const contentResults = await db
      .select()
      .from(siteContent)
      .where(and(
        eq(siteContent.key, key),
        filterBySite(siteId, siteContent)
      ));
    return contentResults.length > 0 ? contentResults[0] : null;
  } catch (error) {
    console.error(`Error fetching site content for key ${key}:`, error);
    return null;
  }
}

// Get all site content
export async function getAllSiteContent(siteId: number | null) {
  try {
    return await db
      .select()
      .from(siteContent)
      .where(filterBySite(siteId, siteContent));
  } catch (error) {
    console.error('Error fetching all site content:', error);
    return [];
  }
}

// Get carousel items
export async function getCarouselItems(siteId: number | null) {
  try {
    return await db
      .select()
      .from(carouselItems)
      .where(filterBySite(siteId, carouselItems))
      .orderBy(carouselItems.order);
  } catch (error) {
    console.error('Error fetching carousel items:', error);
    return [];
  }
}

// Get principles
export async function getPrinciples(siteId: number | null) {
  try {
    return await db
      .select()
      .from(principles)
      .where(filterBySite(siteId, principles))
      .orderBy(principles.order);
  } catch (error) {
    console.error('Error fetching principles:', error);
    return [];
  }
}

// Get contact info
export async function getContactInfo(siteId: number | null) {
  try {
    const results = await db
      .select()
      .from(contactInfo)
      .where(filterBySite(siteId, contactInfo));
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}

// Get market sections
export async function getMarketSections(siteId: number | null) {
  try {
    return await db
      .select()
      .from(marketSections)
      .where(filterBySite(siteId, marketSections))
      .orderBy(marketSections.order);
  } catch (error) {
    console.error('Error fetching market sections:', error);
    return [];
  }
}

// Get market schedules
export async function getMarketSchedules(siteId: number | null) {
  try {
    return await db
      .select()
      .from(marketSchedules)
      .where(filterBySite(siteId, marketSchedules))
      .orderBy(marketSchedules.order);
  } catch (error) {
    console.error('Error fetching market schedules:', error);
    return [];
  }
}

// Get products for a section
export async function getProductsBySection(section: string, siteId: number | null) {
  try {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.section, section),
        filterBySite(siteId, products)
      ))
      .orderBy(products.order);
  } catch (error) {
    console.error(`Error fetching products for section ${section}:`, error);
    return [];
  }
}

// Get dogs with filter options
export async function getDogs(
  options: {
    siteId: number | null,
    available?: boolean,
    puppy?: boolean,
    limit?: number,
  }
) {
  try {
    let query = db
      .select()
      .from(dogs)
      .where(filterBySite(options.siteId, dogs));
    
    if (options.available !== undefined) {
      query = query.where(eq(dogs.available, options.available));
    }
    
    if (options.puppy !== undefined) {
      query = query.where(eq(dogs.puppy, options.puppy));
    }
    
    query = query.orderBy(dogs.order);
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return [];
  }
}

// Get goats with filter options
export async function getGoats(
  options: {
    siteId: number | null,
    available?: boolean,
    kid?: boolean,
    limit?: number,
  }
) {
  try {
    let query = db
      .select()
      .from(goats)
      .where(filterBySite(options.siteId, goats));
    
    if (options.available !== undefined) {
      query = query.where(eq(goats.available, options.available));
    }
    
    if (options.kid !== undefined) {
      query = query.where(eq(goats.kid, options.kid));
    }
    
    query = query.orderBy(goats.order);
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return await query;
  } catch (error) {
    console.error('Error fetching goats:', error);
    return [];
  }
}

// Get dog litters
export async function getDogLitters(siteId: number | null, onlyVisible: boolean = true) {
  try {
    let query = db
      .select()
      .from(litters)
      .where(filterBySite(siteId, litters));
      
    if (onlyVisible) {
      query = query.where(eq(litters.isVisible, true));
    }
    
    return await query;
  } catch (error) {
    console.error('Error fetching dog litters:', error);
    return [];
  }
}

// Get goat litters
export async function getGoatLitters(siteId: number | null, onlyVisible: boolean = true) {
  try {
    let query = db
      .select()
      .from(goatLitters)
      .where(filterBySite(siteId, goatLitters));
      
    if (onlyVisible) {
      query = query.where(eq(goatLitters.isVisible, true));
    }
    
    return await query;
  } catch (error) {
    console.error('Error fetching goat litters:', error);
    return [];
  }
}

// Get dogs hero content
export async function getDogsHero(siteId: number | null) {
  try {
    const results = await db
      .select()
      .from(dogsHero)
      .where(filterBySite(siteId, dogsHero));
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Error fetching dogs hero:', error);
    return null;
  }
}