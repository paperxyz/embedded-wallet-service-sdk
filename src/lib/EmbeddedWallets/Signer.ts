import type {
  Provider,
  TransactionRequest,
} from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import type { Bytes } from "@ethersproject/bytes";
import type { Deferrable } from "@ethersproject/properties";
import { defineReadOnly } from "@ethersproject/properties";
import { ClientIdWithQuerierType } from "../../interfaces/EmbeddedWallets/EmbeddedWallets";
import type {
  GetAddressReturnType,
  SignMessageReturnType,
  SignTransactionReturnType,
} from "../../interfaces/EmbeddedWallets/Signer";
import { EmbeddedWalletIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

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
  protected querier: EmbeddedWalletIframeCommunicator<SignerProcedureTypes>;
  protected clientId: string;

  constructor({
    provider,
    clientId,
    querier,
  }: ClientIdWithQuerierType & {
    provider: Provider;
  }) {
    super();
    this.clientId = clientId;
    this.querier = querier;
    defineReadOnly(this, "provider", provider);
  }

  override async getAddress(): Promise<string> {
    const { address } = await this.querier.call<GetAddressReturnType>({
      procedureName: "getAddress",
      params: undefined,
    });
    return address;
  }

  private async preSign() {
    const chainId = (await this.provider?.getNetwork())?.chainId;
    if (!chainId) {
      throw new Error("Unable to fetch signer chain ID");
    }
    return { chainId };
  }

  override async signMessage(message: string | Bytes): Promise<string> {
    const { chainId } = await this.preSign();
    const { signedMessage } = await this.querier.call<SignMessageReturnType>({
      procedureName: "signMessage",
      params: {
        message,
        chainId,
      },
    });
    return signedMessage;
  }

  override async signTransaction(
    transaction: TransactionRequest
  ): Promise<string> {
    const { chainId } = await this.preSign();
    const { signedTransaction } =
      await this.querier.call<SignTransactionReturnType>({
        procedureName: "signTransaction",
        params: {
          transaction,
          chainId,
        },
      });
    return signedTransaction;
  }

  override connect(provider: Provider): EthersSigner {
    return new EthersSigner({
      clientId: this.clientId,
      provider,
      querier: this.querier,
    });
  }
}
