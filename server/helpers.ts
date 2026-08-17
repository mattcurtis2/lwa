
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (typeof value === "number" && !Number.isFinite(value)) return true;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "nan") return true;
  }
  return false;
}

export function emptyToNull(value: unknown): string | null {
  if (isEmptyValue(value)) return null;
  return String(value);
}

export function parseOptionalDecimal(value: unknown): string | null {
  if (isEmptyValue(value)) return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return String(n);
}

export function parseOptionalText(value: unknown): string | null {
  if (isEmptyValue(value)) return null;
  return String(value).trim();
}

export function parseOptionalIntId(value: unknown): number | null {
  if (isEmptyValue(value)) return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function pickAllowedFields(
  data: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  const allowed = new Set(keys);
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(data)) {
    if (allowed.has(key) && data[key] !== undefined) {
      out[key] = data[key];
    }
  }
  return out;
}

export function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const DOG_WRITE_FIELDS = [
  "siteId",
  "name",
  "registrationName",
  "breed",
  "gender",
  "birthDate",
  "description",
  "motherId",
  "fatherId",
  "litterId",
  "puppy",
  "available",
  "sold",
  "died",
  "display",
  "price",
  "profileImageUrl",
  "healthData",
  "color",
  "dewclaws",
  "furLength",
  "height",
  "weight",
  "pedigree",
  "narrativeDescription",
  "order",
  "outsideBreeder",
  "placementCity",
  "placementState",
] as const;

export const GOAT_WRITE_FIELDS = [
  "siteId",
  "name",
  "registrationName",
  "breed",
  "gender",
  "birthDate",
  "description",
  "motherId",
  "fatherId",
  "damName",
  "sireName",
  "litterId",
  "kid",
  "available",
  "sold",
  "died",
  "display",
  "price",
  "bucklingPrice",
  "wetherPrice",
  "profileImageUrl",
  "healthData",
  "color",
  "milkStars",
  "laArScores",
  "height",
  "weight",
  "pedigree",
  "narrativeDescription",
  "order",
  "outsideBreeder",
] as const;

export const SHEEP_WRITE_FIELDS = [
  "siteId",
  "name",
  "registrationName",
  "breed",
  "gender",
  "birthDate",
  "description",
  "motherId",
  "fatherId",
  "damName",
  "sireName",
  "litterId",
  "lamb",
  "available",
  "sold",
  "died",
  "display",
  "price",
  "ramPrice",
  "wetherPrice",
  "profileImageUrl",
  "healthData",
  "color",
  "fleeceType",
  "fleeceWeight",
  "height",
  "weight",
  "pedigree",
  "narrativeDescription",
  "order",
  "outsideBreeder",
] as const;

export const LITTER_WRITE_FIELDS = [
  "siteId",
  "dueDate",
  "motherId",
  "fatherId",
  "isVisible",
  "isCurrentLitter",
  "isPastLitter",
  "isPlannedLitter",
  "expectedBreedingDate",
  "expectedPickupDate",
  "waitlistLink",
] as const;

function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

export function buildDogWriteData(dogData: Record<string, unknown>): Record<string, unknown> {
  return pickAllowedFields(
    {
      siteId: typeof dogData.siteId === "number" ? dogData.siteId : 1,
      name: dogData.name,
      registrationName: emptyToNull(dogData.registrationName),
      breed: dogData.breed || "Colorado Mountain Dogs",
      gender: dogData.gender,
      birthDate: dogData.birthDate,
      description: emptyToNull(dogData.description),
      motherId: parseOptionalIntId(dogData.motherId),
      fatherId: parseOptionalIntId(dogData.fatherId),
      litterId: parseOptionalIntId(dogData.litterId),
      puppy: asBoolean(dogData.puppy),
      available: asBoolean(dogData.available),
      sold: asBoolean(dogData.sold),
      died: asBoolean(dogData.died),
      display: asBoolean(dogData.display),
      price: parseOptionalText(dogData.price),
      profileImageUrl: emptyToNull(dogData.profileImageUrl),
      healthData: emptyToNull(dogData.healthData),
      color: emptyToNull(dogData.color),
      dewclaws: emptyToNull(dogData.dewclaws),
      furLength: emptyToNull(dogData.furLength),
      height: parseOptionalDecimal(dogData.height),
      weight: parseOptionalDecimal(dogData.weight),
      pedigree: emptyToNull(dogData.pedigree),
      narrativeDescription: emptyToNull(dogData.narrativeDescription),
      order: typeof dogData.order === "number" ? dogData.order : undefined,
      outsideBreeder: asBoolean(dogData.outsideBreeder),
      placementCity: emptyToNull(dogData.placementCity),
      placementState: emptyToNull(dogData.placementState),
    },
    DOG_WRITE_FIELDS,
  );
}

