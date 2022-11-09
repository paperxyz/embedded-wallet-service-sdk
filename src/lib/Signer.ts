import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { Signer } from "ethers";
import { Bytes, Deferrable } from "ethers/lib/utils";
import { IframeCommunicator } from "../utils/IframeCommunicator";

export type SignerProcedureTypes = {
  getAddress: void;
  signMessage: { message: string | Bytes };
  signTransaction: { transaction: Deferrable<TransactionRequest> };
  connect: { provider: Provider };
};

export class EthersSigner extends Signer {
  protected querier: IframeCommunicator<SignerProcedureTypes>;
  constructor({
    querier,
  }: {
    querier: IframeCommunicator<SignerProcedureTypes>;
  }) {
    super();
    this.querier = querier;
  }

  async init() {
    await this.querier.init();
    return this;
  }

  getAddress(): Promise<string> {
    return this.querier.call<string>("getAddress");
  }

  signMessage(message: string | Bytes): Promise<string> {
    return this.querier.call("signMessage", {
      message,
    });
  }
  signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    return this.querier.call<string>("signTransaction", {
      transaction,
    });
  }
  connect(provider: Provider): EthersSigner {
    this.querier.call<EthersSigner>("connect", {
      provider,
    });

    return this;
  }
}
