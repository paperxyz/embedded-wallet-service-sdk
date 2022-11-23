export type StyleObject = Partial<CSSStyleDeclaration>;

export interface ModalStyles {
  main: StyleObject;
  overlay: StyleObject;
  body: StyleObject;
  iframe: StyleObject;
}

export interface ModalInterface {
  modalContainer?: HTMLElement;
  modalStyles?: Partial<ModalStyles>;
}
