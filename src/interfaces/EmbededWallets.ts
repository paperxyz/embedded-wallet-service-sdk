// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

export type WalletDetailsType = {
  chain: Chains;
  limit: number;
  offset: number;
};

export type ContractCallType = {
  contractAddress: string;
  method: {
    stub: `function ${string}(${string})`;
    args: Array<unknown>;
    // Future versions will allow additional value.
    // The user will be prompted to pay with a fiat checkout flow
    // for NFTs similar to Paper's current experience.
    // "payment": {
    //   "value": "0.1",
    //   "currency": "ETH"
    // }
  };
};

// Class constructor types
export type EmbeddedWalletConstructorType = { clientId: string; chain: Chains };
