import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import { ChainToPublicRpc } from "../../constants/settings";
import {
  Chains,
  GetUserStatusReturnType,
  GetUserStatusType,
  PaperConstructorWithStylesType,
  SetUpWalletReturnType,
  SetUpWalletRpcReturnType,
  UserStatus,
  WalletAddressObjectType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type { CustomizationOptionsType } from "../../interfaces/utils/IframeCommunicator";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { LocalStorage } from "../../utils/Storage/LocalStorage";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
  setUpNewDevice: { recoveryPassword: string };
  createWalletUi: void;
  setUpNewDeviceUi: void;
  getUserStatus: void;
  saveDeviceShare: { deviceShareStored: string };
};
export type WalletManagementUiTypes = {
  createWallet: void;
  setUpNewDevice: void;
};

export type EmbeddedWalletInternalHelperType =
  | { recoveryPassword: string; showUi: false }
  | ({
      showUi: true;
    } & CustomizationOptionsType);

export class EmbeddedWallet {
  protected clientId: string;
  protected chain: Chains;
  protected walletManagerQuerier: EmbeddedWalletIframeCommunicator<WalletManagementTypes>;
  protected styles: CustomizationOptionsType | undefined;
  protected localStorage: LocalStorage;

  public gasless: GaslessTransactionMaker;

