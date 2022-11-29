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
  Auth: Auth;

  /**
   * @example
   * const Paper = new PaperClient({ clientId: "", chain: "Goerli" })
   * @param {string} initParams.clientId the clientId found on the {@link https://paper.xyz/dashboard/developers developer's dashboard}
   * @param {Chains} initParams.chain sets the default chain that the EmbeddedWallet will live on.
   * @param {CustomizationOptionsType} initParams.styles sets the default style override for any modal that pops up asking for user's details when creating wallet or logging in.
   */
  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.Auth = new Auth({ clientId });
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
    if (await this.Auth.isLoggedIn()) {
      const result = await this.wallet.initWallet();
      if (result) {
        return {
          ...result,
          wallet: this.wallet,
          emailAddress: (await this.Auth.getDetails())?.email,
        };
      }
      return {
        wallet: this.wallet,
        walletAddress: await (
          await this.wallet.getEtherJsSigner()
        ).getAddress(),
        emailAddress: (await this.Auth.getDetails())?.email,
      };
    }
    return;
  }
}
