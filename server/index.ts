import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import proxyRouter from "./routes/proxy";
import goatsRouter from "./routes/goats";
import goatLittersRouter from "./routes/goat-litters";
import { dbErrorHandler } from "./middleware/db-error-handler";

// Load environment variables from .env file
dotenv.config();

// Validate environment variables at startup
function validateEnvironment() {
  // Check S3 credentials exactly how DB credentials are checked
  const requiredAwsVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_BUCKET_NAME'];
  const missingAwsVars = requiredAwsVars.filter(varName => !process.env[varName]);

  if (missingAwsVars.length > 0) {
    console.error(`⚠️ CONFIGURATION ERROR: Missing required AWS variables: ${missingAwsVars.join(', ')}`);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingAwsVars.join(', ')}. Ensure these are set in your Replit Secrets for deployment.`);
    } else {
      console.error('S3 uploads will not work properly without these variables.');
      console.error('In development, make sure these are set in your .env file or Replit Secrets.');
    }
  } else {
    console.log('✅ Environment validation: All required S3 credentials found.');
  }

  // Check database credentials
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add proxy router before other routes
app.use('/api', proxyRouter);

// Add goats router
app.use(goatsRouter);

// Add goat litters router
app.use(goatLittersRouter);

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