import { defaultModalStyles, modalKeyframeAnimations } from "./styles";
import { ModalStyles, StyleObject } from "../../interfaces/Modal";
export class Modal {
  container = "body";
  styles = defaultModalStyles;
  main: HTMLDivElement;
  overlay: HTMLDivElement;
  body: HTMLDivElement;
  iframe: HTMLIFrameElement;
  style: HTMLStyleElement;

  constructor(container?: string, styles?: Partial<ModalStyles>) {
    if (container) {
      this.container = container;
    }

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

    this.addListeners();
  }

  open(iframeUrl?: string) {
    if (iframeUrl) {
      this.iframe.src = iframeUrl;
      this.body.appendChild(this.iframe);
    }

    this.main.appendChild(this.overlay);
    this.main.appendChild(this.style);
    this.main.appendChild(this.body);

    document.querySelector(this.container)?.appendChild(this.main);
    document.body.style.overflow = "hidden";
  }

  close() {
    this.body.style.animation = "pew-modal-slideOut 0.2s forwards";

    this.body.addEventListener("animationend", () => {
      document.body.style.overflow = "visible";
      this.main.remove();
    });
  }

  addListeners() {
    this.overlay.addEventListener("click", () => {
      this.close();
    });
  }

  mergeStyles(styles: Partial<ModalStyles>) {
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

  assignStyles(el: HTMLElement, styles: StyleObject) {
    Object.keys(styles).forEach((style) => {
      // @ts-ignore
      el.style[style] = styles[style];
    });
  }
}
