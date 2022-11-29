import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import {
  ChainToPublicRpc,
  EMBEDDED_WALLET_CREATE_WALLET_UI_PATH,
  EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH,
} from "../../constants/settings";
import type {
  Chains,
  HasWalletReturnType,
  IsNewDeviceReturnType,
  PaperConstructorWithStylesType,
  SetUpWalletReturnType,
  WalletAddressObject,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { WalletSetUp } from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type { CustomizationOptionsType } from "../../interfaces/utils/IframeCommunicator";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { openModalForFunction } from "../Modal/Modal";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
  setUpNewDevice: { recoveryPassword: string };
  hasWallet: void;
  isNewDevice: void;
  isLoggedIn: void;
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

  public writeTo: GaslessTransactionMaker;

  /**
   * Not meant to be initialized directly. Call {@link PaperClient.getUser} to get an instance
   * @param param0
   */
  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.chain = chain;
    this.styles = styles;
    this.walletManagerQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });

    this.writeTo = new GaslessTransactionMaker({
      chain,
      clientId,
    });
  }

  /**
   * Checks to see if user has set-up a wallet before.
   * @throws if user is not logged in yet
   * @returns {boolean} true if the user already has a wallet created. false otherwise
   */
  async hasWallet(): Promise<boolean> {
    const { hasWallet } =
      await this.walletManagerQuerier.call<HasWalletReturnType>("hasWallet");
    return hasWallet;
  }

  /**
   * Checks to see if the users is on a new device
   * @returns {boolean} true if the user is on a new device. false otherwise. Note that users who do not have a wallet will also be considered as on a new device
   */
  async isNewDevice(): Promise<boolean> {
    const { isNewDevice } =
      await this.walletManagerQuerier.call<IsNewDeviceReturnType>(
        "isNewDevice"
      );
    return isNewDevice;
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
  ): Promise<SetUpWalletReturnType> {
    let walletAddress: string;
    if (props.showUi) {
      ({ walletAddress } = await openModalForFunction<
        // functions that we can call on the iframe located at path
        WalletManagementUiTypes,
        // the return type of the iframe
        WalletAddressObject
        // takes one more type for the expected return type
        // use in conjunction with processResult to get the proper return type shape
      >({
        modalStyles: {
          body: {
            backgroundColor: props.colorBackground,
          },
        },
        clientId: this.clientId,
        path: EMBEDDED_WALLET_CREATE_WALLET_UI_PATH,
        procedure: "createWallet",
        params: undefined,
        customizationOptions: {
          ...props,
        },
      }));
    } else {
      ({ walletAddress } =
        await this.walletManagerQuerier.call<WalletAddressObject>(
          "createWallet",
          {
            recoveryPassword: props.recoveryPassword,
          }
        ));
    }
    return { walletAddress, walletSetUp: WalletSetUp.NewWallet };
  }

  /**
   * @private
   * @param {Object} props options to either show or not show UI.
   * @returns {{walletAddress: string}} an object containing the user's wallet address
   */
  private async setUpNewDevice(
    props: EmbeddedWalletInternalHelperType
  ): Promise<SetUpWalletReturnType> {
    let walletAddress: string;
    if (props.showUi) {
      ({ walletAddress } = await openModalForFunction<
        WalletManagementUiTypes,
        WalletAddressObject
      >({
        modalStyles: {
          body: {
            backgroundColor: props.colorBackground,
          },
        },
        clientId: this.clientId,
        path: EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH,
        procedure: "setUpNewDevice",
        params: undefined,
        customizationOptions: {
          ...props,
        },
      }));
    } else {
      ({ walletAddress } =
        await this.walletManagerQuerier.call<WalletAddressObject>(
          "setUpNewDevice",
          {
            recoveryPassword: props.recoveryPassword,
          }
        ));
    }
    return { walletAddress, walletSetUp: WalletSetUp.NewDevice };
  }

  /**
   * Use to initialize the wallet of the logged in user.
   * Note that you don't have to call this directly.
   * This is called under the hood when you call {@link PaperClient.getUser}
   * @returns the wallet address of the logged in user.
   */
  async initWallet(): Promise<SetUpWalletReturnType | undefined> {
    if (!(await this.hasWallet())) {
      return this.createWallet({
        showUi: true,
        ...this.styles,
      });
    }
    if (await this.isNewDevice()) {
      return this.setUpNewDevice({
        showUi: true,
        ...this.styles,
      });
    }
    return;
  }

  /**
   * Returns an Ether.Js compatible signer that you can use in conjunction with the rest of dApp
   * @example
   * const Paper = new PaperClient({clientId: "", chain: "Polygon"})
   * const user = await Paper.getUser();
   * // returns a signer on the Polygon mainnet
   * const signer = await user.getEtherJsSigner()
   * // returns a signer that is on the ethereum mainnet
   * const signer = await user.getEtherJsSigner({rpcEndpoint: "https://eth-rpc.gateway.pokt.network"})
   * @param {Networkish} network.rpcEndpoint the rpc url where calls will be routed through
   * @returns A signer that is compatible with Ether.js. Defaults to the public rpc on the chain specified when initializing the {@link PaperClient} instance
   */
  async getEtherJsSigner(network?: {
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
}
