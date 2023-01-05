import { ModalStyles, StyleObject } from "../../interfaces/Modal";
import { CustomizationOptionsType } from "../../interfaces/utils/IframeCommunicator";
import { EmbeddedWalletUiIframeCommunicator } from "../../utils/iFrameCommunication/EmbeddedWalletUiIframeCommunicator";
import { IframeCommunicator } from "../../utils/iFrameCommunication/IframeCommunicator";
import { getDefaultModalStyles, modalKeyframeAnimations } from "./styles";

export const MODAL_ID = "pew-modal";
export class Modal {
  protected container: HTMLElement;
  protected main: HTMLDivElement;
  protected overlay: HTMLDivElement;
  protected iframe: HTMLIFrameElement;
  protected closeButton: HTMLButtonElement | undefined;

  protected style: HTMLStyleElement;
  protected iframeCommunicator: IframeCommunicator<{}> | undefined;
  styles = getDefaultModalStyles();
  body: HTMLDivElement;

  constructor(container?: HTMLElement, styles?: Partial<ModalStyles>) {
    this.container = container || document.body;

    if (styles) {
      this.mergeStyles(styles);
    }

    this.main = document.createElement("div");
    this.main.id = MODAL_ID;

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

  addCloseModalToggle(onCloseModal: () => void) {
    this.closeButton = document.createElement("button");
    this.closeButton.innerHTML = "X";
    this.closeButton.onclick = onCloseModal;
    this.closeButton.setAttribute(
      "style",
      "border:none;background:transparent;cursor:pointer;"
    );
    this.body.prepend(this.closeButton);
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

    // window.removeEventListener("keydown", this.onKeyDown);
  }

  protected addListeners() {
    /**
     * TODO : Figure out a way to add handlers while not affecting code flow
     * example: Dev call otpLogin which opens anm iframe asking for code.
     * User clicks esc.
     * What happens to the dev flow now? Do we provide a callback + options to not allow clicking out?
     * If so, how should we pass around the callback? Seems excessive for not a lot of impact.
     */
    // this.overlay.addEventListener("click", () => {
    //   this.close();
    // });
    // window.addEventListener("keydown", this.onKeyDown);
  }

  // protected onKeyDown = (e: KeyboardEvent) => {
  //   if (e.key === "Escape") {
  //     this.close();
  //   }
  // };

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

/**
 * @see {@link EmbeddedWallet.setUpNewDevice} for an example of how this function is used
 */
export async function openModalForFunction<
  // This is the mapping of procedure name to type that we can call
  ProcedureTypes extends { [key: string]: any },
  // This is the return type of the procedure call from the iframe
  IframeReturnType,
  // this is the actual return type of this function [openModalForFunction]
  ReturnType = IframeReturnType
>(props: {
  clientId: string;
  path: string;
  procedure: keyof ProcedureTypes;
  params: ProcedureTypes[keyof ProcedureTypes];
  processResult?: (props: IframeReturnType) => ReturnType | Promise<ReturnType>;
  customizationOptions?: CustomizationOptionsType;
}): Promise<ReturnType | IframeReturnType> {
  if (!canOpenModal()) {
    throw new Error("A modal is already opened");
  }

  const modal = new Modal(undefined, {
    body: {
      backgroundColor: props.customizationOptions?.colorBackground,
    },
  });
  const uiIframeManager =
    new EmbeddedWalletUiIframeCommunicator<ProcedureTypes>({
      clientId: props.clientId,
      container: modal.body,
      path: props.path,
      customizationOptions: props.customizationOptions,
      onIframeInitialize: () => {
        modal.addCloseModalToggle(async () => {
          // TODO: remove type-hack
          await uiIframeManager.call("closeModal", undefined as any);
        });
      },
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
    modal.close();
    throw e;
  }
}

export const canOpenModal = () => {
  return !document.getElementById(MODAL_ID);
};
