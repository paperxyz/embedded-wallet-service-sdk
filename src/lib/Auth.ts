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
    if (storedToken.shouldStoreCookieString) {
      this.localStorage.saveAuthCookie(storedToken.cookieString);
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
   * @param {string} jwtParams.recoveryCode This has to be passed in if the user is not logging in for the first time in order for us to decrypt and recover the users wallet
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
   *   const user = await Paper.auth.loginWithPaperModal();
   *   // user is now logged in
   * } catch (e) {
   *   // User closed modal or something else went wrong during the authentication process
   *   console.error(e)
   * }
   *
   * @returns {{user: InitializedUser}} An InitializedUser object. See {@link PaperEmbeddedWalletSdk.getUser} for more
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
   *  try {
   *    // prompts user to enter the code they received
   *    const user = await Paper.auth.loginWithPaperEmailOtp({ email : "you@example.com" });
   *    // user is now logged in
   *  } catch (e) {
   *    // User closed the OTP modal or something else went wrong during the authentication process
   *    console.error(e)
   *  }
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @returns {{user: InitializedUser}} An InitializedUser object. See {@link PaperEmbeddedWalletSdk.getUser} for more
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
   * A headless way to send the users at {email} an OTP code.
   * You need to then call {@link Auth.verifyPaperEmailLoginOtp} in order to complete the login process
   *
   * @example
   *  const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"});
   *  // sends user an OTP code
   * try {
   *    const { isNewUser } = await Paper.auth.sendPaperEmailLoginOtp({ email : "you@example.com" });
   * } catch(e) {
   *    // Error Sending user's email an OTP code
   *    console.error(e);
   * }
   *
   * // Then when your user is ready to verify their OTP
   * try {
   *    const user = await Paper.auth.verifyPaperEmailLoginOtp({ email: "you@example.com", otp: "6-DIGIT_CODE_HERE", recoveryCode: "Required if user is an existing user. i.e. !isNewUser"});
   * } catch(e) {
   *    // Error verifying the OTP code
   *    console.error(e)
   * }
   *
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @returns {{ success: boolean, isNewUser: boolean }} Success: indicating if the email was successfully sent (Note the email could still end up in the user's spam folder). IsNewUser indicates if the user is a new user to your platform
   */
  async sendPaperEmailLoginOtp({
    email,
  }: AuthQuerierTypes["sendPaperEmailLoginOtp"]) {
    const { isNewUser } = await this.AuthQuerier.call<SendEmailOtpReturnType>({
      procedureName: "sendPaperEmailLoginOtp",
      params: { email },
    });
    return { isNewUser };
  }

  /**
   *  @description
   * Used to verify the otp that the user receives from  Paper
   *
   * See {@link Auth.sendPaperEmailLoginOtp} for how the headless call flow looks like
   *
   * @param {string} props.email We will send the email an OTP that needs to be entered in order for them to be logged in.
   * @param {string} props.otp The code that the user received in their email
   * @param {string} props.recoveryCode The code that is first sent to the user when they sign up. Required if user is an existing user. i.e. !isNewUser from return params of {@link Auth.sendPaperEmailLoginOtp}
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
