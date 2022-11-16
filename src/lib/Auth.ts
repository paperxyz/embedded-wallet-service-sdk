import { AuthProvider, JwtAuthReturnType } from "../interfaces/Auth";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";

export type AuthTypes = {
  jwtAuth: {
    token: string;
    provider: AuthProvider;
  };
  emailAuth: {};
};

export class Auth {
  protected clientId: string;
  protected AuthQuerier: EmbeddedWalletIframeCommunicator<AuthTypes>;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;

    this.AuthQuerier = new EmbeddedWalletIframeCommunicator({
      clientId,
    });
  }

  async jwtAuth({
    token,
    provider,
  }: {
    token: string;
    provider: AuthProvider;
  }): Promise<JwtAuthReturnType> {
    return this.AuthQuerier.call<JwtAuthReturnType>("jwtAuth", {
      token,
      provider,
    });
  }
}
