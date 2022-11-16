import { Chains } from "./EmbeddedWallets";

export type WalletHoldingInputType = {
  chain: Chains;
  limit: number;
  offset: number;
};
