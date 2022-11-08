import { PAPER_APP_URL_ALT } from "../constants/settings";
import { postMessageToIframe } from "../utils/postMessageToIframe";
import { EthersSigner } from "./Signer";

function createEmbeddedWalletLink({ clientId }: { clientId: string }) {
  return new URL(`/wallet?clientId=${clientId}`, PAPER_APP_URL_ALT);
}

export enum EmbeddedWalletEvents {
  GET_SIGNER = "GET_SIGNER",
}

export class EmbeddedWallet {
  protected EMBEDDED_WALLET_IFRAME = "paper-embedded-wallet-iframe";

  protected clientId: string;
  protected iframe: HTMLIFrameElement;
  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;

    // Creating the IFrame element for communication
    let iframe = document.getElementById(
      this.EMBEDDED_WALLET_IFRAME
    ) as HTMLIFrameElement | null;

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = createEmbeddedWalletLink({ clientId }).href;
      iframe.setAttribute(
        "style",
        "width: 0px; height: 0px; visibility: hidden;"
      );
      iframe.setAttribute("id", this.EMBEDDED_WALLET_IFRAME);
      document.body.appendChild(iframe);
    }
    this.iframe = iframe;
  }

  async getSigner() {
    postMessageToIframe(this.iframe, EmbeddedWalletEvents.GET_SIGNER, {});
    const promise = new Promise((res, rej) => {
      window.addEventListener("message", (e: MessageEvent) => {
        console.log("e.data", e.data);
        switch (e.data.eventType) {
          case "UserAddress": {
            res("dones");
          }
        }
      });
    });
    const ethersSigner = new EthersSigner();
    return promise;
  }
}
