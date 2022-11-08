import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { Bytes, Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils";

export class EthersSigner extends Signer {
  constructor() {
    super();
  }

  getAddress(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  signMessage(message: string | Bytes): Promise<string> {
    throw new Error("Method not implemented.");
  }
  signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }
  connect(provider: Provider): Signer {
    throw new Error("Method not implemented.");
  }
}
