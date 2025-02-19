CREATE TABLE IF NOT EXISTS "animals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"breed" text,
	"age" integer,
	"description" text,
	"image_url" text,
	"is_available" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carousel_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "contact_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text,
	"phone" text,
	"facebook" text,
	"instagram" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dog_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"dog_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dog_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"dog_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"registration_name" text,
	"breed" text NOT NULL,
	"gender" text NOT NULL,
	"birth_date" date NOT NULL,
	"description" text,
	"mother_id" integer,
	"father_id" integer,
	"litter_id" integer,
	"puppy" boolean DEFAULT false NOT NULL,
	"available" boolean DEFAULT false NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"price" text,
	"profile_image_url" text,
	"health_data" text,
	"color" text,
	"dewclaws" text,
	"fur_length" text,
	"height" numeric(5, 2),
	"weight" numeric(5, 2),
	"pedigree" text,
	"narrative_description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"outside_breeder" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dogs_hero" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text NOT NULL,
	"image_url" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "file_storage" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goat_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"goat_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goat_litters" (
	"id" serial PRIMARY KEY NOT NULL,
	"due_date" date NOT NULL,
	"mother_id" integer NOT NULL,
	"father_id" integer NOT NULL,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goat_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"goat_id" integer NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goats" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"registration_name" text,
	"breed" text NOT NULL,
	"gender" text NOT NULL,
	"birth_date" date NOT NULL,
	"description" text,
	"mother_id" integer,
	"father_id" integer,
	"litter_id" integer,
	"kid" boolean DEFAULT false NOT NULL,
	"available" boolean DEFAULT false NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"price" text,
	"profile_image_url" text,
	"health_data" text,
	"color" text,
	"milk_stars" text,
	"la_ar_scores" text,
	"height" numeric(5, 2),
	"weight" numeric(5, 2),
	"pedigree" text,
	"narrative_description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"outside_breeder" boolean DEFAULT false,
	"horns" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "litter_interest_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"litter_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "litters" (
	"id" serial PRIMARY KEY NOT NULL,
	"due_date" date NOT NULL,
	"mother_id" integer NOT NULL,
	"father_id" integer NOT NULL,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"address" text NOT NULL,
	"day_of_week" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "market_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "principles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"section" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"price" text,
	"unit" text,
	"image_url" text,
	"in_stock" boolean DEFAULT true,
	"seasonal" boolean DEFAULT false,
	"available_from" date,
	"available_to" date,
	"ingredients" text,
	"nutrition_info" text,
	"allergens" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"type" text NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dogs" ADD CONSTRAINT "dogs_mother_id_dogs_id_fk" FOREIGN KEY ("mother_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dogs" ADD CONSTRAINT "dogs_father_id_dogs_id_fk" FOREIGN KEY ("father_id") REFERENCES "public"."dogs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dogs" ADD CONSTRAINT "dogs_litter_id_litters_id_fk" FOREIGN KEY ("litter_id") REFERENCES "public"."litters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goats" ADD CONSTRAINT "goats_mother_id_goats_id_fk" FOREIGN KEY ("mother_id") REFERENCES "public"."goats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goats" ADD CONSTRAINT "goats_father_id_goats_id_fk" FOREIGN KEY ("father_id") REFERENCES "public"."goats"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goats" ADD CONSTRAINT "goats_litter_id_goat_litters_id_fk" FOREIGN KEY ("litter_id") REFERENCES "public"."goat_litters"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
