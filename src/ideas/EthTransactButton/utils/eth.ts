import Web3 from "web3";
import { WalletConnectSDK } from "./walletconnect";

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

export const getMetamaskProvider = async (): Promise<Web3> => {
  if (!window.ethereum) throw new Error("No ethereum provider found");
  await window.ethereum.send("eth_requestAccounts");
  return new Web3(window.ethereum);
};

export const getWalletConnectProvider = async (): Promise<Web3> => {
  await WalletConnectSDK.connect();
  const walletConnectProvider = new WalletConnectSDK.getWeb3Provider({
    infuraId: "40fe055d5aa24c7e950dcdd67c2835c1",
  });
  await walletConnectProvider.enable();
  return new Web3(walletConnectProvider);
};
