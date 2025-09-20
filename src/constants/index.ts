// App Configuration
export const APP_CONFIG = {
  NAME: 'Deal Ivica AI',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-powered presentation tool with gated access',
  CONTACT_EMAIL: 'support@dealivica.ai',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  DECK_CREATE: '/deck/create',
  DECK_VIEW: '/deck/:id/view',
  DECK_EDIT: '/deck/:id/edit',
  PROFILE: '/profile',
  REPORTS: '/reports',
  ACCESS_GATE: '/access/:slug',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    SIGNUP: '/api/v1/auth/signup',
    LOGOUT: '/api/v1/auth/logout',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
  },
  // Decks
  DECKS: {
    CREATE: '/api/v1/decks',
    GET_BY_ID: '/api/v1/decks/:id',
    UPDATE: '/api/v1/decks/:id',
    DELETE: '/api/v1/decks/:id',
    LIST: '/api/v1/decks',
    GET_BY_SLUG: '/api/v1/decks/slug/:slug',
  },
  // Gates
  GATES: {
    VALIDATE: '/api/v1/gates/validate',
    SUBMIT: '/api/v1/gates/submit',
  },
  // LOI and Bookings
  LOI: {
    SUBMIT: '/api/v1/loi/submit',
    GET: '/api/v1/loi/:id',
  },
  BOOKINGS: {
    CREATE: '/api/v1/bookings',
    GET: '/api/v1/bookings/:id',
    LIST: '/api/v1/bookings',
  },
  // Analytics
  ANALYTICS: {
    DECK_STATS: '/api/v1/analytics/decks/:id',
    USER_STATS: '/api/v1/analytics/users/:id',
  },
} as const;

// Gate Types
export const GATE_TYPES = {
  INFO: 'info',
  SIGNATURE: 'signature',
  PAYMENT: 'payment',
  OTP: 'otp',
} as const;

// Deck Status
export const DECK_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  EXPIRED: 'expired',
} as const;

// User Roles
export const USER_ROLES = {
  CREATOR: 'creator',
  VIEWER: 'viewer',
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PROMPT_MIN_LENGTH: 10,
  PROMPT_MAX_LENGTH: 5000,
  TITLE_MAX_LENGTH: 255,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Rate Limits
export const RATE_LIMITS = {
  DECK_CREATION: { requests: 10, window: '1h' },
  API_CALLS: { requests: 100, window: '15m' },
  AUTH_ATTEMPTS: { requests: 5, window: '15m' },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'deal-ivica-auth-token',
  USER_DATA: 'deal-ivica-user-data',
  THEME: 'deal-ivica-theme',
  LAST_VISIT: 'deal-ivica-last-visit',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  DECK_CREATED: 'Deck created successfully!',
  DECK_UPDATED: 'Deck updated successfully!',
  DECK_DELETED: 'Deck deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PASSWORD_RESET: 'Password reset email sent!',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  MODAL_ENTER: 300,
  MODAL_EXIT: 200,
  PAGE_TRANSITION: 400,
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;