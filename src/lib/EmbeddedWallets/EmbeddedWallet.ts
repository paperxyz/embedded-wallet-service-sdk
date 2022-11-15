import { getDefaultProvider, Networkish } from "@ethersproject/providers";
import { EmbeddedWalletConstructorType } from "../../interfaces/EmbededWallets";
import {
  createEmbeddedWalletLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";
import { EthersSigner } from "../Signer";
import { EmbeddedWalletHoldings } from "./EmbeddedWalletHoldings";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
};

export class EmbeddedWallet {
  protected clientId: string;
  protected walletManagerQuerier: IframeCommunicator<WalletManagementTypes>;

  public walletHoldings: EmbeddedWalletHoldings;
  public write: GaslessTransactionMaker;

  constructor({ clientId, chain }: EmbeddedWalletConstructorType) {
    this.clientId = clientId;

    this.walletManagerQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletLink({ clientId }).href,
    });

    this.walletHoldings = new EmbeddedWalletHoldings();
    this.write = new GaslessTransactionMaker({ chain });
  }

  async createWallet({
    recoveryPassword,
  }: {
    recoveryPassword: string;
  }): Promise<{ walletAddress: string }> {
    await this.walletManagerQuerier.init();
    return this.walletManagerQuerier.call<{ walletAddress: string }>(
      "createWallet",
      {
        recoveryPassword,
      }
    );
  }

  async getSigner({ rpcEndpoint }: { rpcEndpoint?: Networkish }) {
    const signer = new EthersSigner({
      clientId: this.clientId,
      provider: getDefaultProvider(rpcEndpoint),
    });
    return signer.init();
  }
}
