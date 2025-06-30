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