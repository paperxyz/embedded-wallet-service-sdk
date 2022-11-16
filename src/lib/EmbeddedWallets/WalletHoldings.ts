import {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import { WalletHoldingInputType } from "../../interfaces/EmbeddedWallets/WalletHoldings";
import {
  createEmbeddedWalletIframeLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";

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
  protected walletHoldingQuerier: IframeCommunicator<WalletHoldingQueryTypes>;

  constructor({ chain, clientId }: PaperConstructorType) {
    this.clientId = clientId;
    this.chain = chain;
    this.walletHoldingQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });
  }
  async listNfts({ chain, limit, offset }: WalletHoldingInputType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
  async listTokens({ chain, limit, offset }: WalletHoldingInputType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
}
