import type {
  GetUserStatusType,
  InitializedUser,
  PaperConstructorType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { UserStatus } from "../interfaces/EmbeddedWallets/EmbeddedWallets";
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
   * @param {string} initParams.clientId the clientId found on the {@link https://paper.xyz/dashboard/developers developer's dashboard}
   * @param {Chains} initParams.chain sets the default chain that the EmbeddedWallet will live on.
   * @param {CustomizationOptionsType} initParams.styles sets the default style override for any modal that pops up asking for user's details when creating wallet or logging in.
   */
  constructor({ clientId, chain, styles }: PaperConstructorType) {
    this.clientId = clientId;
    this.querier = new EmbeddedWalletIframeCommunicator({
      clientId,
      customizationOptions: styles,
    });
    this.auth = new Auth({ clientId, querier: this.querier });

    this.wallet = new EmbeddedWallet({
      clientId,
      chain,
      querier: this.querier,
    });
  }

  /**
   * @description
   * Sets-up the currently logged in user with their wallet.
   *
   * If User is logged out, this function does nothing and return undefined.
   *
   * If the user does not have a wallet or is on a new device, Paper automatically prompts them to set up a wallet or initialize their new device.
   * @example
   *  const Paper = new PaperEmbeddedWalletSdk({ clientId: "", chain: "Goerli" });
   *  const user = await Paper.initializeUser();
   *  if (!user) {
   *    console.log("User is not logged in");
   *    return;
   *  } else {
   *    // Accessing the user's wallet
   *    user.wallet;
   *    // Accessing the user's wallet address
   *    user.walletAddress;
   *    // Accessing the user's authentication details
   *    user.authDetails;
   *  }
   * @returns {InitializedUser | undefined} An object containing the user's authentication details, and the user wallet class. undefined if the user is logged out.
   */
  async initializeUser(): Promise<InitializedUser | undefined> {
    const userStatus = await this.wallet.getUserStatus();
    switch (userStatus.status) {
      case UserStatus.LOGGED_OUT: {
        return;
      }
      case UserStatus.LOGGED_IN_WALLET_UNINITIALIZED:
      case UserStatus.LOGGED_IN_NEW_DEVICE: {
        await this.wallet.initializeWallet();
        break;
      }
      case UserStatus.LOGGED_IN_WALLET_INITIALIZED: {
      }
    }
    return {
      authDetails: userStatus.data.authDetails,
      wallet: this.wallet,
      walletAddress: await (await this.wallet.getEthersJsSigner()).getAddress(),
    };
  }

  /**
   * Gets the various status states of the user
   * @example
   *  const userStatus = await Paper.getUserStatus();
   *  switch (userStatus.status) {
   *  case UserStatus.LOGGED_OUT: {
   *    // User is logged out, call one of the auth methods on Paper.auth to authenticate the user
   *    break;
   *  }
   *  case UserStatus.LOGGED_IN_WALLET_UNINITIALIZED: {
   *    // User is logged in, but does not have a wallet associated with it
   *    // you also have access to the user's details
   *    userStatus.data.authDetails;
   *    break;
   *  }
   *  case UserStatus.LOGGED_IN_NEW_DEVICE: {
   *    // User is logged in and created a wallet already, but is missing the device shard
   *    // You have access to:
   *    userStatus.data.authDetails;
   *    userStatus.data.walletAddress;
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
   * @returns an object to containing various information on the user statuses
   */
  async getUserStatus(): Promise<GetUserStatusType> {
    return this.wallet.getUserStatus();
  }
}
