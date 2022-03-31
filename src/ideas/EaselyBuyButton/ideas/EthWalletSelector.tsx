import { getMetamaskProvider, getWalletConnectProvider } from "../utils/eth";
import { Interactable, Image, useEnvironment } from "spacesvr";
import { useEffect } from "react";
import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import Button from "./Button";

const METAMASK_IMG =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png";

const WALLETCONNECT_IMAGE = "https://i.imgur.com/6W0yKmv.png";

type WalletType = "metamask" | "walletconnect";

type Wallet = {
  name: string;
  image: string;
  onClick: () => any;
};

type EthWalletSelectorProps = {
  trigger: boolean;
  onConnect: (web3: Web3) => Promise<TransactionReceipt>;
  onBack: () => void;
  setError: (e: string) => void;
  setTx: (tx: TransactionReceipt) => void;
};

export default function EthWalletSelector(props: EthWalletSelectorProps) {
  const { trigger, onConnect, onBack, setError, setTx } = props;

  const { device } = useEnvironment();

  const mintWithWallet = async (walletType: WalletType) => {
    try {
      let web3;
      if (walletType === "metamask") {
        web3 = await getMetamaskProvider();
      }
      if (walletType === "walletconnect") {
        web3 = await getWalletConnectProvider();
      }
      if (!web3) {
        throw Error("wallet not found");
      }
      const tx = await onConnect(web3);
      setTx(tx);
    } catch (e) {
      console.error(e);
      setError(e.message || "unknown error");
    }
  };

  // build wallet selections
  const wallets: Wallet[] = [
    {
      name: "walletconnect",
      image: WALLETCONNECT_IMAGE,
      onClick: () => mintWithWallet("walletconnect"),
    },
  ];
  if (!device.mobile) {
    wallets.unshift({
      name: "metamask",
      image: METAMASK_IMG,
      onClick: () => mintWithWallet("metamask"),
    });
  }

  // trigger walletconnect shit if mobile detected
  useEffect(() => {
    if (trigger && device.mobile) mintWithWallet("walletconnect");
  }, [device.mobile, mintWithWallet, trigger]);

  return (
    <group name="eth-wallet-selector">
      {wallets.map((wallet, i) => (
        <group
          key={`${wallet}-${i}`}
          name={`${wallet.name}-button`}
          position-x={(i + 0.5 - wallets.length / 2) * 0.22}
        >
          <Interactable onClick={() => wallet.onClick()}>
            <Image src={wallet.image} size={0.175} />
          </Interactable>
        </group>
      ))}
      <Button
        onClick={onBack}
        size={0.5}
        width={0.5}
        position-x={-0.25}
        position-y={0.09}
        color="gray"
      >
        {"<"}
      </Button>
    </group>
  );
}
