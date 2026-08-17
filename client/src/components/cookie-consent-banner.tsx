import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookie-consent";

export default function CookieConsentBanner() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
    }

    const open = () => setVisible(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, open);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, open);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (location === "/admin" || location === "/login" || !visible) {
    return null;
  }

  const choose = (analyticsAndAds: boolean) => {
    setCookieConsent({
      analytics: analyticsAndAds,
      advertising: analyticsAndAds,
    });
    setVisible(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-stone-900/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#FDF7EB] shadow-2xl border border-stone-200 p-6 sm:p-8">
        <h2 id="cookie-consent-title" className="text-2xl font-bold text-stone-800 mb-3">
          Cookies and privacy
        </h2>
        <p className="text-stone-700 leading-relaxed mb-3">
          We use essential cookies and similar storage to run this site, keep your cart, and
          complete checkout. We do not set advertising or analytics cookies unless you choose
          Accept all.
        </p>
        <p className="text-stone-700 leading-relaxed mb-6">
          Read our{" "}
          <a href="/privacy-policy" className="underline text-[#3F6A52] hover:text-stone-900">
            Privacy Policy
          </a>{" "}
          for categories, retention, and how to submit a privacy request. You can change this
          choice later with Cookie settings in the footer.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-stone-400 text-stone-800"
            onClick={() => choose(false)}
          >
            Reject non-essential
          </Button>
          <Button
            type="button"
            className="bg-[#3F6A52] hover:bg-[#2c5530] text-white"
            onClick={() => choose(true)}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
