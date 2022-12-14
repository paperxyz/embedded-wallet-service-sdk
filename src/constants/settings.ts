import { Chains } from "../interfaces/EmbeddedWallets/EmbeddedWallets";

export const PAPER_APP_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "development" ||
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_NODE_ENV === "staging" &&
      typeof window !== "undefined"
    ? window.location.origin
    : "https://paper.xyz";

export const EMBEDDED_WALLET_PATH = "/sdk/2022-08-12/embedded-wallet";
export const EMBEDDED_WALLET_OTP_PATH = `${EMBEDDED_WALLET_PATH}/login-with-otp`;
export const EMBEDDED_WALLET_CREATE_WALLET_UI_PATH = `${EMBEDDED_WALLET_PATH}/create-new-wallet-ui`;
export const EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH = `${EMBEDDED_WALLET_PATH}/set-up-new-device-ui`;

export const ChainToPublicRpc: Record<Chains, string> = {
  Ethereum: "https://rpc.ankr.com/eth",
  Goerli: "https://eth-goerli.g.alchemy.com/v2/demo",
  Mumbai: "https://rpc-mumbai.maticvigil.com",
  Polygon: "https://rpc-mainnet.maticvigil.com",
};
