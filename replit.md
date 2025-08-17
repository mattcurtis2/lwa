# Farm Management System

## Overview
This full-stack web application manages a small family farm specializing in Colorado Mountain Dogs and Nigerian Dwarf Goats. It offers a content management interface for animals, litters, site content, and customer inquiries. The system aims to provide a robust, modern platform for farm owners to efficiently manage their operations, market their animals, and handle customer interactions, ultimately supporting the farm's growth and profitability.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
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