import { Provider, TransactionRequest } from "@ethersproject/abstract-provider";
import { Signer } from "ethers";
import { Bytes, Deferrable, defineReadOnly } from "ethers/lib/utils";
import {
  createEmbeddedWalletLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../utils/IframeCommunicator";

export type SignerProcedureTypes = {
  getAddress: void;
  signMessage: { message: string | Bytes; chainId: number | undefined };
  signTransaction: {
    transaction: Deferrable<TransactionRequest>;
    chainId: number | undefined;
  };
  connect: { provider: Provider };
};

export class EthersSigner extends Signer {
  protected querier: IframeCommunicator<SignerProcedureTypes>;
  protected clientId: string;
  constructor({
    provider,
    clientId,
  }: {
    provider: Provider;
    clientId: string;
  }) {
    super();
    this.clientId = clientId;
    this.querier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletLink({ clientId }).href,
    });
    defineReadOnly(this, "provider", provider || null);
  }

  async init() {
    await this.querier.init();
    return this;
  }

  override async getAddress(): Promise<string> {
    const { address } = await this.querier.call<{ address: string }>(
      "getAddress"
    );
    return address;
  }

  override async signMessage(message: string | Bytes): Promise<string> {
    const { signedMessage } = await this.querier.call<{
      signedMessage: string;
    }>("signMessage", {
      message,
      chainId: (await this.provider?.getNetwork())?.chainId,
    });
    return signedMessage;
  }

  override async signTransaction(
    transaction: TransactionRequest
  ): Promise<string> {
    const { signedTransaction } = await this.querier.call<{
      signedTransaction: string;
    }>("signTransaction", {
      transaction,
      chainId: (await this.provider?.getNetwork())?.chainId,
    });
    return signedTransaction;
  }

  override connect(provider: Provider): EthersSigner {
    return new EthersSigner({
      clientId: this.clientId,
      provider,
    });
  }
}
