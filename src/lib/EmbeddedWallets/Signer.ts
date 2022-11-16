import type {
  Provider,
  TransactionRequest,
} from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import type { Bytes } from "@ethersproject/bytes";
import type { Deferrable } from "@ethersproject/properties";
import { defineReadOnly } from "@ethersproject/properties";
import type {
  GetAddressReturnType,
  SignMessageReturnType,
  SignTransactionReturnType,
} from "../../interfaces/Signer";
import {
  createEmbeddedWalletIframeLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../../utils/IframeCommunicator";

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
  private DEFAULT_ETHEREUM_CHAIN_ID = 1;
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
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });
    defineReadOnly(this, "provider", provider);
  }

  override async getAddress(): Promise<string> {
    const { address } = await this.querier.call<GetAddressReturnType>(
      "getAddress"
    );
    return address;
  }

  override async signMessage(message: string | Bytes): Promise<string> {
    const { signedMessage } = await this.querier.call<SignMessageReturnType>(
      "signMessage",
      {
        message,
        chainId:
          (await this.provider?.getNetwork())?.chainId ??
          this.DEFAULT_ETHEREUM_CHAIN_ID,
      }
    );
    return signedMessage;
  }

  override async signTransaction(
    transaction: TransactionRequest
  ): Promise<string> {
    const { signedTransaction } =
      await this.querier.call<SignTransactionReturnType>("signTransaction", {
        transaction,
        chainId:
          (await this.provider?.getNetwork())?.chainId ??
          this.DEFAULT_ETHEREUM_CHAIN_ID,
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
