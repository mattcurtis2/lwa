import { createApp } from "./create-app";
import { log } from "./logger";

(async () => {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const { app, server } = await createApp({
    serveStatic: !isDevelopment && process.env.VERCEL !== "1",
  });

  if (isDevelopment) {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  }

  if (process.env.VERCEL === "1") {
    return;
  }

  const rawPort = process.env.PORT;
  let listenPort = 5001;
  if (rawPort !== undefined && rawPort !== "") {
    const n = Number.parseInt(rawPort, 10);
    if (!Number.isNaN(n) && n > 0) {
      listenPort = n;
    } else {
      console.error(`Invalid PORT env (${JSON.stringify(rawPort)}); using 5001`);
    }
  }
  server.listen(listenPort, "0.0.0.0", () => {
    log(`serving on port ${listenPort}`);
  });
})();
