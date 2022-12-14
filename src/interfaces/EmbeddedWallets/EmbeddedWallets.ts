import { EmbeddedWallet } from "../../lib/EmbeddedWallets/EmbeddedWallet";
import { CustomizationOptionsType } from "../utils/IframeCommunicator";

// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

// Class constructor types
export type PaperBaseConstructorType = { clientId: string; chain: Chains };
export type PaperConstructorWithStylesType = PaperBaseConstructorType & {
  styles?: CustomizationOptionsType;
};

export enum UserStatus {
  LOGGED_OUT = "Logged Out",
  LOGGED_IN_WALLET_UNINITIALIZED = "Logged In, Wallet Uninitialized",
  LOGGED_IN_NEW_DEVICE = "Logged In, New Device",
  LOGGED_IN_WALLET_INITIALIZED = "Logged In, Wallet Initialized",
}
export type AuthDetails = { email?: string };

export type InitializedUser = {
  wallet: EmbeddedWallet;
  walletAddress: string;
  authDetails: AuthDetails;
};

export type WalletAddressObjectType = {
  walletAddress: string;
};
export type SetUpWalletReturnType = WalletAddressObjectType & {
  initialUserStatus: UserStatus;
};
export type SetUpWalletRpcReturnType = WalletAddressObjectType & {
  deviceShareStored: string;
};

export type LogoutReturnType = { success: boolean };
export type GetAuthDetailsReturnType = { authDetails?: AuthDetails };

// TODO: Maybe consolidate types
export type GetUserStatusReturnType =
  | {
      status: UserStatus.LOGGED_OUT;
      data: undefined;
    }
  | {
      status: UserStatus.LOGGED_IN_WALLET_UNINITIALIZED;
      data: { authDetails: AuthDetails };
    }
  | {
      status: UserStatus.LOGGED_IN_NEW_DEVICE;
      data: { authDetails: AuthDetails; walletAddress: string };
    }
  | {
      status: UserStatus.LOGGED_IN_WALLET_INITIALIZED;
      data: Omit<InitializedUser, "wallet">;
    };
export type GetUserStatusType =
  | {
      status: UserStatus.LOGGED_OUT;
      data: undefined;
    }
  | {
      status: UserStatus.LOGGED_IN_WALLET_UNINITIALIZED;
      data: { authDetails: AuthDetails };
    }
  | {
      status: UserStatus.LOGGED_IN_NEW_DEVICE;
      data: { authDetails: AuthDetails; walletAddress: string };
    }
  | {
      status: UserStatus.LOGGED_IN_WALLET_INITIALIZED;
      data: InitializedUser;
    };
