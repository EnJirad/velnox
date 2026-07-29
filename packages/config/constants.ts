/**
 * Shared application-wide constants for Velnox.
 * Business/feature-specific constants belong in their own app or module.
 */

export const APP_NAME = 'Velnox';

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const SUPPORTED_LOCALES = ['th', 'en', 'my'] as const;
export const DEFAULT_LOCALE = 'th';

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
