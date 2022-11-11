import { PAPER_APP_URL_ALT } from "../constants/settings";

type MessageType<T> =
  | {
      eventType: string;
      success: true;
      data: T;
    }
  | {
      eventType: string;
      success: false;
      error: Error;
    };

export type IFrameCommunicatorProps = { link: string; iframeId: string };

export class IframeCommunicator<T extends { [key: string]: any }> {
  private iframe: HTMLIFrameElement;
  private isLoaded: boolean;
  constructor({ link, iframeId }: IFrameCommunicatorProps) {
    this.isLoaded = false;

    // Creating the IFrame element for communication
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.src = link;
      iframe.setAttribute(
        "style",
        "width: 0px; height: 0px; visibility: hidden;"
      );
      iframe.setAttribute("id", iframeId);
      document.body.appendChild(iframe);
      this.iframe = iframe;
    } else {
      this.iframe = iframe;
      this.isLoaded = true;
    }
  }

  // TODO: Make sure that we load iFrame before making any post calls.
  // This currently doesn't work well with React's strict mode
  async init() {
    const INIT_IFRAME_EVENT = "initIframe";
    if (!this.isLoaded) {
      const promise = new Promise<boolean>((res, rej) => {
        const channel = new MessageChannel();
        this.iframe.addEventListener(
          "load",
          () => {
            channel.port1.onmessage = (
              event: MessageEvent<MessageType<void>>
            ) => {
              const { data } = event;
              channel.port1.close();
              if (!data.success) {
                return rej(data.error);
              }
              return res(true);
            };

            if (this.iframe.contentWindow) {
              this.iframe.contentWindow.postMessage(
                { eventType: INIT_IFRAME_EVENT },
                "*",
                [channel.port2]
              );
            }
          },
          {
            once: true,
          }
        );
      });

      const result = await promise;
      if (result) {
        this.isLoaded = true;
      }
    }
  }

  async call<ReturnData>(procedureName: keyof T, params: T[keyof T]) {
    const promise = new Promise<ReturnData>((res, rej) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (
        event: MessageEvent<MessageType<ReturnData>>
      ) => {
        const { data } = event;
        channel.port1.close();
        if (!data.success) {
          return rej(data.error);
        }
        return res(data.data);
      };
      this.iframe.contentWindow?.postMessage(
        { eventType: procedureName, data: params },
        "*",
        [channel.port2]
      );
    });
    return promise;
  }
}

// This is the URL and ID tag of the iFrame that we communicate with
export function createEmbeddedWalletLink({ clientId }: { clientId: string }) {
  return new URL(`/embedded-wallet?clientId=${clientId}`, PAPER_APP_URL_ALT);
}
export const EMBEDDED_WALLET_IFRAME_ID = "paper-embedded-wallet-iframe";
