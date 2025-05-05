// utils/cookieConsent.js
export const hasConsent = (type) => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("cookieConsent");
    if (!stored) return false;
    try {
      const parsed = JSON.parse(stored);
      return parsed[type] === true;
    } catch {
      return false;
    }
  };
  