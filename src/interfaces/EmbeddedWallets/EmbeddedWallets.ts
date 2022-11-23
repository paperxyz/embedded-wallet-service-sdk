// General Embedded wallet types
export type Chains = "Polygon" | "Mumbai" | "Goerli" | "Ethereum";

// Class constructor types
export type PaperConstructorType = { clientId: string; chain: Chains };

export type CreateWalletReturnType = { walletAddress: string };
export type SetUpNewDeviceReturnType = { walletAddress: string };
export type HasWalletReturnType = { hasWallet: boolean };
export type IsNewDeviceReturnType = { isNewDevice: boolean };
