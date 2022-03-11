import { ethers } from "ethers";
import { WalletConnectSDK } from "../utils/walletconnect";
import { TransactionResponse, Web3Provider } from "@ethersproject/providers";

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

export const getMetamaskProvider = async () => {
  if (!window.ethereum) throw new Error("No ethereum provider found");
  await window.ethereum.send("eth_requestAccounts");
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getWalletConnectProvider = async () => {
  await WalletConnectSDK.connect();
  const walletConnectProvider = new WalletConnectSDK.getWeb3Provider({
    infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Required
  });
  await walletConnectProvider.enable();
  return new ethers.providers.Web3Provider(walletConnectProvider);
};

export const sendPayment = async (
  amount: number,
  address: string,
  provider: Web3Provider
): Promise<TransactionResponse> => {
  const signer = provider.getSigner();
  const value = ethers.utils.parseEther(amount.toString());
  return await signer.sendTransaction({
    value,
    to: address,
    gasLimit: 21000,
  });
};
