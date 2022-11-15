import { WalletDetailsType } from "../../interfaces/EmbededWallets";

/**
 * @description WalletHoldings responsible for all the read related methods that the developers might want to do with EmbeddedWallet
 */
export class EmbeddedWalletHoldings {
  constructor() {}
  async listNfts({ chain, limit, offset }: WalletDetailsType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
  async listTokens({ chain, limit, offset }: WalletDetailsType) {
    console.log("chain, limit, offset", chain, limit, offset);
  }
}
