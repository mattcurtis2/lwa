import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import compression from "compression";
import proxyRouter from "./routes/proxy";
import goatsRouter from "./routes/goats";
import goatLittersRouter from "./routes/goat-litters";
import sheepRouter from "./routes/sheep";
import sheepLittersRouter from "./routes/sheep-litters";
import { dbErrorHandler } from "./middleware/db-error-handler";

// Load environment variables from .env file in development only.
// In production, secrets are injected directly as environment variables
// by the hosting platform — loading .env would overwrite them with
// any placeholder values the file contains.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Catch any unhandled exceptions or promise rejections (e.g. transient
// database WebSocket errors) so the process doesn't crash on non-fatal issues.
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception (non-fatal, server continues):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection (non-fatal, server continues):', reason);
});

// Validate environment variables at startup
function validateEnvironment() {
  // AWS credentials are needed only for file uploads — missing them is a warning,
  // not a fatal error. The site will serve fine; only media uploads will fail.
  const requiredAwsVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
  const missingAwsVars = requiredAwsVars.filter(varName => !process.env[varName]);

  if (missingAwsVars.length > 0) {
    console.warn(`⚠️ WARNING: Missing AWS variables: ${missingAwsVars.join(', ')}. File uploads will not work. Ensure these are set in your Replit Secrets.`);
  } else {
    console.log('✅ Environment validation: All required S3 credentials found.');
  }

  // Database is genuinely required — nothing works without it.
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Ensure this is set in your Replit Secrets for deployment.');
  } else {
    console.log('✅ Environment validation: Database URL found.');
  }
}

validateEnvironment();

// Additional check for deployment environment
console.log('============ ENVIRONMENT CHECK ============');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AWS_REGION:', process.env.AWS_REGION || 'Not set');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? `Set (starts with: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 4)}...)` : 'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set (length: ' + process.env.AWS_SECRET_ACCESS_KEY.length + ')' : 'Not set');
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'Not set');
console.log('==========================================');

const app = express();

// Enable text compression (gzip/brotli) - addresses 11.33s savings
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
  level: 6, // Compression level (1-9, 6 is good balance)
  memLevel: 8
}));

// Trust proxy for Replit deployments (important for proper HTTPS handling)
app.set('trust proxy', true);

// Redirect www to non-www for consistency
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.startsWith('www.')) {
    const nonWwwHost = host.slice(4);
    const protocol = req.header('x-forwarded-proto') || 'https';
    return res.redirect(301, `${protocol}://${nonWwwHost}${req.originalUrl}`);
  }
  next();
});

// Add security headers for production
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
});

// Add caching headers for static assets (images, fonts, etc.)
app.use((req, res, next) => {
  const url = req.url;
  
  // Cache images and fonts for 1 year
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()); // 1 year
  }
  // Cache CSS and JS for 1 month
  else if (url.match(/\.(css|js)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=2592000'); // 1 month
    res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString()); // 1 month
  }
  // Cache other static files for 1 hour
  else if (!url.startsWith('/api') && url.match(/\.(html|json|xml|txt)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
    res.setHeader('Expires', new Date(Date.now() + 3600000).toUTCString()); // 1 hour
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add proxy router before other routes
app.use('/api', proxyRouter);

// Add goats router
app.use(goatsRouter);

// Add goat litters router
app.use(goatLittersRouter);

// Add sheep router
app.use(sheepRouter);

// Add sheep litters router
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

(async () => {
  const server = registerRoutes(app);

  // Database error handler middleware (must be before the general error handler)
  app.use(dbErrorHandler);
  
  // General error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    console.error('Server error:', err);
    res.status(status).json({ message });
    
    // Do not throw the error again as it will crash the server
    // Just log it and let the server continue running
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();