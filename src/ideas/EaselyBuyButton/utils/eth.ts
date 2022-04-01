import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

declare global {
  interface Window {
    ethereum: any;
  }
}

export const getMetamaskProvider = async (): Promise<Web3> => {
  if (!window.ethereum) throw new Error("No ethereum provider found");
  await window.ethereum.send("eth_requestAccounts");
  return new Web3(window.ethereum);
};

export const getWalletConnectProvider = async (): Promise<Web3> => {
  const provider = new WalletConnectProvider({
    infuraId: "40fe055d5aa24c7e950dcdd67c2835c1",
  });
  await provider.enable();
  return new Web3(provider as any);
};
