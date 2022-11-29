import type { PaperConstructorWithStylesType } from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { Auth } from "./Auth";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";

export class PaperClient {
  protected clientId: string;

  private User: EmbeddedWallet;
  Login: Auth;

  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.Login = new Auth({ clientId });
    this.User = new EmbeddedWallet({ clientId, chain, styles });
  }

  async getUser(): Promise<EmbeddedWallet | undefined> {
    if (await this.Login.isLoggedIn()) {
      await this.User.initWallet();
      return this.User;
    }
    return;
  }
}
