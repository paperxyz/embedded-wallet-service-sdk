import { PAPER_APP_URL_ALT } from "../../constants/settings";
import { IframeCommunicator } from "./IframeCommunicator";

export class EmbeddedWalletIframeCommunicator<
  T extends { [key: string]: any }
> extends IframeCommunicator<T> {
  constructor({ clientId }: { clientId: string }) {
    super({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({ clientId }).href,
    });
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