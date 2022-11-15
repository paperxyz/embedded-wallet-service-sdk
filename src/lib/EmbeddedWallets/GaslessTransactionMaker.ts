import { Chains, ContractCallType } from "../../interfaces/EmbededWallets";

/**
 * @description GaslessTransactionMaker is used to execute gasless transactions from the embedded wallets
 */
export class GaslessTransactionMaker {
  protected chain: Chains;
  constructor({ chain }: { chain: Chains }) {
    this.chain = chain;
  }
  /**
   * Use to call arbitrary contracts on the blockchain
   */
  async contract({
    contractAddress,
    method,
  }: ContractCallType) {
    console.log("contractAddress, method", contractAddress, method);
  }
}
