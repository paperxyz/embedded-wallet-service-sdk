import {
  AuthDetails,
  InitializedUser,
  SetUpWalletRpcReturnType,
} from "./EmbeddedWallets/EmbeddedWallets";

export enum AuthProvider {
  PAPER_EMAIL_OTP = "PaperEmailOTP",
  GOOGLE = "Google",
  AUTH0 = "Auth0",
  CUSTOM_JWT = "CustomJWT",
}

export type GetSocialLoginClientIdReturnType = {
  clientId: string;
};

export type StoredTokenType = {
  jwtToken: string;
  authProvider: AuthProvider;
  authDetails: AuthDetails;
  developerClientId: string;
};

export type AuthStoredTokenReturnType = {
  storedToken: StoredTokenType;
};

export type AuthStoredTokenWithCookieReturnType = {
  storedToken: StoredTokenType & {
    cookieString: string;
    shouldStoreCookieString: boolean;
    isNewUser: boolean;
  };
};
export type AuthAndWalletRpcReturnType = AuthStoredTokenWithCookieReturnType & {
  walletDetails: SetUpWalletRpcReturnType;
};

export type AuthLoginReturnType = { user: InitializedUser };
