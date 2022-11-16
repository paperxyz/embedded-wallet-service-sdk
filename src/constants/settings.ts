import { Chains } from "../interfaces/EmbeddedWallets/EmbeddedWallets";

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

export const ChainToPublicRpc: Record<Chains, string> = {
  Ethereum: "https://rpc.ankr.com/eth",
  Goerli: "https://eth-goerli.g.alchemy.com/v2/demo",
  Mumbai: "https://rpc-mumbai.maticvigil.com",
  Polygon: "https://rpc-mainnet.maticvigil.com",
};
