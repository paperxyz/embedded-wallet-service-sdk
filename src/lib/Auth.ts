import { EMBEDDED_WALLET_OTP_PATH } from "../constants/settings";
import type {
  AuthStoredTokenReturnType,
  GetSocialLoginClientIdReturnType,
  StoredTokenType,
} from "../interfaces/Auth";
import { AuthProvider } from "../interfaces/Auth";
import type {
  GetAuthDetailsReturnType,
  IsLoggedInReturnType,
  LogoutReturnType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import type { ModalInterface } from "../interfaces/Modal";
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

  /**
   * Used to initiate the Paper managed social login flow.
   * @param {AuthProvider} socialLoginParam.provider The name of the Paper managed authProvider that is to be invoked. Right now, only AuthProvider.GOOGLE is supported
   * @param {string} socialLoginParam.redirectUri The link to redirect too upon successful login. You would call {@link loginWithSocialOAuthCallback} on that page to complete the login process. @TODO
   * @param {string | undefined} socialLoginParam.scope The scope that the login will provide access too.
   */
  async loginWithSocialOAuth({
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

  /**
   *
   * @param {AuthProvider} socialLoginParam.provider The name of the Paper managed authProvider that is to be invoked. Right now, only AuthProvider.GOOGLE is supported
   * @param {string} socialLoginParam.redirectUri @TODO
   * @returns {{storedToken: {jwtToken: string, authProvider:AuthProvider, developerClientId: string}}} An object with the jwtToken, authProvider, and clientId
   */
  async loginWithSocialOAuthCallback({
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

  async loginWithOTP(
    props?: {
      email?: string;
    } & ModalInterface
  ): Promise<StoredTokenType | Boolean> {
    const isLoggedIn = await this.isLoggedIn();

    return (
      isLoggedIn ||
      openModalForFunction<{ emailOTP: { email?: string } }, StoredTokenType>({
        clientId: this.clientId,
        path: EMBEDDED_WALLET_OTP_PATH,
        procedure: "emailOTP",
        params: { email: props?.email },
        modalContainer: props?.modalContainer,
        modalStyles: props?.modalStyles,
      })
    );
  }

  /**
   * Used to log the user in with an oauth login flow
   * @param {string} jwtParams.token The associate token from the oauth callback
   * @param {AuthProvider} jwtParams.provider The Auth provider that is being used
   * @returns {{storedToken: {jwtToken: string, authProvider:AuthProvider, developerClientId: string}}} An object with the jwtToken, authProvider, and clientId
   */
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

  /**
   * Checks to see if there is a user logged in and is able to access their wallet
   * @returns {boolean} true if there is a user that is logged in. false otherwise
   */
  async isLoggedIn(): Promise<boolean> {
    const { isUserLoggedIn } =
      await this.AuthQuerier.call<IsLoggedInReturnType>("isLoggedIn");
    return isUserLoggedIn;
  }

  /**
   * Logs any existing user out of their wallet.
   * @returns {boolean} true if a user is successfully logged out. false if no user exists or something went wrong logging the user out.
   */
  async logout(): Promise<boolean> {
    const { success } = await this.AuthQuerier.call<LogoutReturnType>("logout");
    return success;
  }

  /**
   * Returns information associated with user that is currently authenticated
   * @returns {Object | undefined} An object containing the email if it exists
   */
  async getDetails(): Promise<GetAuthDetailsReturnType | undefined> {
    return { email: "" };
  }
}
