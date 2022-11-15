// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

export type WalletDetailsType = {
  chain: Chains;
  limit: number;
  offset: number;
};

// Class constructor types
export type PaperConstructorType = { clientId: string; chain: Chains };