export function buildGoatWriteData(goatData: Record<string, unknown>): Record<string, unknown> {
  return pickAllowedFields(
    {
      siteId: typeof goatData.siteId === "number" ? goatData.siteId : 1,
      name: goatData.name,
      registrationName: emptyToNull(goatData.registrationName),
      breed: goatData.breed || "Nigerian Dwarf",
      gender: goatData.gender,
      birthDate: goatData.birthDate,
      description: emptyToNull(goatData.description),
      motherId: parseOptionalIntId(goatData.motherId),
      fatherId: parseOptionalIntId(goatData.fatherId),
      damName: emptyToNull(goatData.damName),
      sireName: emptyToNull(goatData.sireName),
      litterId: parseOptionalIntId(goatData.litterId),
      kid: asBoolean(goatData.kid),
      available: asBoolean(goatData.available),
      sold: asBoolean(goatData.sold),
      died: asBoolean(goatData.died),
      display: asBoolean(goatData.display),
      price: parseOptionalText(goatData.price),
      bucklingPrice: parseOptionalText(goatData.bucklingPrice),
      wetherPrice: parseOptionalText(goatData.wetherPrice),
      profileImageUrl: emptyToNull(goatData.profileImageUrl),
      healthData: emptyToNull(goatData.healthData),
      color: emptyToNull(goatData.color),
      milkStars: emptyToNull(goatData.milkStars),
      laArScores: emptyToNull(goatData.laArScores),
      height: parseOptionalDecimal(goatData.height),
      weight: parseOptionalDecimal(goatData.weight),
      pedigree: emptyToNull(goatData.pedigree),
      narrativeDescription: emptyToNull(goatData.narrativeDescription),
      order: typeof goatData.order === "number" ? goatData.order : undefined,
      outsideBreeder: asBoolean(goatData.outsideBreeder),
    },
    GOAT_WRITE_FIELDS,
  );
}

export function buildSheepWriteData(sheepData: Record<string, unknown>): Record<string, unknown> {
  return pickAllowedFields(
    {
      siteId: typeof sheepData.siteId === "number" ? sheepData.siteId : 1,
      name: sheepData.name,
      registrationName: emptyToNull(sheepData.registrationName),
      breed: sheepData.breed || "Katahdin",
      gender: sheepData.gender,
      birthDate: sheepData.birthDate,
      description: emptyToNull(sheepData.description),
      motherId: parseOptionalIntId(sheepData.motherId),
      fatherId: parseOptionalIntId(sheepData.fatherId),
      damName: emptyToNull(sheepData.damName),
      sireName: emptyToNull(sheepData.sireName),
      litterId: parseOptionalIntId(sheepData.litterId),
      lamb: asBoolean(sheepData.lamb),
      available: asBoolean(sheepData.available),
      sold: asBoolean(sheepData.sold),
      died: asBoolean(sheepData.died),
      display: asBoolean(sheepData.display),
      price: parseOptionalText(sheepData.price),
      ramPrice: parseOptionalText(sheepData.ramPrice),
      wetherPrice: parseOptionalText(sheepData.wetherPrice),
      profileImageUrl: emptyToNull(sheepData.profileImageUrl),
      healthData: emptyToNull(sheepData.healthData),
      color: emptyToNull(sheepData.color),
      fleeceType: emptyToNull(sheepData.fleeceType),
      fleeceWeight: parseOptionalDecimal(sheepData.fleeceWeight),
      height: parseOptionalDecimal(sheepData.height),
      weight: parseOptionalDecimal(sheepData.weight),
      pedigree: emptyToNull(sheepData.pedigree),
      narrativeDescription: emptyToNull(sheepData.narrativeDescription),
      order: typeof sheepData.order === "number" ? sheepData.order : undefined,
      outsideBreeder: asBoolean(sheepData.outsideBreeder),
    },
    SHEEP_WRITE_FIELDS,
  );
}

export function buildLitterWriteData(data: Record<string, unknown>): Record<string, unknown> {
  return pickAllowedFields(
    {
      siteId: typeof data.siteId === "number" ? data.siteId : 1,
      dueDate: data.dueDate,
      motherId: parseOptionalIntId(data.motherId),
      fatherId: parseOptionalIntId(data.fatherId),
      isVisible: data.isVisible === undefined ? true : asBoolean(data.isVisible),
      isCurrentLitter: asBoolean(data.isCurrentLitter),
      isPastLitter: asBoolean(data.isPastLitter),
      isPlannedLitter: asBoolean(data.isPlannedLitter),
      expectedBreedingDate: emptyToNull(data.expectedBreedingDate),
      expectedPickupDate: emptyToNull(data.expectedPickupDate),
      waitlistLink: emptyToNull(data.waitlistLink),
    },
    LITTER_WRITE_FIELDS,
  );
}

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
