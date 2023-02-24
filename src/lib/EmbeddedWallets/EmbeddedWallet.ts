import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import { ChainToPublicRpc } from "../../constants/settings";
import {
  Chain,
  ClientIdWithQuerierAndChainType,
  GetUserWalletStatusFnReturnType,
  GetUserWalletStatusRpcReturnType,
  SetUpWalletReturnType,
  SetUpWalletRpcReturnType,
  UserWalletStatus,
  WalletAddressObjectType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { LocalStorage } from "../../utils/Storage/LocalStorage";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";

export type WalletManagementTypes = {
  createWallet: void;
  setUpNewDevice: void;
  getUserStatus: void;
  saveDeviceShare: { deviceShareStored: string };
};
export type WalletManagementUiTypes = {
  createWalletUi: void;
  setUpNewDeviceUi: void;
};

export type EmbeddedWalletInternalHelperType = { showUi: boolean };

export class EmbeddedWallet {
  protected clientId: string;
  protected chain: Chain;
  protected walletManagerQuerier: EmbeddedWalletIframeCommunicator<
    WalletManagementTypes & WalletManagementUiTypes
  >;
  protected localStorage: LocalStorage;

  public gasless: GaslessTransactionMaker;

  /**
   * Not meant to be initialized directly. Call {@link .initializeUser} to get an instance
   * @param param0
   */
  constructor({ clientId, chain, querier }: ClientIdWithQuerierAndChainType) {
    this.clientId = clientId;
    this.chain = chain;
    this.walletManagerQuerier = querier;

    this.gasless = new GaslessTransactionMaker({
      chain,
      clientId,
      querier,
    });

    this.localStorage = new LocalStorage({ clientId });
  }

  async postSetUpWallet({
    deviceShareStored,
    walletAddress,
    isIframeStorageEnabled,
  }: SetUpWalletRpcReturnType): Promise<WalletAddressObjectType> {
    if (!isIframeStorageEnabled) {
      this.localStorage.saveDeviceShare(deviceShareStored);
      await this.walletManagerQuerier.call<void>({
        procedureName: "saveDeviceShare",
        params: {
          deviceShareStored,
        },
      });
    }
    return { walletAddress };
  }

  /**
   * @private
   * @returns {{walletAddress: string, initialUserStatus: UserWalletStatus}} an object containing the user's wallet address
   */
  private async createWallet(
    props: EmbeddedWalletInternalHelperType
  ): Promise<SetUpWalletReturnType | undefined> {
    let newWalletDetails;
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
          params: undefined,
        });
    }
    await this.postSetUpWallet(newWalletDetails);

    return {
      walletAddress: newWalletDetails.walletAddress,
      initialUserStatus: UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED,
    };
  }

  /**
   * @private
   * @param {Object} props options to either show or not show UI.
   * @returns {{walletAddress: string, initialUserStatus: UserWalletStatus}} an object containing the user's wallet address
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
          params: undefined,
        });
    }

    await this.postSetUpWallet(newWalletDetails);

    return {
      walletAddress: newWalletDetails.walletAddress,
      initialUserStatus: UserWalletStatus.LOGGED_IN_NEW_DEVICE,
    };
  }

  /**
   * @internal
   * Gets the various status states of the user
   * @example
   *  const userStatus = await Paper.getUserWalletStatus();
   *  switch (userStatus.status) {
   *  case UserWalletStatus.LOGGED_OUT: {
   *    // User is logged out, call one of the auth methods on Paper.auth to authenticate the user
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED: {
   *    // User is logged in, but does not have a wallet associated with it
   *    // you also have access to the user's details
   *    userStatus.data.authDetails;
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_NEW_DEVICE: {
   *    // User is logged in and created a wallet already, but is missing the device shard
   *    // You have access to:
   *    userStatus.data.authDetails;
   *    userStatus.data.walletAddress;
   *    break;
   *  }
   *  case UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED: {
   *    // user is logged in and wallet is all set up.
   *    // You have access to:
   *    userStatus.data.authDetails;
   *    userStatus.data.walletAddress;
   *    userStatus.data.wallet;
   *    break;
   *  }
   *}
   * @returns {GetUserWalletStatusFnReturnType} an object to containing various information on the user statuses
   */
  async getUserWalletStatus(): Promise<GetUserWalletStatusFnReturnType> {
    const userStatus =
      await this.walletManagerQuerier.call<GetUserWalletStatusRpcReturnType>({
        procedureName: "getUserStatus",
        params: undefined,
      });
    if (userStatus.status === UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED) {
      return {
        status: UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED,
        user: { ...userStatus.user, wallet: this },
      };
    }
    return userStatus;
  }

  /**
   * @internal
   * Use to initialize the wallet of the user.
   * Note that you don't have to call this directly.
   * This is called under the hood when you call {@link PaperEmbeddedWalletSdk.initializeUser}
   * @returns {{walletAddress: string, userInitialStatus: UserWalletStatus}} an object containing the walletAddress and the initialUserStatus (user status before calling initializeWallet) of the logged in user. undefined if user is logged out.
   */
  async initializeWallet(): Promise<SetUpWalletReturnType | undefined> {
    const { status, user } = await this.getUserWalletStatus();
    switch (status) {
      case UserWalletStatus.LOGGED_IN_NEW_DEVICE: {
        return this.setUpNewDevice({
          showUi: false,
        });
      }
      case UserWalletStatus.LOGGED_IN_WALLET_UNINITIALIZED: {
        return this.createWallet({
          showUi: false,
        });
      }
      case UserWalletStatus.LOGGED_OUT: {
        return;
      }
      case UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED: {
        return {
          initialUserStatus: UserWalletStatus.LOGGED_IN_WALLET_INITIALIZED,
          walletAddress: user.walletAddress,
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
   * @param {Chain} params.chain The chain that we are changing the user wallet too
   */
  async setChain({ chain }: { chain: Chain }): Promise<void> {
    this.chain = chain;
    this.gasless = new GaslessTransactionMaker({
      chain,
      clientId: this.clientId,
      querier: this.walletManagerQuerier,
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
      querier: this.walletManagerQuerier,
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
