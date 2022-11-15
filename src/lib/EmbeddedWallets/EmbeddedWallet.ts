import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import type { PaperConstructorType } from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import {
  createEmbeddedWalletIframeLink,
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

  constructor({ clientId, chain }: PaperConstructorType) {
    this.clientId = clientId;

    this.walletManagerQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });

    this.walletHoldings = new EmbeddedWalletHoldings({
      chain,
      clientId,
    });
    this.write = new GaslessTransactionMaker({ chain, clientId });
  }

  async createWallet({
    recoveryPassword,
  }: {
    recoveryPassword: string;
  }): Promise<{ walletAddress: string }> {
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
    return signer;
  }
}
