import type { EmbeddedWallet } from "../../lib/EmbeddedWallets/EmbeddedWallet";
import type { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { CustomizationOptionsType } from "../utils/IframeCommunicator";

// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

// Class constructor types
export type ClientIdConstructorType = { clientId: string };
export type ClientIdWithQuerierType = ClientIdConstructorType & {
  querier: EmbeddedWalletIframeCommunicator<any>;
};
export type ClientIdWithQuerierAndChainType = ClientIdWithQuerierType & {
  chain: Chains;
};
export type PaperConstructorType = ClientIdConstructorType & {
  chain: Chains;
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
// this is the return type from the iframe
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

// this is the return type from the function that user calls
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
