import {
  AuthLoginReturnType,
  AuthProvider,
  AuthStoredTokenWithCookieReturnType,
} from "../interfaces/Auth";
import type {
  AuthDetails,
  ClientIdWithQuerierType,
  LogoutReturnType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { LocalStorage } from "../utils/Storage/LocalStorage";

export type AuthQuerierTypes = {
  loginWithJwtAuthCallback: {
    token: string;
    authProvider: AuthProvider;
  };
  saveAuthCookie: { authCookie: string };
  loginWithPaperModal: void | { email: string };
  logout: void;
};

export class Auth {
  protected clientId: string;
  protected AuthQuerier: EmbeddedWalletIframeCommunicator<AuthQuerierTypes>;
  protected localStorage: LocalStorage;
  protected onAuthSuccess: (
    authDetails: AuthDetails
  ) => Promise<AuthLoginReturnType>;

  /**
   * Used to manage the user's auth states. This should not be instantiated directly.
   * Call {@link PaperEmbeddedWalletSdk.auth} instead.
   *
   * Authentication settings can be managed via the [authentication settings dashboard](https://withpaper.com/dashboard/auth-settings)
   * @param {string} params.clientId the clientId associated with the various authentication settings
   */
  constructor({
    clientId,
    querier,
    onAuthSuccess,
  }: ClientIdWithQuerierType & {
    onAuthSuccess: (authDetails: AuthDetails) => Promise<AuthLoginReturnType>;
  }) {
    this.clientId = clientId;
    this.AuthQuerier = querier;
    this.localStorage = new LocalStorage({ clientId });
    this.onAuthSuccess = onAuthSuccess;
  }

  private async postLogin({
    storedToken,
  }: AuthStoredTokenWithCookieReturnType): Promise<AuthLoginReturnType> {
    if (storedToken.storeCookieString) {
      this.localStorage.saveAuthCookie(storedToken.cookieString);
      await this.AuthQuerier.call({
        procedureName: "saveAuthCookie",
        params: {
          authCookie: storedToken.cookieString,
        },
      });
    }
    const initializedUser = await this.onAuthSuccess(storedToken.authDetails);
    return initializedUser;
  }

  /**
   * @description
   * Used to log the user in with an oauth login flow
   *
   * Note that you have to either enable "Auth0" or "Custom JSON Web Token" in the [auth setting dashboard](https://withpaper.com/dashboard/auth-settings) in order to use this
   * @param {string} jwtParams.token The associate token from the oauth callback
   * @param {AuthProvider} jwtParams.provider The Auth provider that is being used
   * @returns {{user: InitializedUser}} An InitializedUser object containing the user's status, wallet, authDetails, and more
   */
  async loginWithJwtAuth({
    token,
    authProvider,
  }: {
    token: string;
    authProvider: AuthProvider;
  }): Promise<AuthLoginReturnType> {
    const result =
      await this.AuthQuerier.call<AuthStoredTokenWithCookieReturnType>({
        procedureName: "loginWithJwtAuthCallback",
        params: {
          token,
          authProvider,
        },
      });
    return this.postLogin(result);
  }

  /**
   * @description
   * Used to log the user into their Paper wallet on your platform via a myriad of auth providers
   *
   * @example
   * const Paper = new PaperEmbeddedWalletSdk({clientId: "YOUR_CLIENT_ID", chain: "Polygon"})
   * try {
   *   await Paper.auth.loginWithPaperModal();
   *   // user is now logged in
   * } catch (e) {
   *   // User closed modal or something else went wrong during the authentication process
   *   console.error(e)
   * }
   *
   * @returns {{user: InitializedUser}} An InitializedUser object containing the user's status, wallet, authDetails, and more
   */
  async loginWithPaperModal(): Promise<AuthLoginReturnType> {
    const result =
      await this.AuthQuerier.call<AuthStoredTokenWithCookieReturnType>({
        procedureName: "loginWithPaperModal",
        params: undefined,
        showIframe: true,
      });
    return this.postLogin(result);
  }

  /**
   * @description
   * Used to log the user into their Paper wallet using email OTP
   *
   * @example
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"})
   *  // prompts user to enter the code they received
   *  await Paper.auth.loginWithPaperEmailOtp({ email : "you@example.com" });
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @returns {{user: InitializedUser}} An InitializedUser object containing the user's status, wallet, authDetails, and more
   */
  async loginWithPaperEmailOtp({
    email,
  }: {
    email: string;
  }): Promise<AuthLoginReturnType> {
    const result =
      await this.AuthQuerier.call<AuthStoredTokenWithCookieReturnType>({
        procedureName: "loginWithPaperModal",
        params: { email },
        showIframe: true,
      });
    return this.postLogin(result);
  }

  /**
   * @description
   * Logs any existing user out of their wallet.
   * @throws when something goes wrong logging user out
   * @returns {{success: boolean}} true if a user is successfully logged out. false if there's no user currently logged in.
   */
  async logout(): Promise<LogoutReturnType> {
    const { success } = await this.AuthQuerier.call<LogoutReturnType>({
      procedureName: "logout",
      params: undefined,
    });
    const isRemoveAuthCookie = await this.localStorage.removeAuthCookie();
    const isRemoveLocalDeviceShare =
      await this.localStorage.removeDeviceShare();

    return {
      success: success || isRemoveAuthCookie || isRemoveLocalDeviceShare,
    };
  }
}
