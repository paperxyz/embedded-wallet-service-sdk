import type {
  Chains,
  PaperBaseConstructorType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type {
  CallContractReturnType,
  ContractCallInputType,
} from "../../interfaces/EmbeddedWallets/GaslessTransactionMaker";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type GaslessTransactionQuerierTypes = {
  callContract: {
    contractAddress: string;
    method: {
      stub: string;
      args: Array<unknown>;
    };
    chain: Chains;
  };
};

/**
 * @description GaslessTransactionMaker is used to execute gasless transactions from the embedded wallets
 */
export class GaslessTransactionMaker {
  protected chain: Chains;
  protected clientId: string;
  protected gaslessTransactionQuerier: EmbeddedWalletIframeCommunicator<GaslessTransactionQuerierTypes>;
  constructor({ chain, clientId }: PaperBaseConstructorType) {
    this.chain = chain;
    this.clientId = clientId;
    this.gaslessTransactionQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }
  /**
   * @description
   * Use to call arbitrary contracts on the blockchain
   *
   * @param {string} params.contractAddress The address for which the contract call is directed too.
   * @param {Array} params.methodInterface the function stub on the contract. Often this looks something like `function myFunctionName(address user, uint256 tokenId) external payable`.
   * @param {Array} params.methodArgs The arguments that is to be passed to the contract in order.
   * @throws if there is an error calling the contract for whatever reason.
   * @returns {string} The transaction hash associated with the successful contract call.
   */
  async callContract({
    contractAddress,
    methodArgs,
    methodInterface,
  }: ContractCallInputType): Promise<CallContractReturnType> {
    return await this.gaslessTransactionQuerier.call<CallContractReturnType>(
      "callContract",
      {
        chain: this.chain,
        contractAddress,
        method: {
          args: methodArgs,
          stub: methodInterface,
        },
      }
    );
  }
}
