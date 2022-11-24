export enum AuthProvider {
  EMAIL = "Email",
  GOOGLE = "Google",
  AUTH0 = "Auth0",
  CUSTOM_JWT = "CustomJWT",
}

export type GetSocialLoginClientIdReturnType = {
  clientId: string;
};

export type JwtAuthReturnType = {
  jwtToken: string;
  authProvider: AuthProvider;
  developerClientId: string;
};
