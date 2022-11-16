import type {
  Chains,
  PaperConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type {
  ContractCallInputType,
  ContractCallReturnType,
} from "../../interfaces/EmbeddedWallets/GaslessTransactionMaker";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type GaslessTransactionQuerierTypes = {
  callContract: ContractCallInputType & { chain: Chains };
};

/**
 * @description GaslessTransactionMaker is used to execute gasless transactions from the embedded wallets
 */
export class GaslessTransactionMaker {
  protected chain: Chains;
  protected clientId: string;
  protected gaslessTransactionQuerier: EmbeddedWalletIframeCommunicator<GaslessTransactionQuerierTypes>;
  constructor({ chain, clientId }: PaperConstructorType) {
    this.chain = chain;
    this.clientId = clientId;
    this.gaslessTransactionQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
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
