import {
  AuthProvider,
  AuthStoredTokenReturnType,
  GetSocialLoginClientIdReturnType,
} from "../interfaces/Auth";
import {
  IsLoggedInReturnType,
  logoutReturnType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type AuthTypes = {
  loginWithJwtAuthCallback: {
    token: string;
    provider: AuthProvider;
  };
  getSocialLoginClientId: {
    provider: AuthProvider.GOOGLE;
  };
  loginWithOAuthCode: {
    provider: AuthProvider.GOOGLE;
    code: string;
    redirectUri?: string;
  };
  isLoggedIn: void;
  logout: void;
};

export class Auth {
  protected clientId: string;
  protected AuthQuerier: EmbeddedWalletIframeCommunicator<AuthTypes>;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;
    this.AuthQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }

  async redirectToSocialLogin({
    provider,
    redirectUri,
    scope,
  }: {
    provider: AuthProvider.GOOGLE;
    redirectUri: string;
    scope?: string;
  }): Promise<void> {
    const { clientId } =
      await this.AuthQuerier.call<GetSocialLoginClientIdReturnType>(
        "getSocialLoginClientId",
        {
          provider,
        }
      );

    if (provider === AuthProvider.GOOGLE) {
      const scopeToUse = scope ? encodeURIComponent(scope) : "openid%20email";
      const redirectUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopeToUse}&response_type=code`;
      console.log(redirectUrl);
      window.location.href = redirectUrl;
      return;
    }

    throw new Error("Social login provider not recongized.");
  }

  async loginWithSocialOAuth({
    provider,
    redirectUri,
  }: {
    provider: AuthProvider.GOOGLE;
    redirectUri: string;
  }): Promise<AuthStoredTokenReturnType> {
    if (provider === AuthProvider.GOOGLE) {
      // Get the authorization code from the URL query string
      // Make a call to the iframe with the authorization code
      const urlParams = new URLSearchParams(window.location.search);
      const authorizationCode = urlParams.get("code");
      if (!authorizationCode) {
        throw new Error(
          "No authorization code found in the URL. Make sure to call this function in an authorized redirect_uri location that was set on your Google dashboard."
        );
      }
      return this.AuthQuerier.call<AuthStoredTokenReturnType>(
        "loginWithOAuthCode",
        {
          code: authorizationCode,
          provider,
          redirectUri,
        }
      );
    }
    throw new Error("Social login provider not recongized.");
  }

  async loginWithJwtAuthCallback({
    token,
    provider,
  }: {
    token: string;
    provider: AuthProvider;
  }): Promise<AuthStoredTokenReturnType> {
    return this.AuthQuerier.call<AuthStoredTokenReturnType>(
      "loginWithJwtAuthCallback",
      {
        token,
        provider,
      }
    );
  }

  async isLoggedIn(): Promise<boolean> {
    const { isLoggedIn } = await this.AuthQuerier.call<IsLoggedInReturnType>(
      "isLoggedIn"
    );
    return isLoggedIn;
  }

  async logout(): Promise<boolean> {
    const { success } = await this.AuthQuerier.call<logoutReturnType>("logout");
    return success;
  }
}
