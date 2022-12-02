import type {
  PaperConstructorWithStylesType,
  SetUpWalletReturnType,
} from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { Auth } from "./Auth";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";

export class PaperClient {
  protected clientId: string;

  private wallet: EmbeddedWallet;
  /**
   * Used to manage the Auth state of the user
   */
  auth: Auth;

  /**
   * @example
   * const Paper = new PaperClient({ clientId: "", chain: "Goerli" })
   * @param {string} initParams.clientId the clientId found on the {@link https://paper.xyz/dashboard/developers developer's dashboard}
   * @param {Chains} initParams.chain sets the default chain that the EmbeddedWallet will live on.
   * @param {CustomizationOptionsType} initParams.styles sets the default style override for any modal that pops up asking for user's details when creating wallet or logging in.
   */
  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.auth = new Auth({ clientId });
    this.wallet = new EmbeddedWallet({
      clientId,
      chain,
      styles,
    });
  }

  /**
   * @description
   * Retrieves the currently logged in user's detail.
   *
   * If the user does not have a wallet or is on a new device, Paper automatically prompts them to set up a wallet or initialize their new device
   * @example
   * const Paper = new PaperClient({ clientId: "", chain: "Goerli" })
   * const user = await Paper.getUser()
   * if (user.walletSetUp === WalletSetUp.NewWallet) {
   *  // new wallet initialized
   *  console.log('user.walletAddress', user.walletAddress)
   * } else if (user.walletSetUp === WalletSetUp.NewDevice) {
   *  // user logged in on a new device or cookies was cleared on an existing device
   *  console.log('user.walletAddress', user.walletAddress)
   * }
   * // Accessing the user's wallet
   * user.wallet
   *
   * @returns {({ User: EmbeddedWallet } & Partial<SetUpWalletReturnType>) | undefined} An object containing information about the user if there is a user logged into the system. undefined otherwise.
   */
  async getUser(): Promise<
    | ({
        wallet: EmbeddedWallet;
        emailAddress?: string;
        walletAddress: string;
      } & Partial<Omit<SetUpWalletReturnType, "walletAddress">>)
    | undefined
  > {
    if (await this.auth.isLoggedIn()) {
      const result = await this.wallet.initWallet();
      if (result) {
        return {
          ...result,
          wallet: this.wallet,
          emailAddress: (await this.auth.getDetails())?.email,
        };
      }
      return {
        wallet: this.wallet,
        walletAddress: await (
          await this.wallet.getEtherJsSigner()
        ).getAddress(),
        emailAddress: (await this.auth.getDetails())?.email,
      };
    }
    return;
  }

  /**
   * Gets the various status states of the user
   * @example
   * const status = await Paper.getUserStatus()
   *
   * // Can be remedied by calling the appropriate login method
   * console.log('status.isLoggedIn', status.isLoggedIn)
   *
   * // For both of the cases below, calling `Paper.getUser()` will automatically remedy it
   * // user does not have a wallet yet. They would need to set-up their wallet
   * console.log('status.wallet.isCreated', status.wallet.isCreated)
   * // User is on a new device, will be prompted for their password
   * console.log('status.wallet.isOnNewDevice', status.wallet.isOnNewDevice)
   * @returns an object to containing various information on the user statuses
   */
  async getUserStatus(): Promise<{
    isLoggedIn: boolean;
    wallet: { isOnNewDevice: boolean; isCreated: boolean };
  }> {
    return {
      isLoggedIn: await this.auth.isLoggedIn(),
      wallet: {
        isOnNewDevice: await this.wallet.isNewDevice(),
        isCreated: await this.wallet.hasWallet(),
      },
    };
  }
}
