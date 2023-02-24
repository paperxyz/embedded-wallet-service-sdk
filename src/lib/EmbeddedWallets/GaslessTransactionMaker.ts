import type {
  Chain,
  ClientIdWithQuerierAndChainType,
} from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type {
  CallContractReturnType,
  ContractCallInputType,
} from "../../interfaces/EmbeddedWallets/GaslessTransactionMaker";
import type { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type GaslessTransactionQuerierTypes = {
  callContract: {
    contractAddress: string;
    method: {
      stub: string;
      args: Array<unknown>;
    };
    chain: Chain;
  };
};

/**
 * @description GaslessTransactionMaker is used to execute gasless transactions from the embedded wallets
 */
export class GaslessTransactionMaker {
  protected chain: Chain;
  protected clientId: string;
  protected gaslessTransactionQuerier: EmbeddedWalletIframeCommunicator<GaslessTransactionQuerierTypes>;
  constructor({ chain, clientId, querier }: ClientIdWithQuerierAndChainType) {
    this.chain = chain;
    this.clientId = clientId;
    this.gaslessTransactionQuerier = querier;
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
    return await this.gaslessTransactionQuerier.call<CallContractReturnType>({
      procedureName: "callContract",
      params: {
        chain: this.chain,
        contractAddress,
        method: {
          args: methodArgs,
          stub: methodInterface,
        },
      },
    });
  }
}
