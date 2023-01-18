import { ModalStyles } from "../../interfaces/Modal";

const fullScreen = {
  top: "0px",
  left: "0px",
  right: "0px",
  bottom: "0px",
};

export const getDefaultModalStyles = (): ModalStyles => ({
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
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.25)",
    backgroundColor: window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "#2F2F2F"
      : "white",
    borderRadius: "12px",
    padding: "16px",
    position: "relative",
    maxWidth: "600px",
    width: "100%",
    animation: "pew-modal-slideIn 0.2s forwards",
    height: "375px",
    maxHeight: "80vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "end",
  },
  iframe: {
    height: "100%",
    width: "100%",
    border: "none",
    backgroundColor: "transparent",
    position: "fixed",
    top: "0px",
    right: "0px",
    zIndex: "2147483646",
    display: "none",
  },
});

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
