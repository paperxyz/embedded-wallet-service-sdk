import { EMBEDDED_WALLET_EMAIL_OTP_PATH } from "../constants/settings";
import { AuthProvider, JwtAuthReturnType } from "../interfaces/Auth";
import { ModalInterface } from "../interfaces/Modal";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { EmbeddedWalletUiIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletUiIframeCommunicator";
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
  } & ModalInterface): Promise<any> {
    const modal = new Modal(modalContainer, modalStyles);

    const querier = new EmbeddedWalletUiIframeCommunicator({
      clientId: this.clientId,
      container: modal.body,
      path: EMBEDDED_WALLET_EMAIL_OTP_PATH,
      
    });

    console.log(querier, email);

    modal.open();
  }
}
