import { StandardEnvironment } from "spacesvr";
import TransparentFloor from "../ideas/TransparentFloor";
import CloudySky from "../ideas/CloudySky";
import EaselyBuyButton from "../ideas/EaselyBuyButton";

export default function Starter() {
  return (
    <StandardEnvironment>
      <ambientLight />
      <group position={[0, 1, -4]}>
        <EaselyBuyButton
          text="Buy"
          easelyListingId="lst_c90d4fkds0m70adpasu0"
        />
      </group>
      <CloudySky color="white" />
      <TransparentFloor opacity={0.7} />
    </StandardEnvironment>
  );
}
