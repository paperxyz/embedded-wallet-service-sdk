import type {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type {
  ContractCallInputType,
  ContractCallReturnType,
} from "../../interfaces/EmbeddedWallets/GaslessTransactionMaker";
import {
  createEmbeddedWalletIframeLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";

export type GaslessTransactionQuerierTypes = {
  callContract: ContractCallInputType & { chain: Chains };
};

/**
 * @description GaslessTransactionMaker is used to execute gasless transactions from the embedded wallets
 */
export class GaslessTransactionMaker {
  protected chain: Chains;
  protected clientId: string;
  protected gaslessTransactionQuerier: IframeCommunicator<GaslessTransactionQuerierTypes>;
  constructor({ chain, clientId }: PaperConstructorType) {
    this.chain = chain;
    this.clientId = clientId;
    this.gaslessTransactionQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });
  }
  /**
   * Use to call arbitrary contracts on the blockchain
   */
  async contract({
    contractAddress,
    method,
  }: ContractCallInputType): Promise<ContractCallReturnType> {
    return await this.gaslessTransactionQuerier.call<ContractCallReturnType>(
      "callContract",
      {
        chain: this.chain,
        contractAddress,
        method,
      }
    );
  }
}
