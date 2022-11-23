import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import {
  ChainToPublicRpc,
  EMBEDDED_WALLET_CREATE_WALLET_UI_PATH,
  EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH,
} from "../../constants/settings";
import type {
  Chains,
  CreateWalletReturnType,
  HasWalletReturnType,
  IsNewDeviceReturnType,
  PaperConstructorType,
  SetUpNewDeviceReturnType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { ModalInterface } from "../../interfaces/Modal";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { openModalForFunction } from "../Modal/Modal";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";
import { WalletHoldings } from "./WalletHoldings";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
  setUpNewDevice: { recoveryPassword: string };
  hasWallet: void;
  isNewDevice: void;
};
export type WalletManagementUiTypes = {
  createWallet: void;
  setUpNewDevice: void;
};

export type EmbeddedWalletInternalHelperType =
  | { recoveryPassword: string; showUi: false }
  | ({
      showUi: true;
    } & ModalInterface);

export class EmbeddedWallet {
  protected clientId: string;
  protected chain: Chains;
  protected walletManagerQuerier: EmbeddedWalletIframeCommunicator<WalletManagementTypes>;

  public walletHoldings: WalletHoldings;
  public writeTo: GaslessTransactionMaker;
  public details: { getWalletAddress: () => Promise<string> };

  constructor({ clientId, chain }: PaperConstructorType) {
    this.clientId = clientId;
    this.chain = chain;

    this.walletManagerQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });

    this.walletHoldings = new WalletHoldings({
      chain,
      clientId,
    });
    this.writeTo = new GaslessTransactionMaker({
      chain,
      clientId,
    });
    this.details = {
      getWalletAddress: async () => {
        return (await this.getSigner()).getAddress();
      },
    };
  }

  async hasWallet(): Promise<boolean> {
    const { hasWallet } =
      await this.walletManagerQuerier.call<HasWalletReturnType>("hasWallet");
    return hasWallet;
  }
  async isNewDevice(): Promise<boolean> {
    const { isNewDevice } =
      await this.walletManagerQuerier.call<IsNewDeviceReturnType>(
        "isNewDevice"
      );
    return isNewDevice;
  }

  /**
   * Wil throw if attempting to create wallet for a user who already has a wallet.
   * Make sure to call `Paper.Login.Auth` first.
   * @param showUi if false, recoveryPassword is needed
   * @param recoveryPassword Must follow good password practice. As of writing this
   * * pwd >= 6 character
   * @returns the wallet address of the created wallet
   */
  private async createWallet(
    props: EmbeddedWalletInternalHelperType
  ): Promise<CreateWalletReturnType> {
    if (props.showUi) {
      return openModalForFunction<
        // functions that we can call on the iframe located at path
        WalletManagementUiTypes,
        // the return type of the iframe
        CreateWalletReturnType
        // takes one more type for the expected return type
        // use in conjunction with processResult to get the proper return type shape
      >({
        modalContainer: props.modalContainer,
        modalStyles: props.modalStyles,
        clientId: this.clientId,
        path: EMBEDDED_WALLET_CREATE_WALLET_UI_PATH,
        procedure: "createWallet",
        params: undefined,
      });
    }
    return this.walletManagerQuerier.call<CreateWalletReturnType>(
      "createWallet",
      {
        recoveryPassword: props.recoveryPassword,
      }
    );
  }

  private async setUpNewDevice(
    props: EmbeddedWalletInternalHelperType
  ): Promise<SetUpNewDeviceReturnType> {
    if (props.showUi) {
      return openModalForFunction<
        WalletManagementUiTypes,
        SetUpNewDeviceReturnType
      >({
        modalContainer: props.modalContainer,
        modalStyles: props.modalStyles,
        clientId: this.clientId,
        path: EMBEDDED_WALLET_SET_UP_NEW_DEVICE_UI_PATH,
        procedure: "setUpNewDevice",
        params: undefined,
      });
    }
    return this.walletManagerQuerier.call<SetUpNewDeviceReturnType>(
      "setUpNewDevice",
      {
        recoveryPassword: props.recoveryPassword,
      }
    );
  }

  /**
   * Use to initialize the wallet of the logged in user.
   * Make sure to call this only after user is logged in.
   * @returns the wallet address of the logged in user.
   */
  async initWallet(
    modalStyles?: ModalInterface
  ): Promise<{ walletAddress: string } | undefined> {
    if (!(await this.hasWallet())) {
      return this.createWallet({
        showUi: true,
        ...modalStyles,
      });
    }
    if (await this.isNewDevice()) {
      return this.setUpNewDevice({
        showUi: true,
        ...modalStyles,
      });
    }
    return;
  }

  async getSigner(network?: {
    rpcEndpoint: Networkish;
  }): Promise<EthersSigner> {
    await this.initWallet();
    const signer = new EthersSigner({
      clientId: this.clientId,
      provider: getDefaultProvider(
        network?.rpcEndpoint ?? ChainToPublicRpc[this.chain]
      ),
    });
    return signer;
  }
}
