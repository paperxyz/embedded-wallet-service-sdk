import type { PaperConstructorWithStylesType } from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { Auth } from "./Auth";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";

export class PaperClient {
  protected clientId: string;

  User: EmbeddedWallet;
  Login: Auth;

  constructor({ clientId, chain, styles }: PaperConstructorWithStylesType) {
    this.clientId = clientId;
    this.Login = new Auth({ clientId });
    this.User = new EmbeddedWallet({ clientId, chain, styles });
  }
}
