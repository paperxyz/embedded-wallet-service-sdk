import {
  AuthAndWalletRpcReturnType,
  AuthLoginReturnType,
  AuthProvider,
} from "../interfaces/Auth";
import type {
  ClientIdWithQuerierType,
  LogoutReturnType,
  SendEmailOtpReturnType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { LocalStorage } from "../utils/Storage/LocalStorage";

export type AuthQuerierTypes = {
  loginWithJwtAuthCallback: {
    token: string;
    authProvider: AuthProvider;
    recoveryCode?: string;
  };
  saveAuthCookie: { authCookie: string };
  loginWithPaperModal: void | { email: string };
  logout: void;
  sendPaperEmailLoginOtp: { email: string };
  verifyPaperEmailLoginOtp: {
    email: string;
    otp: string;
    recoveryCode?: string;
  };
};

export class Auth {
  protected clientId: string;
  protected AuthQuerier: EmbeddedWalletIframeCommunicator<AuthQuerierTypes>;
  protected localStorage: LocalStorage;
  protected onAuthSuccess: (
    authResults: AuthAndWalletRpcReturnType
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
    onAuthSuccess: (
      authDetails: AuthAndWalletRpcReturnType
    ) => Promise<AuthLoginReturnType>;
  }) {
    this.clientId = clientId;
    this.AuthQuerier = querier;
    this.localStorage = new LocalStorage({ clientId });
    this.onAuthSuccess = onAuthSuccess;
  }

  private async postLogin({
    storedToken,
    walletDetails,
  }: AuthAndWalletRpcReturnType): Promise<AuthLoginReturnType> {
    if (storedToken.storeCookieString) {
      this.localStorage.saveAuthCookie(storedToken.cookieString);
      await this.AuthQuerier.call({
        procedureName: "saveAuthCookie",
        params: {
          authCookie: storedToken.cookieString,
        },
      });
    }
    const initializedUser = await this.onAuthSuccess({
      storedToken,
      walletDetails,
    });
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
    recoveryCode,
  }: AuthQuerierTypes["loginWithJwtAuthCallback"]): Promise<AuthLoginReturnType> {
    const result = await this.AuthQuerier.call<AuthAndWalletRpcReturnType>({
      procedureName: "loginWithJwtAuthCallback",
      params: {
        token,
        authProvider,
        recoveryCode,
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
    const result = await this.AuthQuerier.call<AuthAndWalletRpcReturnType>({
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
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"});
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
    const result = await this.AuthQuerier.call<AuthAndWalletRpcReturnType>({
      procedureName: "loginWithPaperModal",
      params: { email },
      showIframe: true,
    });
    return this.postLogin(result);
  }

  /**
   * @description
   * Sends the users at {email} an OTP code. Which they can use to have themselves verified via {@link Auth.verifyPaperEmailLoginOtp}
   *
   * @example
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"});
   *  // sends user an OTP code
   * try {
   *    await Paper.auth.sendPaperEmailLoginOtp({ email : "you@example.com" });
   * } catch(e) {
   *    // Error Sending user's email an OTP code
   *    console.error(e);
   * }
   *
   * // Then when your user is ready to verify their OTP
   * try {
   *    const user = await Paper.auth.verifyPaperEmailLoginOtp({ email: "you@example.com", otp: "6-DIGIT_CODE_HERE" });
   * } catch(e) {
   *    // Error verifying the OTP code
   *    console.error(e)
   * }
   *
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @returns {{success: boolean}} indicating if the email was successfully sent (Note the email could still end up in the user's spam folder)
   */
  async sendPaperEmailLoginOtp({
    email,
  }: AuthQuerierTypes["sendPaperEmailLoginOtp"]) {
    const { success, isNewUser } =
      await this.AuthQuerier.call<SendEmailOtpReturnType>({
        procedureName: "sendPaperEmailLoginOtp",
        params: { email },
      });
    return { success, isNewUser };
  }

  /**
   *  @description
   * Used to verify the otp that the user receives from  Paper
   *
   * See {@link Auth.sendPaperEmailLoginOtp} for how the headless call flow looks like
   *
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @param {string} props.otp The code that the user received in their email
   * @returns {{user: InitializedUser}} An InitializedUser object containing the user's status, wallet, authDetails, and more
   */
  async verifyPaperEmailLoginOtp({
    email,
    otp,
    recoveryCode,
  }: AuthQuerierTypes["verifyPaperEmailLoginOtp"]) {
    const result = await this.AuthQuerier.call<AuthAndWalletRpcReturnType>({
      procedureName: "verifyPaperEmailLoginOtp",
      params: { email, otp, recoveryCode },
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
