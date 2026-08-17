export const COOKIE_CONSENT_KEY = "lwa-cookie-consent";
export const COOKIE_CONSENT_EVENT = "lwa:open-cookie-consent";

export type CookieConsent = {
  version: 1;
  essential: true;
  analytics: boolean;
  advertising: boolean;
  timestamp: string;
};

export function getCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed?.version !== 1 || typeof parsed.analytics !== "boolean") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: {
  analytics: boolean;
  advertising: boolean;
}): CookieConsent {
  const consent: CookieConsent = {
    version: 1,
    essential: true,
    analytics: choice.analytics,
    advertising: choice.advertising,
    timestamp: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("lwa:cookie-consent-changed", { detail: consent }));
  return consent;
}

export function hasAnalyticsConsent(): boolean {
  return getCookieConsent()?.analytics === true;
}

export function openCookieConsent(): void {
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
