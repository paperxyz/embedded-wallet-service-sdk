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
