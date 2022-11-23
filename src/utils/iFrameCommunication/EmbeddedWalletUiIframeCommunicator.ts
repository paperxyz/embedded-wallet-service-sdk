import { StyleObject } from "../../interfaces/Modal";
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
    styles = defaultModalStyles.iframe,
  }: {
    clientId: string;
    path: string;
    container: HTMLElement;
    styles?: StyleObject;
  }) {
    super({
      iframeId: EMBEDDED_WALLET_MODAL_UI_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId, path }).href,
      container,
      iframeStyles: styles,
    });
  }
}

export const EMBEDDED_WALLET_MODAL_UI_IFRAME_ID =
  "paper-embedded-wallet-modal-iframe";
