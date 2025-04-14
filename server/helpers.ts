
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get the site ID from the request header or default to 1 (Little Way Acres)
export function getCurrentSiteId(req: any): number {
  const siteIdHeader = req.header('X-Site-ID');
  return siteIdHeader ? parseInt(siteIdHeader, 10) : 1;
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
