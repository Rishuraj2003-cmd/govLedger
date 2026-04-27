const TOKEN_KEY = "bihar_fund_tracker_token";
const LANGUAGE_KEY = "bihar_fund_tracker_language";

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || "en";
}

export function setStoredLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language);
}
