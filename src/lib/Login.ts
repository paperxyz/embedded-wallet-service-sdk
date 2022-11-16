import { AuthProvider } from "../constants/settings";
import {
  createEmbeddedWalletLink,
  EMBEDDED_WALLET_IFRAME_ID,
  IframeCommunicator,
} from "../utils/IframeCommunicator";

export type LoginTypes = {
  jwtAuth: {
    token: string;
    provider: AuthProvider;
  };
  emailAuth: {};
};

export class Login {
  protected clientId: string;
  protected walletManagerQuerier: IframeCommunicator<LoginTypes>;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;

    this.walletManagerQuerier = new IframeCommunicator({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletLink({ clientId }).href,
    });
  }

  async jwtAuth({
    token,
    provider,
  }: {
    token: string;
    provider: AuthProvider;
  }): Promise<{ success: boolean }> {
    await this.walletManagerQuerier.init();
    return this.walletManagerQuerier.call<{ success: boolean }>("jwtAuth", {
      token,
      provider,
    });
  }
}
