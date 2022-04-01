import { RoundedBox, Text } from "@react-three/drei";
import { useEffect, useState, useMemo } from "react";
import { GroupProps } from "@react-three/fiber";
import EthPrice from "./ideas/EthPrice";
import EthWalletSelector from "./ideas/EthWalletSelector";
import Panel from "./components/Panel";
import Button from "./ideas/Button";
import QuantitySelector from "./ideas/QuantitySelector";
import {
  getListing,
  mintFromListing,
  getRandomizedCollectionMintOptions,
} from "./utils/easely";
import type { Listing, RandomizedCollectionMintOptions } from "./utils/easely";
import { TransactionReceipt } from "web3-core";

const FONT_FILE =
  "https://d27rt3a60hh1lx.cloudfront.net/fonts/Quicksand_Bold.otf";

type EaselyBuyButtonProps = {
  easelyListingId: string;
  text: string;
  color?: string;
} & GroupProps;

enum Stage {
  Initial = "initial", // waiting for user to interact with it
  SelectQuantity = "selectQuantity", // if listing allows selecting quantity, user can enter a quantity
  SelectWallet = "selectWallet", // select between wallets
  Processing = "processing", // talking to the blockchain
  Success = "success", // transaction went through
}

export default function EaselyBuyButton(props: EaselyBuyButtonProps) {
  const { text, easelyListingId, color = "black", ...restProps } = props;

  // internal state
  const [stage, setStage] = useState<Stage>(Stage.Initial);
  const [error, setError] = useState<string>();
  const [listing, setListing] = useState<Listing>();
  const [tx, setTx] = useState<TransactionReceipt>();
  const [numberToMint, setNumberToMint] = useState<number>();
  const [mintOptions, setMintOptions] =
    useState<RandomizedCollectionMintOptions | null>(null);

  let defaultNumberToMint = 1;
  if (mintOptions && mintOptions.fixedMintsPerTransaction !== 0) {
    defaultNumberToMint = mintOptions.fixedMintsPerTransaction;
  }

  // helper functions
  const flashError = (s: string) => {
    setError(s);
    setStage(Stage.Initial);
    setTimeout(() => setError(undefined), 5000);
  };
  const openTxHash = () => {
    if (tx) {
      if (listing?.network === "rinkeby") {
        window.open(`https://rinkeby.etherscan.io/tx/${tx.transactionHash}`)
      } else {
        window.open(`https://etherscan.io/tx/${tx.transactionHash}`)
      }
    }
  };
  const reset = () => {
    setStage(Stage.Initial);
    setError(undefined);
    setTx(undefined);
  };
  const clickButton = () => {
    if (mintOptions && mintOptions.canSelectQuantity) {
      setStage(Stage.SelectQuantity);
      return;
    }
    setStage(Stage.SelectWallet);
  };

  useEffect(() => {
    getListing(easelyListingId)
      .then((lst) => {
        setListing(lst);
        setMintOptions(getRandomizedCollectionMintOptions(lst));
        setError(undefined);
      })
      .catch((e) => {
        setError(e);
      });
  }, [easelyListingId]);

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

      <Panel enabled={!listing && !error} width={WIDTH} height={HEIGHT}>
        Loading...
      </Panel>

      <Panel
        enabled={stage === Stage.Initial && !!listing && !error && !tx}
        width={WIDTH}
        height={HEIGHT}
        onClick={clickButton}
      >
        <Text font={FONT_FILE} color={color} fontSize={0.075} position-y={0.04}>
          {text}
        </Text>
        <EthPrice amount={listing?.priceInEth ?? 0} position-y={-0.03} />
      </Panel>

      {mintOptions && mintOptions.canSelectQuantity ? (
        <Panel
          enabled={stage === Stage.SelectQuantity && !!listing && !error && !tx}
          width={WIDTH}
          height={HEIGHT}
        >
          <QuantitySelector
            min={1}
            max={mintOptions.maxMintsPerTransaction}
            initialValue={defaultNumberToMint}
            onChange={setNumberToMint}
            onProceed={() => {
              setStage(Stage.SelectWallet);
            }}
            onBack={() => {
              setStage(Stage.Initial);
            }}
          />
        </Panel>
      ) : null}

      <Panel
        enabled={stage === Stage.SelectWallet && !!listing && !error && !tx}
        width={WIDTH}
        height={HEIGHT}
      >
        <EthWalletSelector
          trigger={stage === Stage.SelectWallet && !error && !tx}
          onConnect={(web3) => {
            if (!listing) {
              throw new Error("no listing?");
            }
            setStage(Stage.Processing);
            return mintFromListing(
              web3,
              listing,
              numberToMint || defaultNumberToMint
            );
          }}
          onBack={() => {
            setStage(
              mintOptions?.canSelectQuantity
                ? Stage.SelectQuantity
                : Stage.Initial
            );
          }}
          setError={flashError}
          setTx={(h) => {
            setTx(h);
            setStage(Stage.Success);
          }}
        />
      </Panel>

      <Panel
        enabled={stage == Stage.Processing && !error && !tx}
        width={WIDTH}
        height={HEIGHT}
      >
        <Text
          font={FONT_FILE}
          color="gray"
          fontSize={0.04}
          maxWidth={WIDTH * 0.8}
          position-z={0.03}
          textAlign="center"
        >
          Working on it...
        </Text>
      </Panel>

      <Panel enabled={!!tx} width={WIDTH} height={HEIGHT}>
        <Text
          font={FONT_FILE}
          color="green"
          fontSize={0.03}
          position-z={0.03}
          position-y={0.05}
        >
          Success!
        </Text>
        <Button onClick={openTxHash} size={0.5} width={5} position-y={-0.015}>
          View transaction
        </Button>
        <Button onClick={reset} size={0.5} width={5} position-y={-0.065}>
          Return
        </Button>
      </Panel>

      <Panel enabled={!!error} width={WIDTH} height={HEIGHT}>
        <Text
          color="red"
          font={FONT_FILE}
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
