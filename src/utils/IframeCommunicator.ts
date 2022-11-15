import { PAPER_APP_URL_ALT } from "../constants/settings";
import type { MessageType } from "../interfaces/utils/IframeCommunicator";

export type IFrameCommunicatorProps = { link: string; iframeId: string };

function sleep(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

// Global var to help track iframe state
let isIframeLoaded = false;

export class IframeCommunicator<T extends { [key: string]: any }> {
  private iframe: HTMLIFrameElement;
  private POLLING_INTERVAL_SECONDS = 1.4;
  private POST_LOAD_BUFFER_SECONDS = 1;
  constructor({ link, iframeId }: IFrameCommunicatorProps) {
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
      const channel = new MessageChannel();
      iframe.onload = async () => {
        const promise = new Promise<boolean>(async (res, rej) => {
          channel.port1.onmessage = (
            event: MessageEvent<MessageType<void>>
          ) => {
            const { data } = event;
            channel.port1.close();
            if (!data.success) {
              return rej(data.error);
            }
            isIframeLoaded = true;
            return res(true);
          };

          // iFrame takes a bit of time after loading to be ready for message receiving
          // This is hacky
          await sleep(this.POST_LOAD_BUFFER_SECONDS);
          const INIT_IFRAME_EVENT = "initIframe";
          iframe?.contentWindow?.postMessage(
            // ? We can probably initialise the iframe with a bunch
            // of useful information so that we don't have to pass it
            // through in each of the future call. This would be where we do it.
            { eventType: INIT_IFRAME_EVENT, data: {} },
            "*",
            [channel.port2]
          );
        });
        await promise;
      };
    }
    this.iframe = iframe;
  }

  async call<ReturnData>(procedureName: keyof T, params: T[keyof T]) {
    const promise = new Promise<ReturnData>(async (res, rej) => {
      while (!isIframeLoaded) {
        await sleep(this.POLLING_INTERVAL_SECONDS);
      }
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
export function createEmbeddedWalletIframeLink({
  clientId,
}: {
  clientId: string;
}) {
  return new URL(`/embedded-wallet?clientId=${clientId}`, PAPER_APP_URL_ALT);
}
export const EMBEDDED_WALLET_IFRAME_ID = "paper-embedded-wallet-iframe";
