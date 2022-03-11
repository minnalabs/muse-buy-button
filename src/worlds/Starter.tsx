import { StandardEnvironment } from "spacesvr";
import TransparentFloor from "../ideas/TransparentFloor";
import CloudySky from "../ideas/CloudySky";
import EthTransactButton from "../ideas/EthTransactButton";

export default function Starter() {
  return (
    <StandardEnvironment>
      <ambientLight />
      <group position={[0, 1, -4]}>
        <EthTransactButton text="hello" amount={0.01} receiveAddress="0x3a15EBbF9ae932F667076e7B2cfAb8998Aa02753" />
      </group>
      <CloudySky color="white" />
      <TransparentFloor opacity={0.7} />
    </StandardEnvironment>
  );
}
