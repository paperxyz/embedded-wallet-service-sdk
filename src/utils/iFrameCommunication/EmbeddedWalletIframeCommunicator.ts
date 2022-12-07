import {
  EMBEDDED_WALLET_PATH,
  PAPER_APP_URL
} from "../../constants/settings";
import { IframeCommunicator } from "./IframeCommunicator";

export class EmbeddedWalletIframeCommunicator<
  T extends { [key: string]: any }
> extends IframeCommunicator<T> {
  constructor({ clientId }: { clientId: string }) {
    super({
      iframeId: EMBEDDED_WALLET_IFRAME_ID,
      link: createEmbeddedWalletIframeLink({
        clientId,
        path: EMBEDDED_WALLET_PATH,
      }).href,
      container: document.body,
      iframeStyles: {
        width: "0px",
        height: "0px",
        visibility: "hidden",
      },
    });
  }
}

// This is the URL and ID tag of the iFrame that we communicate with
export function createEmbeddedWalletIframeLink({
  clientId,
  path,
  queryParams,
}: {
  clientId: string;
  path: string;
  queryParams?: { [key: string]: string | number };
}) {
  const embeddedWalletUrl = new URL(path, PAPER_APP_URL);
  embeddedWalletUrl.searchParams.set("clientId", clientId);
  if (queryParams) {
    for (const queryKey of Object.keys(queryParams)) {
      embeddedWalletUrl.searchParams.set(
        queryKey,
        queryParams[queryKey].toString()
      );
    }
  }
  return embeddedWalletUrl;
}
export const EMBEDDED_WALLET_IFRAME_ID = "paper-embedded-wallet-iframe";
