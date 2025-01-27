import type { inferRouterOutputs } from "@trpc/server";

export interface Metadata {
  title: string;
  description: string;
}

export interface SiteContent {
  id: number;
  key: string;
  value: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}
