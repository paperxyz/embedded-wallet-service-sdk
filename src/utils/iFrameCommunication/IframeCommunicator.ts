import { StyleObject } from "../../interfaces/Modal";
import type { MessageType } from "../../interfaces/utils/IframeCommunicator";
import { getDefaultModalStyles } from "../../lib/Modal/styles";

export type IFrameCommunicatorProps = {
  link: string;
  iframeId: string;
  container?: HTMLElement;
  iframeStyles?: StyleObject;
};

function sleep(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

// Global var to help track iframe state
let isIframeLoaded = new Map<string, boolean>();

export class IframeCommunicator<T extends { [key: string]: any }> {
  private iframe: HTMLIFrameElement;
  private POLLING_INTERVAL_SECONDS = 1.4;
  private POST_LOAD_BUFFER_SECONDS = 1;

  constructor({
    link,
    iframeId,
    container = document.body,
    iframeStyles,
  }: IFrameCommunicatorProps) {
    // Creating the IFrame element for communication
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!iframe || iframe.src != link) {
      if (!iframe) {
        iframe = document.createElement("iframe");
        const mergedIframeStyles = {
          ...getDefaultModalStyles().iframe,
          iframeStyles,
        };
        Object.assign(iframe.style, mergedIframeStyles);
        iframe.setAttribute("id", iframeId);
        container.appendChild(iframe);
      }
      iframe.src = link;
      iframe.onload = IframeCommunicator.onIframeLoadHandler(
        iframe,
        this.POST_LOAD_BUFFER_SECONDS
      );
    }
    this.iframe = iframe;
  }

  static onIframeLoadHandler(
    iframe: HTMLIFrameElement,
    prePostMessageSleepInSeconds: number
  ) {
    return async () => {
      const channel = new MessageChannel();
      const promise = new Promise<boolean>(async (res, rej) => {
        channel.port1.onmessage = (event: MessageEvent<MessageType<void>>) => {
          const { data } = event;
          channel.port1.close();
          if (!data.success) {
            return rej(data.error);
          }
          isIframeLoaded.set(iframe.src, true);
          return res(true);
        };

        // iFrame takes a bit of time after loading to be ready for message receiving
        // This is hacky
        await sleep(prePostMessageSleepInSeconds);
        const INIT_IFRAME_EVENT = "initIframe";
        iframe?.contentWindow?.postMessage(
          // ? We can probably initialise the iframe with a bunch
          // of useful information so that we don't have to pass it
          // through in each of the future call. This would be where we do it.
          { eventType: INIT_IFRAME_EVENT, data: {} },
          "*",
          [channel.port2]
        );

        iframe.style.visibility = "visible";
      });
      await promise;
    };
  }

  async call<ReturnData>(procedureName: keyof T, params: T[keyof T]) {
    const promise = new Promise<ReturnData>(async (res, rej) => {
      while (!isIframeLoaded.get(this.iframe.src)) {
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

  /**
   * This has to be called by any iframe that will be removed from the DOM.
   * Use to make sure that we reset the global loaded state of the particular iframe.src
   */
  destroy() {
    isIframeLoaded.delete(this.iframe.src);
  }
}
