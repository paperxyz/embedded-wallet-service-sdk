import {
  Chains,
  PaperBaseConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import {
  WalletHoldingInputType,
  WalletHoldingNftsReturnType,
} from "../../interfaces/EmbeddedWallets/WalletHoldings";
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

  constructor({ chain, clientId }: PaperBaseConstructorType) {
    this.clientId = clientId;
    this.chain = chain;
    this.walletHoldingQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }
  // TODO: limit and offset are not currently being respected because they are not supported by simple-hash
  async listNfts({ chain, limit, offset }: WalletHoldingInputType) {
    return this.walletHoldingQuerier.call<WalletHoldingNftsReturnType>(
      "listNfts",
      {
        chain,
        limit,
        offset,
      }
    );
  }
  // TODO: Support listing tokens
  // ? What tokens do we want to support?
  // async listTokens({ chain, limit, offset }: WalletHoldingInputType) {
  //   return this.walletHoldingQuerier.call<WalletHoldingTokensReturnType>(
  //     "listTokens",
  //     {
  //       chain,
  //       limit,
  //       offset,
  //     }
  //   );
  // }
}
