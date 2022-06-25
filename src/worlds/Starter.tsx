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
          easelyListingId="lst_carn6ch8au98n5gspe7g"
          color="blue"
        />
      </group>
      <CloudySky color="white" />
      <TransparentFloor opacity={0.7} />
    </StandardEnvironment>
  );
}
