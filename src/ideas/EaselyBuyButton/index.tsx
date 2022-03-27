import { RoundedBox, Text } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { GroupProps } from "@react-three/fiber";
import EthPrice from "./ideas/EthPrice";
import EthWalletSelector from "./ideas/EthWalletSelector";
import Panel from "./components/Panel";
import Button from "./ideas/Button";
import {getListing, mintFromListing} from "./utils/easely";
import type {Listing} from "./utils/easely";
import {TransactionReceipt} from "web3-core";

const FONT_FILE =
  "https://d27rt3a60hh1lx.cloudfront.net/fonts/Quicksand_Bold.otf";

type EaselyBuyButtonProps = {
  easelyListingId: string;
  text: string;
  color?: string;
} & GroupProps;

enum Stage {
  Initial, // waiting for user to interact with it
  SelectQuantity, // if listing allows selecting quantity, user can enter a quantity
  SelectWallet, // select between wallets
  Processing, // talking to the blockchain
  Success, // transaction went through
}

export default function EaselyBuyButton(props: EaselyBuyButtonProps) {
  const {
    text,
    easelyListingId,
    color = "black",
    ...restProps
  } = props;


  // internal state
  const [stage, setStage] = useState<Stage>(Stage.Initial);
  const [error, setError] = useState<string>();
  const [listing, setListing] = useState<Listing>();
  const [tx, setTx] = useState<TransactionReceipt>();

  // helper functions
  const flashError = (s: string) => {
    setError(s);
    setStage(Stage.Initial);
    setTimeout(() => setError(undefined), 5000);
  };
  const openTxHash = () => {
    if (tx) window.open(`https://etherscan.io/tx/${tx.transactionHash}`);
  };
  const reset = () => {
    setStage(Stage.Initial);
    setError(undefined);
    setTx(undefined);
  };
  const clickButton = () => {
    setStage(1);
  };

  useEffect(() => {
    getListing(easelyListingId)
      .then(lst => {
        console.log(lst);
        setListing(lst);
        setError(undefined);
      })
      .catch(e => {
        setError(e);
      });
  }, [easelyListingId])


  const HEIGHT = 0.25;
  const WIDTH = 0.6;

  return (
    <group name="crypto-transaction-button" {...restProps}>
      <RoundedBox
        name="outline"
        args={[WIDTH + 0.05, HEIGHT + 0.025, 0.05]}
        position-z={-0.0175}
        radius={0.025}
        smoothness={10}
      >
        <meshStandardMaterial color={color} />
      </RoundedBox>

      <Panel
        enabled={!listing && !error}
        width={WIDTH}
        height={HEIGHT}
      >
        Loading...
      </Panel>

      <Panel
        enabled={stage === 0 && !!listing && !error && !tx}
        width={WIDTH}
        height={HEIGHT}
        onClick={clickButton}
      >
        <Text font={FONT_FILE} color={color} fontSize={0.075} position-y={0.04}>
          {text}
        </Text>
      </Panel>

      <Panel
        enabled={stage === 1 && !!listing && !error && !tx}
        width={WIDTH}
        height={HEIGHT}
      >
        <EthWalletSelector
          trigger={stage === 1 && !error && !tx}
          onConnect={(web3) => {
            if (!listing) {
              throw new Error("no listing?");
            }
            setStage(2);
            return mintFromListing(web3, listing, 1)
          }}
          setError={flashError}
          setTx={(h) =>{
            setTx(h);
            setStage(3);
          }}
        />
      </Panel>

      <Panel enabled={stage == 2 && !error && !tx} width={WIDTH} height={HEIGHT}>
        <Text
          color="gray"
          fontSize={0.02}
          maxWidth={WIDTH * 0.8}
          position-z={0.03}
          textAlign="center"
        >
          Working on it...
        </Text>
      </Panel>

      <Panel enabled={!!tx} width={WIDTH} height={HEIGHT}>
        <Text
          color="green"
          fontSize={0.03}
          position-z={0.03}
          position-y={0.075}
        >
          Success!
        </Text>
        <Button
          onClick={openTxHash}
          size={0.5}
          width={5}
          position-y={0.01}
        >
          View transaction
        </Button>
        <Button
          onClick={reset}
          size={0.5}
          width={5}
          position-y={-0.065}
        >
          Return
        </Button>
      </Panel>

      <Panel enabled={!!error} width={WIDTH} height={HEIGHT}>
        <Text
          color="red"
          fontSize={0.02}
          maxWidth={WIDTH * 0.8}
          position-z={0.03}
          textAlign="center"
        >
          {error}
        </Text>
      </Panel>
    </group>
  );
}
