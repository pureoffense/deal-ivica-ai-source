# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Deal Ivica AI is a React-based web application for creating AI-powered presentation decks with gated access controls. The project uses modern TypeScript, Vite for building, Supabase for authentication and data storage, and integrates with the Gamma API for AI-generated content.

## Essential Commands

### Development
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run type-check` - Run TypeScript type checking without compilation
- `npm run lint` - Run ESLint on source files
- `npm run format` - Format code with Prettier

### Building & Preview
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

### Testing
- `npm run test` - Run unit tests with Vitest in watch mode
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests

### Single Test Execution
- `npx vitest run <test-file>` - Run specific test file
- `npx vitest run --grep="test name"` - Run tests matching pattern
- `npx playwright test <test-file>` - Run specific e2e test

## Architecture Overview

### Core Technology Stack
- **Frontend**: React 19 + TypeScript with strict mode
- **Build System**: Vite 7.x with optimized chunking
- **Routing**: React Router v7 with lazy loading
- **State Management**: Zustand with persistence
- **Authentication**: Supabase Auth with OAuth support
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS v4 with custom design system
- **Testing**: Vitest + Testing Library + Playwright
- **Animations**: Framer Motion

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (ErrorBoundary, LoadingSpinner)
│   └── auth/            # Authentication components (AuthProvider, ProtectedRoute)
├── pages/               # Route components (Home, Login, Signup, Dashboard, DeckCreation)
├── stores/              # Zustand state stores (authStore.ts)
├── services/            # API services (deckService.ts)
├── lib/                 # Configuration and utilities (supabase.ts)
├── types/               # TypeScript type definitions
├── constants/           # Application constants
└── test/                # Test utilities and setup
```

### State Management Pattern
- **Authentication**: Zustand store with Supabase integration and persistence
- **Server State**: React Query for API calls and caching (configured but not yet implemented)
- **Component State**: React hooks for local UI state

### Routing Architecture
- Lazy-loaded pages for optimal performance
- Protected route wrapper for authenticated pages
- Error boundaries for graceful error handling
- Code splitting with automatic chunk optimization

## Key Implementation Details

### Authentication Flow
- Supabase-based authentication with PKCE security
- OAuth support (Google) configured
- Session persistence with Zustand middleware
- Protected routes using `ProtectedRoute` component
- Password reset functionality included

### Deck Creation System
- AI content generation via Gamma API (proxied through Vercel)
- Fallback to mock data for development/demo
- Gate system for access controls (info, signature, payment, OTP)
- Database storage in Supabase with JSON fields for flexibility

### Performance Optimizations
- Lazy loading for all route components
- Manual chunk splitting (vendor, router, state, ui)
- Font optimization with @fontsource
- Bundle size warnings at 1000KB threshold
- Optimized dependency pre-bundling

### Environment Configuration
Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SENTRY_DSN` - Sentry error tracking (optional)

### Testing Strategy
- **Unit Tests**: Vitest with jsdom environment
- **Component Tests**: Testing Library for React components
- **E2E Tests**: Playwright for end-to-end workflows
- **Mock Data**: Comprehensive mocking for Supabase and external APIs

## Development Guidelines

### TypeScript Usage
- Strict mode enabled with enhanced type checking
- Path aliases configured (`@/` for src directory)
- Comprehensive type definitions in `src/types/index.ts`
- Interface-based architecture for maintainability

### Component Organization
- UI components in `components/ui/` for reusable elements
- Feature-specific components in dedicated directories
- Consistent prop interfaces with TypeScript
- Error boundaries for production resilience

### API Integration
- Service layer pattern for external API calls
- Error handling with user-friendly messages
- Loading states for improved UX
- Fallback mechanisms for API failures

### Database Schema Expectations
- Users table with role-based access (creator/viewer)
- Decks table with JSON fields for flexibility
- UUID primary keys for security
- Timestamp tracking for audit trails

## Common Development Tasks

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx` with lazy loading
3. Include in protected/public route structure as needed
4. Add corresponding test file

### Database Operations
- Use Supabase client from `src/lib/supabase.ts`
- Implement service functions in `src/services/`
- Handle authentication requirements in service layer
- Include error handling and loading states

### Form Implementation
- Use React Hook Form with Zod validation (configured)
- Implement validation schemas in `src/lib/validations/`
- Include loading and error states
- Follow accessibility best practices

### State Management
- Authentication state via `useAuthStore` hook
- Component state with standard React hooks
- Future server state with React Query integration

## Build and Deployment

### Production Build
- TypeScript compilation with strict checking
- Vite optimization with chunk splitting
- Bundle analysis available with `vite-bundle-analyzer`
- Source maps generated for debugging

### Deployment Considerations
- Environment variables must be configured
- Supabase project must be set up with proper RLS policies
- API proxy functions must be deployed (Vercel functions)
- Static asset optimization for CDN distribution

### Performance Monitoring
- Sentry integration for error tracking
- Bundle size warnings configured
- Lighthouse scoring optimization
- Core Web Vitals monitoring ready

## Project Status

### Completed Features
- ✅ Modern React + TypeScript setup with strict mode
- ✅ Tailwind CSS design system with custom components
- ✅ Authentication system with Supabase integration
- ✅ Protected routing with lazy loading
- ✅ Deck creation with AI integration
- ✅ Comprehensive testing setup
- ✅ Production-ready error handling
- ✅ Performance optimizations

### Next Development Steps
Based on project documentation (STEP1_COMPLETE.md, STEP2_HOME_PAGE_COMPLETE.md):
1. Enhanced authentication flows and user management
2. Advanced deck editing and customization features
3. Gate system implementation and access control
4. Analytics and user engagement tracking