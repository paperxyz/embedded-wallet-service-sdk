import {
  Chains,
  PaperConstructorType,
  WalletDetailsType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import {
  createEmbeddedWalletIframeLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";

export type WalletHoldingQueryTypes = {
  listNfts: WalletDetailsType;
  listTokens: WalletDetailsType;
};

/**
 * @description WalletHoldings responsible for all the read related methods that the developers might want to do with EmbeddedWallet
 */
export class EmbeddedWalletHoldings {
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
  async listNfts({ chain, limit, offset }: WalletDetailsType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
  async listTokens({ chain, limit, offset }: WalletDetailsType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
}
