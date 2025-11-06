# GeoJSON Editor

## Overview

A professional web-based GeoJSON editor with interactive map visualization, drawing tools, and multi-format support. The application enables users to create, edit, and visualize GeoJSON data through a split-panel interface featuring a code editor and an interactive map canvas. Users can draw geometric features (points, lines, polygons) directly on the map, edit properties in a structured table view, and import/export data in multiple formats (GeoJSON, CSV). The application works offline and stores data locally in the browser.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, built using Vite for fast development and optimized production builds.

**UI Component System**: Radix UI primitives with shadcn/ui styling system (New York variant). Uses Tailwind CSS for utility-first styling with a custom design system based on Material Design principles and professional GIS tools (Mapbox Studio, geojson.io).

**State Management**: 
- React hooks for local component state
- TanStack Query (React Query) for server state management and caching
- LocalStorage for data persistence (main GeoJSON data stored in browser)

**Routing**: Wouter for lightweight client-side routing (single-page application with primary `/` route for the editor)

**Code Editor**: CodeMirror 6 with JSON language support for syntax highlighting and validation

**Map Visualization**: Leaflet.js for interactive mapping with multiple basemap providers (OpenStreetMap, satellite imagery, CartoDB light/dark, terrain)

**Typography**: Inter for UI text, JetBrains Mono for code editor (loaded via Google Fonts CDN)

### Design System

**Design Approach**: Utility-focused productivity tool prioritizing functional clarity, information density, and zero-distraction workflow. Custom CSS variables for theming with light/dark mode support.

**Layout**: Fixed header toolbar (12px height), flexible split-panel main content area (50/50 default, resizable), no footer to maximize workspace. Tight spacing primitives using Tailwind units (1-12).

**Interactive States**: Custom elevation system using `--elevate-1` and `--elevate-2` CSS variables for hover/active states, creating subtle depth without heavy shadows.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js

**Development Server**: Vite middleware integration for hot module replacement (HMR) in development mode

**Storage Interface**: Abstract IStorage interface with in-memory implementation (MemStorage). Designed to be swappable with database-backed storage.

**API Structure**: RESTful API with `/api` prefix (routes defined but not currently utilized as app is client-side focused)

**Build Process**: 
- Client: Vite builds React app to `dist/public`
- Server: esbuild bundles Express server to `dist/index.js` as ESM module

### Data Storage Solutions

**Current Implementation**: LocalStorage for client-side persistence of GeoJSON data

**Configured Database**: PostgreSQL with Drizzle ORM (schema defined, migrations configured via drizzle-kit). Database URL expected via environment variable but not currently utilized in the application flow.

**Schema**: Simple users table with UUID primary keys, username/password fields. GeoJSON types defined in shared schema for type safety.

**Session Management**: connect-pg-simple package included for PostgreSQL session storage (not currently active)

**Rationale**: The application functions primarily as a client-side tool. Database infrastructure is provisioned for future features (user accounts, cloud storage, collaboration) but current architecture prioritizes offline-first functionality.

### Data Models

**GeoJSON Types**: Strongly typed Feature and FeatureCollection interfaces supporting Point, LineString, Polygon, and Multi* geometry types. Properties stored as flexible key-value records.

**Validation**: JSON parsing with structural validation in `geojson-utils.ts`. Automatically converts single Feature to FeatureCollection for consistent handling.

**Transformations**: CSV import/export utilities with intelligent column detection for lat/lon fields.

### Component Architecture

**Split-Panel Layout**: Resizable panels using react-resizable-panels for flexible workspace division between code and map views

**Feature Management**:
- MapCanvas: Leaflet integration with drawing mode support, feature selection, basemap switching
- CodeEditor: CodeMirror with real-time validation and error display
- FeatureTable: Tabular view of all features with dynamic property columns
- PropertyEditor: Form-based interface for editing feature properties
- DrawingToolbar: Tool selection for map interaction (pan, point, line, polygon)

**Data Flow**: Unidirectional data flow from parent Editor component to child components via props. Child components emit changes via callback props. LocalStorage sync on data changes via useEffect.

## External Dependencies

### Third-Party Services

**Map Tiles**: Multiple tile providers for basemap layers:
- OpenStreetMap (standard view)
- Esri ArcGIS Online (satellite imagery)
- CartoDB (light/dark themes)
- OpenTopoMap (terrain)

**Fonts**: Google Fonts CDN for Inter and JetBrains Mono typefaces

**Leaflet**: CDN-hosted Leaflet CSS for map styling

### Database

**PostgreSQL**: Configured via Neon serverless driver (@neondatabase/serverless). Connection expected via DATABASE_URL environment variable. Drizzle ORM for schema management and migrations (output to `./migrations` directory).

### Key NPM Packages

**Core Framework**:
- react, react-dom: UI framework
- vite: Build tool and dev server
- express: Backend server

**UI Components**:
- @radix-ui/*: Unstyled, accessible component primitives (30+ components)
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Type-safe component variant system

**Data & State**:
- @tanstack/react-query: Server state management
- drizzle-orm: TypeScript ORM
- zod: Schema validation (via drizzle-zod)

**Editor & Visualization**:
- @uiw/react-codemirror: CodeMirror 6 React wrapper
- @codemirror/lang-json: JSON language support
- Leaflet: Map library (via CDN, not in package.json)

**Development Tools**:
- @replit/vite-plugin-*: Replit-specific development plugins (error overlay, cartographer, dev banner)
- tsx: TypeScript execution for development server
- esbuild: Production server bundling

**TypeScript**: Strict mode enabled with ESNext module system, path aliases for clean imports (@/, @shared/, @assets/)