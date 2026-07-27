import type { Express } from "express";
import { createApp } from "./create-app";

let app: Express | undefined;

export default async function handler(req: any, res: any) {
  if (!app) {
    ({ app } = await createApp({ serveStatic: false }));
  }
  return app(req, res);
}
