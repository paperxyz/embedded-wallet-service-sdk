import {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { WalletHoldingInputType } from "../../interfaces/EmbeddedWallets/WalletHoldings";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type WalletHoldingQueryTypes = {
  listNfts: WalletHoldingInputType;
  listTokens: WalletHoldingInputType;
};

/**
 * @description WalletHoldings responsible for all the read related methods that the developers might want to do with EmbeddedWallet
 */
export class WalletHoldings {
  protected clientId: string;
  protected chain: Chains;
  protected walletHoldingQuerier: EmbeddedWalletIframeCommunicator<WalletHoldingQueryTypes>;

  constructor({ chain, clientId }: PaperConstructorType) {
    this.clientId = clientId;
    this.chain = chain;
    this.walletHoldingQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }
  async listNfts({ chain, limit, offset }: WalletHoldingInputType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
  async listTokens({ chain, limit, offset }: WalletHoldingInputType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
}
