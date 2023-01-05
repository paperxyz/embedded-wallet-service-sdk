import { Chains } from "../interfaces/EmbeddedWallets/EmbeddedWallets";

const isDev = (): boolean => {
  return !!(
    typeof window !== "undefined" &&
    window.localStorage.getItem("IS_PAPER_DEV") === "true"
  );
};

const isStaging = (): boolean => {
  return !!(
    typeof window !== "undefined" && window.location.origin.includes("zeet.app")
  );
};

const isOldPaperDomain = (): boolean =>
  typeof window !== "undefined" && window.location.origin.includes("paper.xyz");

export const getPaperOriginUrl = (): string => {
  if (isDev())
    return "https://d180-2607-fea8-1ea1-d900-acba-1d63-8773-946f.ngrok.io";
  if (isStaging()) {
    if (process?.env?.ZEET_DEPLOYMENT_URL) {
      return `https://${process.env.ZEET_DEPLOYMENT_URL}`;
    }

    if (typeof window !== "undefined") return window.location.origin;

    return "https://withpaper.com";
  }

  if (isOldPaperDomain()) return window.location.origin;

  return "https://withpaper.com";
};

export const PAPER_APP_URL = getPaperOriginUrl();

export const EMBEDDED_WALLET_PATH = "/sdk/2022-08-12/embedded-wallet";
export const EMBEDDED_WALLET_OTP_PATH = `${EMBEDDED_WALLET_PATH}/login-with-otp`;
export const EMBEDDED_WALLET_CREATE_WALLET_UI_PATH = `${EMBEDDED_WALLET_PATH}/create-new-wallet-ui`;
export const EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH = `${EMBEDDED_WALLET_PATH}/set-up-new-device-ui`;

export const AUTH_TOKEN_LOCAL_STORAGE_PREFIX = "walletToken";
export const AUTH_TOKEN_LOCAL_STORAGE_NAME = (clientId: string) => {
  return `${AUTH_TOKEN_LOCAL_STORAGE_PREFIX}-${clientId}`;
};
export const DEVICE_SHARE_LOCAL_STORAGE_PREFIX = "a";
export const DEVICE_SHARE_LOCAL_STORAGE_NAME = (clientId: string) =>
  `${DEVICE_SHARE_LOCAL_STORAGE_PREFIX}-${clientId}`;

export const ChainToPublicRpc: Record<Chains, string> = {
  Ethereum: "https://rpc.ankr.com/eth",
  Goerli: "https://eth-goerli.g.alchemy.com/v2/demo",
  Mumbai: "https://rpc-mumbai.maticvigil.com",
  Polygon: "https://rpc-mainnet.maticvigil.com",
};
