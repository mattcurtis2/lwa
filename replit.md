# Farm Management System

## Overview
This full-stack web application manages a small family farm specializing in Colorado Mountain Dogs and Nigerian Dwarf Goats. It offers a content management interface for animals, litters, site content, and customer inquiries. The system aims to provide a robust, modern platform for farm owners to efficiently manage their operations, market their animals, and handle customer interactions, ultimately supporting the farm's growth and profitability.

## Required Secrets for Deployment

The following environment variables must be set in Replit Secrets before deploying (Settings → Secrets):

| Secret | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AWS_REGION` | AWS region where the S3 bucket lives (e.g. `us-east-2`) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key ID with S3 write permissions |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret access key |
| `AWS_BUCKET_NAME` | Name of the S3 bucket used for file uploads (`S3_BUCKET_NAME` is accepted as a fallback) |

Without the four AWS secrets, file uploads will return a `503 S3 not configured` error. The app will otherwise start and run normally.

You can verify AWS credentials manually at any time with: `npm run verify-aws`

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
### November 15, 2025 - Admin Litter Parent Image Validation Fix
- Fixed parent image display in goat and sheep litter admin panels where animals with invalid profileImageUrl values (e.g., "data:,") would not show any image
- Added isValidImageUrl() validation function to both goat-litter-management.tsx and sheep-litter-management.tsx
- Validation checks for empty strings and invalid data URL placeholders before attempting to render profileImageUrl
- When profileImageUrl is invalid, components now correctly fall back to first media array item, ensuring parent pictures display properly
- Fixed Thistle's (sheep father) picture not displaying in sheep litter admin panel

### November 15, 2025 - Sheep Health and Pedigree Management
- Extended sheep admin form to include healthData and pedigree text fields with document upload functionality
- Added separate health and pedigree document state management matching dog/goat form patterns
- Implemented FileUpload component integration for health and pedigree documents with S3 upload support
- Documents are categorized by type ('health' or 'pedigree') and synchronized with form state via setValue
- Sheep detail page already had complete health and pedigree tab infrastructure displaying documents and information
- All changes architect-reviewed with no security issues; form patterns now consistent across dogs, goats, and sheep

### January 25, 2025 - Sheep Litter Public Display System
- Created complete public-facing sheep litter display system matching goat litter functionality
- Added filtered API endpoints: `/api/sheep-litters/list/current` and `/api/sheep-litters/list/past`
- Created three public pages: current litters, upcoming litters, and past litters
- Added routes in App.tsx for all three sheep litter pages
- Updated header and mobile navigation to conditionally show sheep litter links based on visibility flags
- Fixed navigation logic to use boolean flags (isCurrentLitter, isPlannedLitter, isPastLitter) instead of date comparisons
- Sheep litters now follow the same display pattern as goat litters with consistent UI/UX

### January 17, 2025 - Comprehensive Date Parsing Bug Fix
- Fixed widespread off-by-one day error across the entire application caused by timezone issues
- Replaced all instances of `new Date()` with date-only strings to use the custom `parseApiDate()` utility
- Updated the following files:
  - Public pages: `litter-detail.tsx`, `dog-current-litters.tsx`, `dog-future-litters.tsx`, `past-litters.tsx`, `goat-detail.tsx`, `goat-past-litters.tsx`, `goat-upcoming-litters.tsx`
  - Components: `dog-details.tsx`, `goat-details.tsx`, `sheep-details.tsx`, `sheep-card.tsx`, `dog-card.tsx`, `goat-card.tsx`, `dog-profile.tsx`
  - Layout: `header.tsx`, `mobile-nav.tsx`
  - Forms: `dog-form.tsx`
  - Hooks: `use-litter-management.ts`
- The `parseApiDate()` function creates dates at local midnight to avoid timezone offsets that can cause off-by-one day errors
- All date-only fields (birthDate, dueDate, expectedPickupDate, expectedBreedingDate) now consistently use parseApiDate throughout the application

### January 17, 2025 - Litter Banner Logic Fix
- Fixed litter banner logic to properly check for puppy availability instead of planned litter status
- Updated API to include `puppyCount` field for each litter to determine correct banner message
- Refactored duplicate banner code into a shared `LitterBanner` component used on both homepage and /dogs page
- Banner now correctly shows "New Litter Coming Soon!" when no puppies are added to the litter
- Banner now correctly shows "New Litter Available!" when puppies have been added to the litter
- Ensured consistent behavior across both homepage and dogs page

## System Architecture
### Frontend
- **Framework:** React with TypeScript, using Vite for builds.
- **UI/UX:** Radix UI primitives with shadcn/ui for design, styled with Tailwind CSS.
- **State Management:** TanStack Query for server state.
- **Routing:** Wouter for client-side routing.
- **Forms:** React Hook Form with Zod validation.
- **Functionality:** React Beautiful DnD for reordering.

### Backend
- **Runtime:** Node.js with Express.js.
- **Language:** TypeScript with ESM modules.
- **Database ORM:** Drizzle ORM for type-safe operations.
- **Session Management:** Express-session.
- **File Handling:** Multer for uploads.
- **Authentication:** bcryptjs for password hashing.

### Key Features & Design Patterns
- **Database Schema:** PostgreSQL schema includes Dogs, Goats, Litters, Media, Site Content, Users, Carousel Items, Principles, and Contact Info, enabling comprehensive farm management.
- **File Management:** Supports dual storage with Multer for local uploads and AWS S3 for scalable cloud storage. Includes client-side image cropping.
- **Multi-Site Architecture:** Utilizes a `siteId` field for data isolation, supporting potential multi-tenant functionality.
- **Data Flow:** Follows a standard client-server model with React making API calls to an Express backend, using session-based authentication and Drizzle ORM for database interactions. File uploads are processed via Multer and optionally sent to S3.
- **E-commerce:** Features a shopping cart with local storage persistence, product quantity selection, and a three-step checkout process.
- **Order Management:** Includes a comprehensive orders management system with an overview and order sheet, environment filtering, pickup location grouping, and printable order sheets.
- **Pre-order Deadlines:** Implements a Thursday noon Eastern time pre-order deadline for farmers market orders with real-time countdowns, disabling "Add to Cart" functionality after the deadline.
- **Animal Detail Pages:** Unified tab-based interface for dogs, goats, and sheep, including image galleries, document handling, and pricing options.

## External Dependencies
- **Cloud Services:** AWS S3 (file storage), Neon Database (PostgreSQL hosting), Replit (development and hosting).
- **Payment Processing:** Stripe (checkout, payment processing, and automatic receipt emails).
- **Database:** Drizzle ORM, @neondatabase/serverless.
- **UI:** Radix UI components, shadcn/ui, Tailwind CSS.
- **File Processing:** Multer, fs-extra.
- **HTTP Client:** Native fetch with TanStack Query.
- **Build Tools:** Vite, esbuild.
```