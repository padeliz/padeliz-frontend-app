/**
 * Apex marketing / legal site URLs (Romanian pages).
 * Base required via EXPO_PUBLIC_LEGAL_SITE_URL (baked at image build / .env.local).
 */

export function legalSiteBaseUrl(): string {
  const raw = process.env.EXPO_PUBLIC_LEGAL_SITE_URL?.trim();
  if (!raw) {
    throw new Error(
      'EXPO_PUBLIC_LEGAL_SITE_URL is required (no default). Set it in .env.local or as a Docker build-arg.',
    );
  }
  return raw.replace(/\/$/, '');
}

export const LEGAL_PATHS = {
  terms: '/terms-and-conditions.html',
  privacy: '/privacy-policy.html',
  gdpr: '/gdpr-policy.html',
  delivery: '/delivery-policy.html',
  cancellation: '/cancellation-refund-policy.html',
  contact: '/contact.html',
} as const;

export type LegalPathKey = keyof typeof LEGAL_PATHS;

export function legalUrl(key: LegalPathKey): string {
  return `${legalSiteBaseUrl()}${LEGAL_PATHS[key]}`;
}

export const ANPC_SAL_URL = 'https://reclamatiisal.anpc.ro';

export const LEGAL_LINK_ITEMS: { key: LegalPathKey; label: string }[] = [
  { key: 'terms', label: 'Terms' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'gdpr', label: 'GDPR' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'cancellation', label: 'Cancellation' },
  { key: 'contact', label: 'Contact' },
];
