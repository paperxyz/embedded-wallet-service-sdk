import {
  GetUser,
  PaperConstructorType,
  UserStatus,
  UserWalletStatus,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { Auth } from "./Auth";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";

export class PaperEmbeddedWalletSdk {
  protected clientId: string;
  protected querier: EmbeddedWalletIframeCommunicator<any>;

  private wallet: EmbeddedWallet;
  /**
   * Used to manage the Auth state of the user.
   */
  auth: Auth;

  /**
   * @example
   * const Paper = new PaperEmbeddedWalletSdk({ clientId: "", chain: "Goerli" });
   * @param {string} initParams.clientId the clientId found on the {@link https://withpaper.com/dashboard/developers developer's dashboard}
   * @param {Chains} initParams.chain sets the default chain that the EmbeddedWallet will live on.
   * @param {CustomizationOptionsType} initParams.styles sets the default style override for any modal that pops up asking for user's details when creating wallet or logging in.
   */
  constructor({ clientId, chain, styles }: PaperConstructorType) {
    this.clientId = clientId;
    this.querier = new EmbeddedWalletIframeCommunicator({
      clientId,
      customizationOptions: styles,
    });
    this.wallet = new EmbeddedWallet({
      clientId,
      chain,
      querier: this.querier,
    });

    this.auth = new Auth({
      clientId,
      querier: this.querier,
      onAuthSuccess: async (authResult) => {
        await this.wallet.postSetUpWallet(authResult.walletDetails);
        return {
          user: {
            status: UserStatus.LOGGED_IN_WALLET_INITIALIZED,
            authDetails: authResult.storedToken.authDetails,
            wallet: this.wallet,
            walletAddress: authResult.walletDetails.walletAddress,
          },
        };
      },
    });
  }

  /**
   * Gets the various status states of the user
   * @example
   *  const user = await Paper.getUser();
   *  switch (userStatus.status) {
   *  case UserStatus.LOGGED_OUT: {
   *    // User is logged out, call one of the auth methods on Paper.auth to authenticate the user
   *    break;
   *  }
   *  case UserStatus.LOGGED_IN_WALLET_INITIALIZED: {
   *    // user is logged in and wallet is all set up.
   *    // You have access to:
   *    userStatus.data.authDetails;
   *    userStatus.data.walletAddress;
   *    userStatus.data.wallet;
   *    break;
   *  }
   *}
   * @returns {GetUser} an object to containing various information on the user statuses
   */
  async getUser(): Promise<GetUser> {
    const userStatus = await this.wallet.getUserWalletStatus();
    switch (userStatus.status) {
      case UserWalletStatus.LOGGED_IN_NEW_DEVICE:
      case UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED:
        console.error(
          "BAD STATE: If you see this repeatedly, please reach out to us on discord and let us know!"
        );
        // User clears part of their local cache somehow
        await this.wallet.initializeWallet();
        return this.getUser();
      case UserWalletStatus.LOGGED_OUT:
        return {
          status: UserStatus.LOGGED_OUT,
        };
      case UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED:
        return {
          status: UserStatus.LOGGED_IN_WALLET_INITIALIZED,
          ...userStatus.user,
        };
    }
  }
}
