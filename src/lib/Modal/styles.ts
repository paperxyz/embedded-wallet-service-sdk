import { ModalStyles } from "../../interfaces/Modal";

const fullScreen = {
  top: "0px",
  left: "0px",
  right: "0px",
  bottom: "0px",
};

export const defaultModalStyles: ModalStyles = {
  main: {
    ...fullScreen,
    position: "fixed",
    zIndex: "1000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...fullScreen,
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  body: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "16px",
    position: "relative",
    maxWidth: "600px",
    width: "100%",
    animation: "pew-modal-slideIn 0.2s forwards",
  },
  iframe: {
    height: "100%",
    width: "100%",
    border: "none",
  },
};

export const modalKeyframeAnimations = `
  @keyframes pew-modal-slideIn {
    from {opacity: 0; transform: translate3d(0, -20px, 0);}
    to {opacity: 1; transform: translate3d(0, 0, 0);}
  }

  @keyframes pew-modal-slideOut {
    from {opacity: 1; transform: translate3d(0, 0, 0);}
    to {opacity: 0; transform: translate3d(0, -20px, 0);}
  }
`;
