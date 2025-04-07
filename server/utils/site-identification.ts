import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { sites } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Configure domains that should bypass site identification
const ADMIN_DOMAINS = ['localhost', '127.0.0.1'];
const DEFAULT_PORT = '3000';
const REPLIT_DOMAIN_SUFFIX = '.replit.app';

export interface Site {
  id: number;
  name: string;
  domain: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Middleware to identify the site based on domain
 */
export function siteIdentificationMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const host = req.hostname || '';
      const isLocalOrAdmin = ADMIN_DOMAINS.some(domain => host.includes(domain));
      
      // Skip site identification for admin domains
      if (isLocalOrAdmin || host.includes(REPLIT_DOMAIN_SUFFIX)) {
        req.site = null;
        return next();
      }

      // Extract the base domain
      let domainToCheck = host;
      if (host.includes(':')) {
        const parts = host.split(':');
        domainToCheck = parts[0];
      }

      // Query the database for the site
      const siteResult = await db
        .select()
        .from(sites)
        .where(eq(sites.domain, domainToCheck))
        .limit(1);

      if (siteResult.length > 0) {
        const site = siteResult[0];
        
        // Set the site in the request
        req.site = site;
      } else {
        // No site found for this domain
        req.site = null;
      }

      next();
    } catch (error) {
      console.error('Error in site identification middleware:', error);
      req.site = null;
      next();
    }
  };
}

/**
 * Get the site ID from the request
 */
export function getSiteId(req: Request): number | null {
  return req.site?.id || null;
}

/**
 * Get the site from the request
 */
export function getSite(req: Request): Site | null {
  return req.site || null;
}