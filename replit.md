# Farm Management System

## Overview

This is a full-stack web application for managing a small family farm that specializes in Colorado Mountain Dogs and Nigerian Dwarf Goats. The system provides a content management interface for farm owners to manage their animals, litters, site content, and customer inquiries. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data storage and AWS S3 for file management.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Drag & Drop**: React Beautiful DnD for reordering functionality

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express-session with MemoryStore
- **File Handling**: Multer for multipart file uploads
- **Authentication**: bcryptjs for password hashing

## Key Components

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Dogs**: Breeding animals and puppies with detailed information
- **Goats**: Nigerian Dwarf goats with health and breeding records  
- **Litters**: Breeding records for both dogs and goats
- **Media**: File attachments for animals (images, documents)
- **Site Content**: Dynamic content management for website sections
- **Users**: Authentication and authorization
- **Carousel Items**: Homepage slideshow content
- **Principles**: Farm philosophy and values
- **Contact Info**: Business contact details

### File Management System
- **Local Storage**: Multer-based file uploads to `/uploads` directory
- **Cloud Storage**: AWS S3 integration for scalable file storage
- **Image Processing**: Client-side image cropping with canvas manipulation
- **Dual Storage**: System supports both local and S3 storage with fallback mechanisms

### Multi-Site Architecture
The system includes site-specific data isolation using a `siteId` field, enabling multi-tenant functionality for different farm operations.

## Data Flow

1. **Client Requests**: React frontend makes API calls to Express backend
2. **Authentication**: Session-based authentication with secure password hashing
3. **Data Processing**: Drizzle ORM handles database operations with type safety
4. **File Uploads**: Files processed through Multer, stored locally then optionally uploaded to S3
5. **Response**: JSON responses sent back to client with appropriate error handling

## External Dependencies

### Cloud Services
- **AWS S3**: Primary file storage solution
- **Neon Database**: PostgreSQL hosting service
- **Replit**: Development and hosting platform

### Key Libraries
- **Database**: Drizzle ORM, @neondatabase/serverless
- **UI**: Radix UI components, shadcn/ui, Tailwind CSS
- **File Processing**: Multer, fs-extra for file system operations
- **HTTP Client**: Native fetch with TanStack Query for caching
- **Build Tools**: Vite, esbuild for production builds

## Deployment Strategy

### Development
- Uses tsx for TypeScript execution without compilation
- Vite dev server for hot module replacement
- Local file storage during development

### Production
- Vite builds optimized frontend bundle
- esbuild compiles backend TypeScript to JavaScript
- AWS S3 handles file storage in production
- Environment variables control database and S3 connections

### Environment Configuration
- Database connection via `DATABASE_URL`
- AWS credentials via standard environment variables
- Session secrets and other sensitive data via environment variables

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Implemented configurable waitlist links for litters:
  - Added waitlist_link field to both dog and goat litter schemas
  - Updated admin forms to include waitlist link input fields
  - Modified litter detail pages to use custom waitlist links instead of hardcoded URLs
  - Updated future litters page to show "Sign Up Here" buttons when waitlist links are configured
  - Changed date displays to month-based format for planned litters (breeding and pickup dates)
  - Removed "Planned Parent Pairing" text from future litter cards
- June 30, 2025. Created comprehensive photo gallery system:
  - Built dedicated /gallery page with responsive grid layout and category filtering
  - Added gallery_photos database table for standalone farm photos not tied to animals
  - Integrated photos from dogs, goats, carousel items, and site content into unified display
  - Added "Photo Gallery" navigation links to header and mobile menu
  - Implemented lightbox viewing with photo navigation
  - Added date-based sorting (newest first) using actual database upload dates
  - Added clickable links from animal photos to their respective detail pages
  - Used authentic upload dates from database rather than synthetic data
- January 1, 2025. Enhanced "What We Offer" section to include Katahdin sheep:
  - Added sheep card editing interface to admin content section with image upload
  - Updated homepage farm-info component to display 4 cards in responsive grid
  - Added sheep card with proper content management integration
  - Fixed image upload functionality for all content types using S3 storage
  - Ensured consistent visual layout and functionality across all animal sections
  - Moved sheep card editing to admin Content > Carousel section as requested
  - Added all required database entries for sheep content (title, text, button text, redirect URL)
  - Fixed missing text fields in admin interface by populating database with default values
- January 14, 2025. Fixed principles section display issue:
  - Resolved issue where "Self-Sustaining" and "Profitable (Eventually)" principles were not displaying on production
  - Issue was caused by Framer Motion staggered animations preventing proper rendering
  - Fixed by replacing staggered container animation with individual item animations
  - All three principles now display correctly with proper animations
  - Backend was working correctly, issue was frontend-only
- January 16, 2025. Enhanced all edit/create forms with proper scrolling and accessibility:
  - Fixed dog litter edit panel scrolling issue for mobile devices
  - Applied same improvements to goat litter management form
  - Added sticky save/cancel buttons to all forms (dog, goat, and litter forms)
  - Improved mobile responsiveness with proper width constraints
  - Made all Sheet components scrollable with overflow-y-auto
  - Added proper spacing and visual separation between form content and action buttons
  - All forms now work seamlessly on both desktop and mobile devices
- January 16, 2025. Fixed litter categorization logic to prevent overlap:
  - Added mutually exclusive checkbox logic for current/planned/past litter states
  - Fixed database inconsistencies where litters were marked as both current and planned
  - Updated both dog and goat litter management forms with proper state management
  - Ensured litters now appear in only one section (current, planned, or past)
  - Cleaned up existing database entries to resolve conflicting litter states
