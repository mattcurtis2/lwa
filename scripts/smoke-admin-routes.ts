const BASE = process.env.ADMIN_SMOKE_BASE || "http://127.0.0.1:5001";

type Result = { name: string; ok: boolean; status: number; detail?: string };

const cookieJar = new Map<string, string>();

function storeCookies(res: Response) {
  const raw = typeof res.headers.getSetCookie === "function"
    ? res.headers.getSetCookie()
    : [];
  for (const header of raw) {
    const [pair] = header.split(";");
    const eq = pair.indexOf("=");
    if (eq > 0) cookieJar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
}

function cookieHeader() {
  return [...cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function request(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      Cookie: cookieHeader(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  storeCookies(res);
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { res, json, text };
}

async function check(
  results: Result[],
  name: string,
  method: string,
  path: string,
  body?: unknown,
  expectOk = true,
) {
  try {
    const { res, json, text } = await request(method, path, body);
    const ok = expectOk ? res.ok : true;
    const detail = ok
      ? undefined
      : (typeof json === "object" && json
          ? JSON.stringify(json).slice(0, 300)
          : text.slice(0, 300));
    results.push({ name: `${method} ${path} (${name})`, ok, status: res.status, detail });
    return { res, json };
  } catch (error) {
    results.push({
      name: `${method} ${path} (${name})`,
      ok: false,
      status: 0,
      detail: error instanceof Error ? error.message : String(error),
    });
    return { res: null, json: null };
  }
}

function first(list: unknown): any | null {
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

async function main() {
  const results: Result[] = [];

  const login = await request("POST", "/api/auth/login", {
    username: "LWA",
    password: "Tecumseh1-",
  });
  results.push({
    name: "POST /api/auth/login",
    ok: login.res.ok && login.json?.success === true,
    status: login.res.status,
    detail: login.res.ok ? undefined : JSON.stringify(login.json),
  });

  const gets: [string, string][] = [
    ["auth status", "/api/auth/status"],
    ["sites", "/api/sites"],
    ["dogs admin", "/api/dogs?admin=true"],
    ["litters", "/api/litters"],
    ["litters current", "/api/litters/list/current"],
    ["litters future", "/api/litters/list/future"],
    ["litters past", "/api/litters/list/past"],
    ["goats admin", "/api/goats?admin=true"],
    ["goat litters", "/api/goat-litters"],
    ["goat litters current", "/api/goat-litters/list/current"],
    ["goat litters past", "/api/goat-litters/list/past"],
    ["sheep admin", "/api/sheep/admin"],
    ["sheep", "/api/sheep?admin=true"],
    ["sheep litters", "/api/sheep-litters"],
    ["sheep litters current", "/api/sheep-litters/list/current"],
    ["sheep litters past", "/api/sheep-litters/list/past"],
    ["site content", "/api/site-content"],
    ["principles", "/api/principles"],
    ["carousel", "/api/carousel"],
    ["dogs hero", "/api/dogs-hero"],
    ["about cards", "/api/about-cards"],
    ["about cards old", "/api/about-cards-old"],
    ["theme", "/api/theme"],
    ["contact info", "/api/contact-info"],
    ["market sections", "/api/market-sections"],
    ["market schedules", "/api/market-schedules"],
    ["products", "/api/products"],
    ["gallery photos", "/api/gallery-photos"],
    ["orders", "/api/orders"],
    ["orders summary", "/api/orders/summary?env=live"],
    ["printify products", "/api/printify/products"],
    ["animals", "/api/animals"],
    ["missing admin upload", "/api/admin/upload-principle-image-base64"],
  ];

  let dogs: any[] = [];
  let goats: any[] = [];
  let sheep: any[] = [];
  let dogLitters: any[] = [];
  let goatLitters: any[] = [];
  let sheepLitters: any[] = [];
  let principles: any[] = [];
  let carousel: any[] = [];
  let products: any[] = [];
  let schedules: any[] = [];
  let gallery: any[] = [];
  let hero: any[] = [];
  let aboutCards: any = null;
  let aboutCardsOld: any[] = [];
  let siteContent: any[] = [];
  let marketSections: any[] = [];

  for (const [name, path] of gets) {
    const method = path.includes("upload-principle") ? "POST" : "GET";
    const expectOk = !path.includes("upload-principle");
    const { json } = await check(
      results,
      name,
      method,
      path,
      method === "POST" ? {} : undefined,
      expectOk,
    );
    if (path.includes("upload-principle")) {
      const last = results[results.length - 1];
      last.ok = last.status === 400;
      last.detail = last.ok ? "expected 400 without image" : last.detail;
    }
    if (path.startsWith("/api/dogs?")) dogs = json || [];
    if (path.startsWith("/api/goats?")) goats = json || [];
    if (path === "/api/sheep/admin") sheep = json || [];
    if (path === "/api/litters") dogLitters = json || [];
    if (path === "/api/goat-litters") goatLitters = json || [];
    if (path === "/api/sheep-litters") sheepLitters = json || [];
    if (path === "/api/principles") principles = json || [];
    if (path === "/api/carousel") carousel = json || [];
    if (path === "/api/products") products = json || [];
    if (path === "/api/market-schedules") schedules = json || [];
    if (path === "/api/gallery-photos") gallery = json || [];
    if (path === "/api/dogs-hero") hero = json || [];
    if (path === "/api/about-cards") aboutCards = json;
    if (path === "/api/about-cards-old") aboutCardsOld = json || [];
    if (path === "/api/site-content") siteContent = json || [];
    if (path === "/api/market-sections") marketSections = json || [];
  }

  const dog = first(dogs);
  if (dog) {
    await check(results, "round-trip dog", "PUT", `/api/dogs/${dog.id}`, {
      name: dog.name,
      registrationName: dog.registrationName,
      birthDate: dog.birthDate,
      gender: dog.gender,
      display: dog.display === true,
      puppy: dog.puppy === true,
      available: dog.available === true,
      sold: dog.sold === true,
      died: dog.died === true,
      outsideBreeder: dog.outsideBreeder === true,
      price: dog.price,
      height: dog.height,
      weight: dog.weight,
      description: dog.description,
      profileImageUrl: dog.profileImageUrl,
      media: (dog.media || []).map((m: any) => ({ url: m.url, type: m.type })),
      documents: (dog.documents || []).map((d: any) => ({
        url: d.url,
        type: d.type,
        name: d.name,
        mimeType: d.mimeType,
      })),
    });
  }

  const goat = first(goats);
  if (goat) {
    await check(results, "round-trip goat", "PUT", `/api/goats/${goat.id}`, {
      name: goat.name,
      registrationName: goat.registrationName,
      birthDate: goat.birthDate,
      gender: goat.gender,
      breed: goat.breed,
      display: goat.display === true,
      kid: goat.kid === true,
      available: goat.available === true,
      sold: goat.sold === true,
      died: goat.died === true,
      outsideBreeder: goat.outsideBreeder === true,
      price: goat.price,
      media: (goat.media || []).map((m: any) => ({ url: m.url, type: m.type })),
      documents: (goat.documents || []).map((d: any) => ({
        url: d.url,
        type: d.type,
        name: d.name,
        mimeType: d.mimeType,
      })),
    });
  }

  const sheepItem = first(sheep);
  if (sheepItem) {
    await check(results, "round-trip sheep", "PUT", `/api/sheep/${sheepItem.id}`, {
      name: sheepItem.name,
      registrationName: sheepItem.registrationName,
      birthDate: sheepItem.birthDate,
      gender: sheepItem.gender,
      breed: sheepItem.breed,
      display: sheepItem.display === true,
      lamb: sheepItem.lamb === true,
      available: sheepItem.available === true,
      sold: sheepItem.sold === true,
      died: sheepItem.died === true,
      outsideBreeder: sheepItem.outsideBreeder === true,
      price: sheepItem.price,
      media: (sheepItem.media || []).map((m: any) => ({ url: m.url, type: m.type })),
      documents: (sheepItem.documents || []).map((d: any) => ({
        url: d.url,
        type: d.type,
        name: d.name,
        mimeType: d.mimeType,
      })),
    });
  }

  const litter = first(dogLitters);
  if (litter) {
    await check(results, "round-trip dog litter", "PUT", `/api/litters/${litter.id}`, {
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      dueDate: litter.dueDate,
      isVisible: litter.isVisible,
      isCurrentLitter: litter.isCurrentLitter,
      isPastLitter: litter.isPastLitter,
      isPlannedLitter: litter.isPlannedLitter,
      expectedBreedingDate: litter.expectedBreedingDate,
      expectedPickupDate: litter.expectedPickupDate,
      waitlistLink: litter.waitlistLink,
    });
  }

  const goatLitter = first(goatLitters);
  if (goatLitter) {
    await check(results, "round-trip goat litter", "PUT", `/api/goat-litters/${goatLitter.id}`, {
      motherId: goatLitter.motherId,
      fatherId: goatLitter.fatherId,
      dueDate: goatLitter.dueDate,
      isVisible: goatLitter.isVisible,
      isCurrentLitter: goatLitter.isCurrentLitter,
      isPastLitter: goatLitter.isPastLitter,
      isPlannedLitter: goatLitter.isPlannedLitter,
      expectedBreedingDate: goatLitter.expectedBreedingDate,
      expectedPickupDate: goatLitter.expectedPickupDate,
      waitlistLink: goatLitter.waitlistLink,
    });
  }

  const sheepLitter = first(sheepLitters);
  if (sheepLitter) {
    await check(results, "round-trip sheep litter", "PUT", `/api/sheep-litters/${sheepLitter.id}`, {
      motherId: sheepLitter.motherId,
      fatherId: sheepLitter.fatherId,
      dueDate: sheepLitter.dueDate,
      isVisible: sheepLitter.isVisible,
      isCurrentLitter: sheepLitter.isCurrentLitter,
      isPastLitter: sheepLitter.isPastLitter,
      isPlannedLitter: sheepLitter.isPlannedLitter,
      expectedBreedingDate: sheepLitter.expectedBreedingDate,
      expectedPickupDate: sheepLitter.expectedPickupDate,
      waitlistLink: sheepLitter.waitlistLink,
    });
  }

  const principle = first(principles);
  if (principle) {
    await check(results, "round-trip principle", "PUT", `/api/principles/${principle.id}`, {
      title: principle.title,
      description: principle.description,
      imageUrl: principle.imageUrl,
      order: principle.order,
    });
  }

  const item = first(carousel);
  if (item) {
    await check(results, "round-trip carousel", "PUT", `/api/carousel/${item.id}`, {
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      order: item.order,
    });
  }

  const product = first(products);
  if (product) {
    await check(results, "round-trip product", "PUT", `/api/products/${product.id}`, {
      name: product.name,
      section: product.section,
      category: product.category,
      description: product.description,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
      availableForPurchase: product.availableForPurchase,
      seasonal: product.seasonal,
      availableFrom: product.availableFrom,
      order: product.order,
    });
  }

  const schedule = first(schedules);
  if (schedule) {
    await check(results, "round-trip schedule", "PUT", `/api/market-schedules/${schedule.id}`, {
      location: schedule.location,
      address: schedule.address,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      description: schedule.description,
      order: schedule.order,
      isActive: schedule.isActive,
    });
  }

  const photo = first(gallery);
  if (photo) {
    await check(results, "round-trip gallery", "PUT", `/api/gallery-photos/${photo.id}`, {
      title: photo.title,
      description: photo.description,
      imageUrl: photo.imageUrl,
      category: photo.category,
      order: photo.order,
      isVisible: photo.isVisible,
    });
  }

  const heroItem = first(hero);
  if (heroItem) {
    await check(results, "round-trip dogs hero", "PUT", `/api/dogs-hero/${heroItem.id}`, {
      title: heroItem.title,
      subtitle: heroItem.subtitle,
      imageUrl: heroItem.imageUrl,
    });
  }

  if (aboutCards) {
    await check(results, "round-trip about cards", "PUT", "/api/about-cards", aboutCards);
  }

  const oldCard = first(aboutCardsOld);
  if (oldCard) {
    await check(results, "round-trip about card by id", "PUT", `/api/about-cards/${oldCard.id}`, {
      title: oldCard.title,
      description: oldCard.description,
      icon: oldCard.icon,
    });
  }

  const section = first(marketSections);
  if (section) {
    await check(results, "round-trip market section", "PUT", `/api/market-sections/${section.id}`, {
      name: section.name,
      title: section.title,
      description: section.description,
      imageUrl: section.imageUrl,
      order: section.order,
    });
  }

  const logo = Array.isArray(siteContent)
    ? siteContent.find((c: any) => c.key === "hero_text")
    : null;
  if (logo) {
    await check(results, "round-trip site-content", "PUT", `/api/site-content/${logo.key}`, {
      value: logo.value,
    });
  }

  await check(results, "theme get/put", "PUT", "/api/theme", { appearance: "light" });

  const failed = results.filter((r) => !r.ok);
  for (const r of results) {
    const mark = r.ok ? "OK " : "FAIL";
    console.log(`${mark} ${r.status} ${r.name}${r.detail ? ` :: ${r.detail}` : ""}`);
  }
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
