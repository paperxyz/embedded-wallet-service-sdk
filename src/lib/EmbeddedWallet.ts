import { ethers } from "ethers";
import {
  createEmbeddedWalletLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../utils/IframeCommunicator";
import { EthersSigner } from "./Signer";

export type WalletManagementTypes = {
  createWallet: { recoveryPassword: string };
};

export class EmbeddedWallet {
  protected clientId: string;
  protected walletManagerQuerier: IframeCommunicator<WalletManagementTypes>;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;

    this.walletManagerQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletLink({ clientId }).href,
    });
  }

  async createWallet({
    recoveryPassword,
  }: {
    recoveryPassword: string;
  }): Promise<{ walletAddress: string }> {
    await this.walletManagerQuerier.init();
    return this.walletManagerQuerier.call<{ walletAddress: string }>(
      "createWallet",
      {
        recoveryPassword,
      }
    );
  }

  async getSigner({
    rpcEndpoint,
  }: {
    rpcEndpoint?: ethers.providers.Networkish;
  }) {
    const signer = new EthersSigner({
      clientId: this.clientId,
      provider: ethers.getDefaultProvider(rpcEndpoint),
    });
    return signer.init();
  }
}
