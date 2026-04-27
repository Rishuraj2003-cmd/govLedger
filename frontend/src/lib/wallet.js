export class MetaMaskMissingError extends Error {
  constructor() {
    super("MetaMask is not installed. Please install the MetaMask browser extension to connect your wallet.");
    this.name = "MetaMaskMissingError";
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new MetaMaskMissingError();
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  return accounts[0];
}

export function shortAddress(address) {
  if (!address) {
    return "Not connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
