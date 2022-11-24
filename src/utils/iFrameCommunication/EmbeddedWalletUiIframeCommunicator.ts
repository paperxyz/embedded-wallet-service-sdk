import { StyleObject } from "../../interfaces/Modal";
import { CustomizationOptionsType } from "../../interfaces/utils/IframeCommunicator";
import { defaultModalStyles } from "../../lib/Modal/styles";
import { createEmbeddedWalletIframeLink } from "./EmbeddedWalletIframeCommunicator";
import { IframeCommunicator } from "./IframeCommunicator";

export class EmbeddedWalletUiIframeCommunicator<
  T extends { [key: string]: any }
> extends IframeCommunicator<T> {
  constructor({
    clientId,
    path,
    container,
    customizationOptions,
    iframeStyles = defaultModalStyles.iframe,
  }: {
    clientId: string;
    path: string;
    container: HTMLElement;
    iframeStyles?: StyleObject;
    customizationOptions?: CustomizationOptionsType;
  }) {
    const queryParams = customizationOptions;
    super({
      iframeId: EMBEDDED_WALLET_MODAL_UI_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({
        clientId,
        path,
        queryParams,
      }).href,
      container,
      iframeStyles,
    });
  }
}

export const EMBEDDED_WALLET_MODAL_UI_IFRAME_ID =
  "paper-embedded-wallet-modal-iframe";
