import { PAPER_APP_URL_ALT } from "../constants/settings";
import { IframeCommunicator } from "../utils/IframeCommunicator";
import { EthersSigner, SignerProcedureTypes } from "./Signer";

function createEmbeddedWalletLink({ clientId }: { clientId: string }) {
  return new URL(`/embedded-wallet?clientId=${clientId}`, PAPER_APP_URL_ALT);
}

// for now, might add more to this in a bit
type QueryTypes = SignerProcedureTypes;

export class EmbeddedWallet {
  protected EMBEDDED_WALLET_IFRAME = "paper-embedded-wallet-iframe";

  protected clientId: string;
  protected querier: IframeCommunicator<QueryTypes>;

  constructor({ clientId }: { clientId: string }) {
    this.clientId = clientId;
    this.querier = new IframeCommunicator({
      iframeId: this.EMBEDDED_WALLET_IFRAME,
      link: createEmbeddedWalletLink({ clientId }).href,
    });
  }

  async getSigner() {
    const signer = new EthersSigner({ querier: this.querier });
    return signer.init();
  }
}
