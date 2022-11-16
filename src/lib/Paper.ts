import type { PaperConstructorType } from "../interfaces/EmbeddedWallets/EmbeddedWallets";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";
import { Login } from "./Login";

export class PaperClient {
  protected clientId: string;

  User: EmbeddedWallet;
  Login: Login;

  constructor({ clientId, chain }: PaperConstructorType) {
    this.clientId = clientId;
    this.Login = new Login({ clientId });
    this.User = new EmbeddedWallet({ clientId, chain });
  }
}
