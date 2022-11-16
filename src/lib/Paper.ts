import { EmbeddedWallet } from "./EmbeddedWallet";
import { Login } from "./Login";

export class PaperClient {
  protected clientId: string;

  User: EmbeddedWallet;
  Login: Login;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;
    this.Login = new Login({ clientId });
    this.User = new EmbeddedWallet({ clientId });
  }
}
