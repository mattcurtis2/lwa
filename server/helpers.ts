
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type SiteHeaderRequest = {
  header(name: string): string | undefined;
};

/**
 * Parse X-Site-ID for strict endpoints: missing/empty header defaults to site 1.
 * Invalid values return `{ ok: false }` so routes can respond with 400.
 */
export function parseSiteIdHeader(req: SiteHeaderRequest):
  | { ok: true; siteId: number }
  | { ok: false; error: string } {
  const raw = req.header("X-Site-ID");
  if (raw == null || String(raw).trim() === "") {
    return { ok: true, siteId: 1 };
  }
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    return { ok: false, error: "X-Site-ID must be a positive integer" };
  }
  return { ok: true, siteId: n };
}

// Get the site ID from the request header or default to 1 (Little Way Acres).
// Malformed X-Site-ID falls back to 1 for backward compatibility across existing routes.
export function getCurrentSiteId(req: any): number {
  const parsed = parseSiteIdHeader(req);
  if (parsed.ok) {
    return parsed.siteId;
  }
  return 1;
}

/**
 * Retry function with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in ms
 */
export async function retry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  initialDelay = 1000
): Promise<T> {
  let lastError: Error = new Error("Operation failed after maximum retries");
  let delay = initialDelay;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      lastError = error as Error;
      await sleep(delay);
      // Exponential backoff
      delay = delay * 2;
    }
  }
  
  throw lastError;
}
