import { EMBEDDED_WALLET_OTP_PATH } from "../constants/settings";
import { AuthProvider, JwtAuthReturnType } from "../interfaces/Auth";
import { ModalInterface } from "../interfaces/Modal";
import { EmbeddedWalletIframeCommunicator } from "../utils/iFrameCommunication/EmbeddedWalletIframeCommunicator";
import { openModalForFunction } from "./Modal/Modal";

export type AuthTypes = {
  jwtAuth: {
    token: string;
    provider: AuthProvider;
  };
};
type AuthUiType = {
  emailOTP: { email: string };
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
  } & ModalInterface): Promise<JwtAuthReturnType> {
    return openModalForFunction<AuthUiType, JwtAuthReturnType>({
      clientId: this.clientId,
      path: EMBEDDED_WALLET_OTP_PATH,
      procedure: "emailOTP",
      params: { email },
      modalContainer,
      modalStyles: {
        iframe: {
          height: "175px",
          ...modalStyles?.iframe,
        },
        ...modalStyles,
      },
    });
  }
}
