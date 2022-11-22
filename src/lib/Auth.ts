import { AuthProvider, JwtAuthReturnType } from "../interfaces/Auth";
import { ModalStyles } from "../interfaces/Modal";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { Modal } from "./Modal/Modal";

export type AuthTypes = {
  jwtAuth: {
    token: string;
    provider: AuthProvider;
  };
  emailAuth: {};
};

export class Auth {
  protected clientId: string;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;
  }

  async jwtAuth({
    token,
    provider,
  }: {
    token: string;
    provider: AuthProvider;
  }): Promise<JwtAuthReturnType> {
    const querier = new EmbeddedWalletIframeCommunicator({
      clientId: this.clientId,
    });

    return querier.call<JwtAuthReturnType>("jwtAuth", {
      token,
      provider,
    });
  }

  async otpAuth({
    email,
    modalContainer,
    modalStyles,
  }: {
    email: string;
    modalContainer?: HTMLElement;
    modalStyles?: Partial<ModalStyles>;
  }): Promise<any> {
    const modal = new Modal(modalContainer, modalStyles);

    const querier = new EmbeddedWalletIframeCommunicator({
      clientId: this.clientId,
      container: modal.body,
    });

    console.log(querier, email);

    modal.open();
  }
}
