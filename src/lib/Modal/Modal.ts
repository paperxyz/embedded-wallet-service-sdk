import {
  ModalInterface,
  ModalStyles,
  StyleObject,
} from "../../interfaces/Modal";
import { EmbeddedWalletUiIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletUiIframeCommunicator";
import { IframeCommunicator } from "../../utils/iFrameCommunication/IframeCommunicator";
import { defaultModalStyles, modalKeyframeAnimations } from "./styles";
export class Modal {
  protected container: HTMLElement;
  protected styles = defaultModalStyles;
  protected main: HTMLDivElement;
  protected overlay: HTMLDivElement;
  protected iframe: HTMLIFrameElement;

  protected style: HTMLStyleElement;
  body: HTMLDivElement;
  protected iframeCommunicator: IframeCommunicator<{}> | undefined;

  constructor(container?: HTMLElement, styles?: Partial<ModalStyles>) {
    this.container = container || document.body;

    if (styles) {
      this.mergeStyles(styles);
    }

    this.main = document.createElement("div");
    this.overlay = document.createElement("div");
    this.body = document.createElement("div");
    this.iframe = document.createElement("iframe");

    this.style = document.createElement("style");
    this.style.innerHTML = modalKeyframeAnimations;

    this.assignStyles(this.main, this.styles.main);
    this.assignStyles(this.overlay, this.styles.overlay);
    this.assignStyles(this.body, this.styles.body);
    this.assignStyles(this.iframe, this.styles.iframe);
  }

  open({
    iframeUrl,
    communicator,
  }: { iframeUrl?: string; communicator?: IframeCommunicator<{}> } = {}) {
    if (iframeUrl) {
      this.iframe.src = iframeUrl;
      this.body.appendChild(this.iframe);
    }
    this.iframeCommunicator = communicator;

    this.addAccessibility();
    this.addListeners();

    this.main.appendChild(this.overlay);
    this.main.appendChild(this.style);
    this.main.appendChild(this.body);

    this.container.appendChild(this.main);
    document.body.style.overflow = "hidden";
  }

  close() {
    if (this.iframeCommunicator) {
      this.iframeCommunicator.destroy();
    }

    this.body.style.animation = "pew-modal-slideOut 0.2s forwards";

    this.body.addEventListener("animationend", () => {
      document.body.style.overflow = "visible";
      this.main.remove();
    });

    window.removeEventListener("keydown", this.onKeyDown);
  }

  protected addListeners() {
    this.overlay.addEventListener("click", () => {
      this.close();
    });

    window.addEventListener("keydown", this.onKeyDown);
  }

  protected onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };

  protected mergeStyles(styles: Partial<ModalStyles>) {
    this.styles.body = {
      ...this.styles.body,
      ...(styles.body || {}),
    };

    this.styles.overlay = {
      ...this.styles.overlay,
      ...(styles.overlay || {}),
    };

    this.styles.main = {
      ...this.styles.main,
      ...(styles.main || {}),
    };

    this.styles.iframe = {
      ...this.styles.iframe,
      ...(styles.iframe || {}),
    };
  }

  protected addAccessibility() {
    this.main.setAttribute("aria-hidden", "true");
    this.overlay.setAttribute("aria-hidden", "true");
    this.body.setAttribute("aria-modal", "true");
    this.body.setAttribute("role", "dialog");
  }

  protected assignStyles(el: HTMLElement, styles: StyleObject) {
    Object.assign(el.style, styles);
  }
}

export async function openModalForFunction<
  ProcedureTypes extends { [key: string]: any },
  IframeReturnType,
  ReturnType = IframeReturnType
>(
  props: ModalInterface & {
    clientId: string;
    path: string;
    procedure: keyof ProcedureTypes;
    params: ProcedureTypes[keyof ProcedureTypes];
    processResult?: (props: IframeReturnType) => ReturnType;
  }
): Promise<ReturnType | IframeReturnType> {
  const modal = new Modal(props.modalContainer, props.modalStyles);
  const uiIframeManager =
    new EmbeddedWalletUiIframeCommunicator<ProcedureTypes>({
      clientId: props.clientId,
      container: modal.body,
      path: props.path,
    });
  modal.open({ communicator: uiIframeManager });
  try {
    const result = await uiIframeManager.call<IframeReturnType>(
      props.procedure,
      props.params
    );
    modal.close();
    if (props.processResult) {
      const toReturn = props.processResult(result);
      return toReturn;
    }
    return result;
  } catch (e) {
    console.error(
      "Error while running iframe in modal ui. This should not be happening. Reach to us and let us know how you got here."
    );
    modal.close();
    throw e;
  }
}