- January 16, 2025. Enhanced "No Current Litters" page layout:
  - Added "View Past Litters" button alongside existing "View Our Dogs" button
  - Displays upcoming/future litters below the buttons when available
  - Shows planned litter cards with parent information and waitlist signup buttons
  - Improved overall layout and spacing for better user experience
- January 16, 2025. Added purchase availability selector for farmers market items:
  - Added `availableForPurchase` boolean field to products database schema
  - Updated product admin form to include toggle for enabling/disabling purchase availability
  - Added visual indicators on product cards showing "Available for Purchase" badge
  - Modified product card footer to show "Order Now (Coming Soon)" for purchasable items
  - Separated "In Stock" status from "Available for Purchase" for better inventory management
- January 16, 2025. Implemented shopping cart functionality with local storage:
  - Created cart context with localStorage persistence for browser session storage
  - Added "Add to Cart" buttons for products marked as available for purchase
  - Implemented cart icon in header and mobile navigation with dynamic item count badge
  - Built comprehensive cart page with quantity controls, item removal, and order summary
  - Added cart route and integrated CartProvider throughout the application
  - Cart persists across page reloads and browser sessions until localStorage is cleared
- January 16, 2025. Added quantity selection to product cards:
  - Added quantity input controls with plus/minus buttons on product cards
  - Users can now select multiple quantities before adding items to cart
  - Quantity validation ensures minimum of 1 item per addition
  - Toast notifications show exact quantity added to cart with proper pluralization
- January 16, 2025. Added add-to-cart confirmation dialog:
  - Added popup dialog that appears after adding items to cart
  - Dialog shows confirmation message with quantity and product name
  - Users can choose to "Continue Shopping" or "Go to Cart"
  - "Go to Cart" button navigates directly to cart page
  - "Continue Shopping" closes dialog and allows continued browsing
- January 16, 2025. Implemented complete checkout system with Stripe integration:
  - Created three-step checkout process: pickup location selection, customer info, and payment
  - Integrated Stripe payment processing with secure payment intent creation
  - Added pickup location selection from market schedules database
  - Built customer information form with validation for name, email, and phone
  - Created order confirmation page with payment details and next steps
  - Added minimum order amount validation ($0.50 for Stripe requirements)
  - Updated cart page with "Proceed to Checkout" button
  - Implemented comprehensive error handling for payment processing
  - Added order summary sidebar showing cart items and total throughout checkout
  - Configured automatic Stripe receipt emails with pickup instructions and order details
  - Added prominent print confirmation button on order confirmation page
  - Updated pickup times to end at 1:00 PM for both locations
  - Differentiated pickup instructions: bags with names at farm stand, last name at market
- January 16, 2025. Replaced Stripe automatic emails with SendGrid email system:
  - Implemented SendGrid email service with professional HTML email templates
  - Created order confirmation emails with complete order details, pickup instructions, and contact information
  - Configured sender identity verification for littlewayacresmi@gmail.com
  - Added comprehensive email error handling and logging
  - Emails sent immediately after successful payment processing
  - Template includes order summary table, pickup location details, and farm branding
  - Used SendGrid API key named "LittleWayAcres" with full access permissions
- January 17, 2025. Switched back to Stripe automatic receipt emails due to deliverability issues:
  - Identified DMARC alignment problems with Gmail sending through SendGrid
  - Removed SendGrid email system and reverted to Stripe's built-in receipt functionality
  - Updated payment intent to include detailed pickup information in description field
  - Configured receipt_email during payment confirmation for automatic Stripe receipts
  - Updated pickup instructions: Muskegon (8:00 AM - 1:00 PM) with "Look for the Little Way Acres stand. We are usually placed in a spot between 59-57."
  - Maintained existing Little Way Acres pickup instructions for farm stand location
  - Stripe receipts include order details, pickup location, timing, and instructions in payment description
  - System now relies on Stripe's proven email delivery infrastructure for better reliability
- January 17, 2025. Enhanced orders management with comprehensive production tools:
  - Added comprehensive orders management system with two-tab interface (Orders Overview and Order Sheet)
  - Implemented environment filtering to separate test orders from production orders for clarity
  - Created production-ready order sheets showing consolidated items to make (with quantities and order references)
  - Added pickup location grouping to organize orders by drop-off location for efficient preparation
  - Built printable order sheets with proper print CSS styling for clean paper output
  - Added order creation after successful payment processing to save complete order records
  - Enhanced order confirmation page to display selected pickup dates
  - Updated checkout process to save orders with all necessary details including pickup location and date
  - Orders system now provides complete production workflow from customer purchase to fulfillment preparation
- January 23, 2025. Updated sheep website page to match dogs and goats structure:
  - Completely rewrote sheep-details.tsx to match the modern tab-based interface used in dog and goat pages
  - Added mobile-responsive design with image gallery navigation
  - Implemented tabbed content organization (Basic Information, Story, Physical, Health, Pedigree)
  - Added document handling capabilities with preview functionality
  - Included proper media handling with thumbnail gallery and fullscreen view
  - Added pricing options for ram/wether pricing similar to goat pricing structure
  - Enhanced keyboard navigation support for image galleries
  - Improved accessibility with proper dialog titles and descriptions
  - All three animal types (dogs, goats, sheep) now have identical user interface structure