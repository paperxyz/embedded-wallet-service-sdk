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
  developerClientId: string;
};

export type AuthStoredTokenReturnType = {
  storedToken: StoredTokenType;
};
