export const PAPER_APP_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_NODE_ENV === "staging" &&
      typeof window !== "undefined"
    ? window.location.origin
    : "https://paper.xyz";

export const PAPER_APP_URL_ALT =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_NODE_ENV === "staging" &&
      typeof window !== "undefined"
    ? window.location.origin
    : "https://papercheckout.com";

export const CHECKOUT_WITH_ETH_IFRAME_URL = "/sdk/2022-08-12/checkout-with-eth";
export const CHECKOUT_WITH_CARD_IFRAME_URL =
  "/sdk/2022-08-12/checkout-with-card";
export const CREATE_WALLET_IFRAME_URL = "/sdk/v2/verify-email";

export const DEFAULT_BRAND_OPTIONS = {
  colorPrimary: "#cf3781",
  colorBackground: "#ffffff",
  colorText: "#1a202c",
  borderRadius: 12,
  fontFamily: "Open Sans",
};

export enum AuthProvider {
  EMAIL = "Email",
  GOOGLE = "Google",
  AUTH0 = "Auth0",
  CUSTOM_JWT = "CustomJWT",
}
