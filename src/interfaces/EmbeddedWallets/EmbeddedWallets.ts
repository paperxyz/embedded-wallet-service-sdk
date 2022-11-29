import { CustomizationOptionsType } from "../utils/IframeCommunicator";

// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

// Class constructor types
export type PaperBaseConstructorType = { clientId: string; chain: Chains };
export type PaperConstructorWithStylesType = PaperBaseConstructorType & {
  styles?: CustomizationOptionsType;
};

export enum WalletSetUp {
  NewWallet,
  NewDevice,
}
export type WalletAddressObject = {
  walletAddress: string;
};
export type SetUpWalletReturnType = WalletAddressObject & {
  walletSetUp: WalletSetUp;
};
export type HasWalletReturnType = { hasWallet: boolean };
export type IsNewDeviceReturnType = { isNewDevice: boolean };
export type IsLoggedInReturnType = { isUserLoggedIn: boolean };
export type LogoutReturnType = { success: boolean };
export type GetAuthDetailsReturnType = { email: string };
