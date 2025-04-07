import { Site } from "../utils/site-identification";

declare global {
  namespace Express {
    interface Request {
      site?: Site | null;
    }
  }
}