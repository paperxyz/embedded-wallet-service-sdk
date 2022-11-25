import { CustomizationOptionsType } from "../utils/IframeCommunicator";

// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

// Class constructor types
export type PaperBaseConstructorType = { clientId: string; chain: Chains };
export type PaperConstructorWithStylesType = PaperBaseConstructorType & {
  styles?: CustomizationOptionsType;
};

export type CreateWalletReturnType = { walletAddress: string };
export type SetUpNewDeviceReturnType = { walletAddress: string };
export type HasWalletReturnType = { hasWallet: boolean };
export type IsNewDeviceReturnType = { isNewDevice: boolean };
export type IsLoggedInReturnType = { isUserLoggedIn: boolean };
