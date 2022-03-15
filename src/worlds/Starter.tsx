import { StandardEnvironment } from "spacesvr";
import TransparentFloor from "../ideas/TransparentFloor";
import CloudySky from "../ideas/CloudySky";
import EthTransactButton from "../ideas/EthTransactButton";

export default function Starter() {
  return (
    <StandardEnvironment>
      <ambientLight />
      <group position={[0, 1, -4]}>
        <EthTransactButton easelyListingId="lst_c8o3r74ds0m40i5rill0" />
      </group>
      <CloudySky color="white" />
      <TransparentFloor opacity={0.7} />
    </StandardEnvironment>
  );
}
