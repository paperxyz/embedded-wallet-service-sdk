import { EMBEDDED_WALLET_OTP_PATH } from "../constants/settings";
import type {
  AuthStoredTokenReturnType,
  GetSocialLoginClientIdReturnType,
} from "../interfaces/Auth";
import { AuthProvider } from "../interfaces/Auth";
import type { LogoutReturnType } from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { ModalInterface } from "../interfaces/Modal";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { openModalForFunction } from "./Modal/Modal";

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
  logout: void;
};

export class Auth {
  protected clientId: string;
  protected AuthQuerier: EmbeddedWalletIframeCommunicator<AuthTypes>;

  /**
   * Used to manage the user's auth states. This should not be instantiated directly.
   * Call {@link PaperEmbeddedWalletSdk.auth} instead.
   *
   * Authentication settings can be managed via the [authentication settings dashboard](https://paper.xyz/dashboard/auth-settings)
   * @param {string} params.clientId the clientId associated with the various authentication settings
   */
  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;
    this.AuthQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }

  /**
   * @description
   * Used to initiate the Paper managed social login flow.
   *
   * Note that you have to enable "Google Login" in the [auth setting dashboard](https://paper.xyz/dashboard/auth-settings) in order to use this
   * @param {AuthProvider} socialLoginParam.provider The name of the Paper managed authProvider that is to be invoked. Right now, only AuthProvider.GOOGLE is supported
   * @param {string} socialLoginParam.redirectUri The link to redirect too upon successful login. You would call {@link loginWithSocialOAuth} on that page to complete the login process.
   * @param {string | undefined} socialLoginParam.scope The scope that the login will provide access too.
   * @throws if attempting to use other unsupported auth providers
   */
  async initializeSocialOAuth({
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

    throw new Error("Social login provider not recognized.");
  }

  /**
   * Called on the social OAuth redirect Url page to complete the login. You have to call {@link initializeSocialOAuth} before calling this function.
   * @param {AuthProvider} socialLoginParam.provider The name of the Paper managed authProvider that is to be invoked. Right now, only AuthProvider.GOOGLE is supported
   * @param {string} socialLoginParam.redirectUri This is the same url as the one you set when you called {@link initializeSocialOAuth} and should be the url of the page you call this function on as well.
   * @returns {{storedToken: {jwtToken: string, authProvider:AuthProvider, developerClientId: string}}} An object with the jwtToken, authProvider, and clientId
   */
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
    throw new Error("Social login provider not recognized.");
  }

  /**
   * @description
   * Used to login with OTP authentication.
   * 
   * Note that you have to enable "Email One-Time Password" in the [auth setting dashboard](https://paper.xyz/dashboard/auth-settings) in order to use this
   * @example
   *  // use case 1:
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"})
   *  // prompts user to enter their email and enter the code they received
   *  await Paper.auth.loginWithOtp();

   *  // use case 2:
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"})
   *  // prompts user to enter the code
   *  await Paper.auth.loginWithOtp({email: "you@example.com"});
   * @param {string} props.email optional. If provided, we will send an email containing the OTP code directly to them and skip the requesting email page
   * @throws if there is already a modal opened by this function or {@link PaperEmbeddedWalletSdk.initializeUser}
   * @returns {{storedToken: {jwtToken: string, authProvider:AuthProvider, developerClientId: string}}} An object with the jwtToken, authProvider, and clientId
   */
  async loginWithOtp(
    props?: {
      email?: string;
    } & ModalInterface
  ): Promise<AuthStoredTokenReturnType> {
    return openModalForFunction<
      { emailOTP: { email?: string } },
      AuthStoredTokenReturnType
    >({
      clientId: this.clientId,
      path: EMBEDDED_WALLET_OTP_PATH,
      procedure: "emailOTP",
      params: { email: props?.email },
      modalContainer: props?.modalContainer,
      modalStyles: props?.modalStyles,
    });
  }

  /**
   * @description
   * Used to log the user in with an oauth login flow
   *
   * Note that you have to either enable "Auth0" or "Custom JSON Web Token" in the [auth setting dashboard](https://paper.xyz/dashboard/auth-settings) in order to use this
   * @param {string} jwtParams.token The associate token from the oauth callback
   * @param {AuthProvider} jwtParams.provider The Auth provider that is being used
   * @returns {{storedToken: {jwtToken: string, authProvider:AuthProvider, developerClientId: string}}} An object with the jwtToken, authProvider, and clientId
   */
  async loginWithJwtAuth({
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

  /**
   * @description
   * Logs any existing user out of their wallet.
   * @throws when something goes wrong logging user out
   * @returns {boolean} true if a user is successfully logged out. false if there's no user currently logged in.
   */
  async logout(): Promise<boolean> {
    const { success } = await this.AuthQuerier.call<LogoutReturnType>("logout");
    return success;
  }
}
