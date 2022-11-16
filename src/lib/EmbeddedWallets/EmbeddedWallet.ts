import type { Networkish } from "@ethersproject/providers";
import { getDefaultProvider } from "@ethersproject/providers";
import { ChainToPublicRpc } from "../../constants/settings";
import type {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { GaslessTransactionMaker } from "./GaslessTransactionMaker";
import { EthersSigner } from "./Signer";
import { WalletHoldings } from "./WalletHoldings";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
};

export class EmbeddedWallet {
  protected clientId: string;
  protected chain: Chains;
  protected walletManagerQuerier: EmbeddedWalletIframeCommunicator<WalletManagementTypes>;

  public walletHoldings: WalletHoldings;
  public writeTo: GaslessTransactionMaker;
  public details: { walletAddress: Promise<string> };

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
