import "./env-bootstrap";
import express, { type Request, Response, NextFunction, type Express } from "express";
import { type Server } from "http";
import { registerRoutes } from "./routes";
import { log } from "./logger";
import { serveStatic } from "./static";
import compression from "compression";
import proxyRouter from "./routes/proxy";
import goatsRouter from "./routes/goats";
import goatLittersRouter from "./routes/goat-litters";
import sheepRouter from "./routes/sheep";
import sheepLittersRouter from "./routes/sheep-litters";
import { dbErrorHandler } from "./middleware/db-error-handler";

export type CreateAppOptions = {
  serveStatic?: boolean;
};

let appPromise: Promise<{ app: Express; server: Server }> | null = null;

export function createApp(options: CreateAppOptions = {}) {
  if (!appPromise) {
    appPromise = buildApp(options);
  }
  return appPromise;
}

async function buildApp(options: CreateAppOptions) {
  const shouldServeStatic = options.serveStatic ?? process.env.VERCEL !== "1";

  console.log("============ ENVIRONMENT CHECK ============");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID?.trim() || "";
  const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET?.trim() || "";
  const firebaseServiceAccountConfigured = Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim()
  );
  console.log("FIREBASE_PROJECT_ID:", firebaseProjectId || "Not set");
  console.log("FIREBASE_STORAGE_BUCKET:", firebaseStorageBucket || "Not set");
  console.log(
    "FIREBASE service account:",
    firebaseServiceAccountConfigured ? "Configured" : "Not set"
  );
  console.log("==========================================");

  const app = express();

  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024,
      level: 6,
      memLevel: 8,
    })
  );

  app.set("trust proxy", true);

  app.use((req, res, next) => {
    const host = req.get("host");
    if (host && host.startsWith("www.")) {
      const nonWwwHost = host.slice(4);
      const protocol = req.header("x-forwarded-proto") || "https";
      return res.redirect(301, `${protocol}://${nonWwwHost}${req.originalUrl}`);
    }
    next();
  });

  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    });
    next();
  });

  app.use((req, res, next) => {
    const url = req.url;

    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i)) {
      res.setHeader("Cache-Control", "public, max-age=31536000");
      res.setHeader("Expires", new Date(Date.now() + 31536000000).toUTCString());
    } else if (url.match(/\.(css|js)$/i)) {
      res.setHeader("Cache-Control", "public, max-age=2592000");
      res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
    } else if (!url.startsWith("/api") && url.match(/\.(html|json|xml|txt)$/i)) {
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("Expires", new Date(Date.now() + 3600000).toUTCString());
    }

    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false, limit: "50mb" }));

  app.use("/api", proxyRouter);
  app.use(goatsRouter);
  app.use(goatLittersRouter);
  app.use(sheepRouter);
  app.use(sheepLittersRouter);

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = registerRoutes(app);

  app.use(dbErrorHandler);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  if (shouldServeStatic) {
    serveStatic(app);
  }

  return { app, server };
}
