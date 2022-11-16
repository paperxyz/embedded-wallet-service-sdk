import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import { ChainToPublicRpc } from "../../constants/settings";
import type {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import {
  createEmbeddedWalletIframeLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";
import { WalletHoldings } from "./WalletHoldings";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
};

export class EmbeddedWallet {
  protected clientId: string;
  protected chain: Chains;
  protected walletManagerQuerier: IframeCommunicator<WalletManagementTypes>;

  public walletHoldings: WalletHoldings;
  public writeTo: GaslessTransactionMaker;
  public details: { walletAddress: Promise<string> };

  constructor({ clientId, chain }: PaperConstructorType) {
    this.clientId = clientId;
    this.chain = chain;

    this.walletManagerQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });

    this.walletHoldings = new WalletHoldings({
      chain,
      clientId,
    });
    this.writeTo = new GaslessTransactionMaker({ chain, clientId });
    this.details = { walletAddress: this.getSigner().getAddress() };
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

  getSigner(network?: { rpcEndpoint: Networkish }) {
    const signer = new EthersSigner({
      clientId: this.clientId,
      provider: getDefaultProvider(
        network?.rpcEndpoint ?? ChainToPublicRpc[this.chain]
      ),
    });
    return signer;
  }
}
