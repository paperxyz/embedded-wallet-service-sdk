import type { MessageType } from "../../interfaces/utils/IframeCommunicator";

export type IFrameCommunicatorProps = {
  link: string;
  iframeId: string;
  container?: HTMLElement;
};

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
  constructor({ link, iframeId, container }: IFrameCommunicatorProps) {
    // Creating the IFrame element for communication
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!iframe || iframe.src != link) {
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.setAttribute(
          "style",
          "width: 0px; height: 0px; visibility: hidden;"
        );
        iframe.setAttribute("id", iframeId);
        (container || document.body).appendChild(iframe);
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
          isIframeLoaded = true;
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
      });
      await promise;
    };
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
