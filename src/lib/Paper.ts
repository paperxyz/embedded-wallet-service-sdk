import { EmbeddedWalletConstructorType } from "../interfaces/EmbededWallets";
import { EmbeddedWallet } from "./EmbeddedWallets/EmbeddedWallet";
import { Login } from "./Login";

export class PaperClient {
  protected clientId: string;

  User: EmbeddedWallet;
  Login: Login;

  constructor({ clientId, chain }: EmbeddedWalletConstructorType) {
    this.clientId = clientId;
    this.Login = new Login();
    this.User = new EmbeddedWallet({ clientId, chain });
  }
}
