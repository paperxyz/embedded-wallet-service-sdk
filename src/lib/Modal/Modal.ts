import { defaultModalStyles, modalKeyframeAnimations } from "./styles";
import { ModalStyles, StyleObject } from "../../interfaces/Modal";
export class Modal {
  container: HTMLElement;
  styles = defaultModalStyles;
  main: HTMLDivElement;
  overlay: HTMLDivElement;
  body: HTMLDivElement;
  iframe: HTMLIFrameElement;
  style: HTMLStyleElement;

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

  open(iframeUrl?: string) {
    if (iframeUrl) {
      this.iframe.src = iframeUrl;
      this.body.appendChild(this.iframe);
    }

    this.addAccessibility();
    this.addListeners();

    this.main.appendChild(this.overlay);
    this.main.appendChild(this.style);
    this.main.appendChild(this.body);

    this.container.appendChild(this.main);
    document.body.style.overflow = "hidden";
  }

  close() {
    this.body.style.animation = "pew-modal-slideOut 0.2s forwards";

    this.body.addEventListener("animationend", () => {
      document.body.style.overflow = "visible";
      this.main.remove();
    });

    window.removeEventListener("keydown", this.onKeyDown);
  }

  addListeners() {
    this.overlay.addEventListener("click", () => {
      this.close();
    });

    window.addEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.close();
    }
  };

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

  addAccessibility() {
    this.main.setAttribute("aria-hidden", "true");
    this.overlay.setAttribute("aria-hidden", "true");
    this.body.setAttribute("aria-modal", "true");
    this.body.setAttribute("role", "dialog");
  }

  assignStyles(el: HTMLElement, styles: StyleObject) {
    Object.keys(styles).forEach((style) => {
      // @ts-ignore
      el.style[style] = styles[style];
    });
  }
}