  /**
   * Not meant to be initialized directly. Call {@link .initializeUser} to get an instance
   * @param param0
   */
  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.chain = chain;
    this.styles = styles;
    this.walletManagerQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });

    this.gasless = new GaslessTransactionMaker({
      chain,
      clientId,
    });

    this.localStorage = new LocalStorage({ clientId });
  }

  private async postSetUpWallet({
    deviceShareStored,
    walletAddress,
  }: SetUpWalletRpcReturnType): Promise<WalletAddressObjectType> {
    this.localStorage.saveAuthCookie(deviceShareStored);
    await this.walletManagerQuerier.call<void>({
      procedureName: "saveDeviceShare",
      params: {
        deviceShareStored,
      },
    });
    return { walletAddress };
  }

  /**
   * @private
   * @param props.showUi if false, recoveryPassword is needed
   * @param props.recoveryPassword Must follow good password practice. As of writing this:
   * * pwd >= 6 character
   * @returns {{walletAddress: string}} an object containing the user's wallet address
   */
  private async createWallet(
    props: EmbeddedWalletInternalHelperType
  ): Promise<SetUpWalletReturnType | undefined> {
    let newWalletDetails: SetUpWalletRpcReturnType;
    if (props.showUi) {
      newWalletDetails =
        await this.walletManagerQuerier.call<SetUpWalletRpcReturnType>({
          procedureName: "createWalletUi",
          params: undefined,
          showIframe: true,
        });
    } else {
      newWalletDetails =
        await this.walletManagerQuerier.call<SetUpWalletRpcReturnType>({
          procedureName: "createWallet",
          params: {
            recoveryPassword: props.recoveryPassword,
          },
        });
    }
    await this.postSetUpWallet(newWalletDetails);

    return {
      walletAddress: newWalletDetails.walletAddress,
      initialUserStatus: UserStatus.LOGGED_IN_WALLET_UNINITIALIZED,
    };
  }

  /**
   * @private
   * @param {Object} props options to either show or not show UI.
   * @returns {{walletAddress: string}} an object containing the user's wallet address
   */
  private async setUpNewDevice(
    props: EmbeddedWalletInternalHelperType
  ): Promise<SetUpWalletReturnType | undefined> {
    let newWalletDetails: SetUpWalletRpcReturnType;
    if (props.showUi) {
      newWalletDetails =
        await this.walletManagerQuerier.call<SetUpWalletRpcReturnType>({
          procedureName: "setUpNewDeviceUi",
          params: undefined,
          showIframe: true,
        });
    } else {
      newWalletDetails =
        await this.walletManagerQuerier.call<SetUpWalletRpcReturnType>({
          procedureName: "setUpNewDevice",
          params: {
            recoveryPassword: props.recoveryPassword,
          },
        });
    }

    await this.postSetUpWallet(newWalletDetails);

    return {
      walletAddress: newWalletDetails.walletAddress,
      initialUserStatus: UserStatus.LOGGED_IN_NEW_DEVICE,
    };
  }

  /**
   * @see {@link PaperEmbeddedWalletSdk.getUserStatus}
   */
  async getUserStatus(): Promise<GetUserStatusType> {
    const userStatus =
      await this.walletManagerQuerier.call<GetUserStatusReturnType>({
        procedureName: "getUserStatus",
        params: undefined,
      });
    if (userStatus.status === UserStatus.LOGGED_IN_WALLET_INITIALIZED) {
      return {
        status: UserStatus.LOGGED_IN_WALLET_INITIALIZED,
        data: { ...userStatus.data, wallet: this },
      };
    }
    return userStatus;
  }

  /**
   * Use to initialize the wallet of the user.
   * Note that you don't have to call this directly.
   * This is called under the hood when you call {@link PaperEmbeddedWalletSdk.initializeUser}
   * @returns {{walletAddress: string, userInitialStatus: UserStatus}} an object containing the walletAddress and the initialUserStatus (user status before calling initializeWallet) of the logged in user. undefined if user is logged out.
   */
  async initializeWallet(): Promise<SetUpWalletReturnType | undefined> {
    const { status, data } = await this.getUserStatus();
    switch (status) {
      case UserStatus.LOGGED_IN_NEW_DEVICE: {
        return this.setUpNewDevice({
          showUi: true,
          ...this.styles,
        });
      }
      case UserStatus.LOGGED_IN_WALLET_UNINITIALIZED: {
        return this.createWallet({
          showUi: true,
          ...this.styles,
        });
      }
      case UserStatus.LOGGED_OUT: {
        return;
      }
      case UserStatus.LOGGED_IN_WALLET_INITIALIZED: {
        return {
          initialUserStatus: UserStatus.LOGGED_IN_WALLET_INITIALIZED,
          walletAddress: data.walletAddress,
        };
      }
    }
  }

  /**
   * @description
   * Switches the chain that the user wallet is currently on.
   * @example
   * // user wallet will be set to Polygon
   * const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"});
   * const user = await Paper.initializeUser();
   * // user wallet is not on Mumbai
   * await user.wallet.setChain({ chain: "Mumbai" });
   * @param {Chains} params.chain The chain that we are changing the user wallet too
   */
  async setChain({ chain }: { chain: Chains }): Promise<void> {
    this.chain = chain;
    this.gasless = new GaslessTransactionMaker({
      chain,
      clientId: this.clientId,
    });
  }

  /**
   * Returns an Ethers.Js compatible signer that you can use in conjunction with the rest of dApp
   * @example
   * const Paper = new PaperEmbeddedWalletSdk({clientId: "", chain: "Polygon"});
   * const user = await Paper.initializeUser();
   * // returns a signer on the Polygon mainnet
   * const signer = await user.getEthersJsSigner();
   * // returns a signer that is on the ethereum mainnet
   * const signer = await user.getEthersJsSigner({rpcEndpoint: "https://eth-rpc.gateway.pokt.network"});
   * @param {Networkish} network.rpcEndpoint the rpc url where calls will be routed through
   * @throws If attempting to call the function without the user wallet initialize on their current device. This should never happen if call {@link PaperEmbeddedWalletSdk.initializeUser} before accessing this function
   * @returns A signer that is compatible with Ether.js. Defaults to the public rpc on the chain specified when initializing the {@link PaperEmbeddedWalletSdk} instance
   */
  async getEthersJsSigner(network?: {
    rpcEndpoint: Networkish;
  }): Promise<EthersSigner> {
    const signer = new EthersSigner({
      clientId: this.clientId,
      provider: getDefaultProvider(
        network?.rpcEndpoint ?? ChainToPublicRpc[this.chain]
      ),
    });
    return signer;
  }

  /**
   * Convenience function to get the user's wallet address
   * @throws If attempting to call the function without the user wallet initialize on their current device. This should never happen if call {@link PaperEmbeddedWalletSdk.initializeUser} before accessing this function
   * @returns {string} the wallet address of the user
   */
  async getAddress() {
    return (await this.getEthersJsSigner()).getAddress();
  }
}
