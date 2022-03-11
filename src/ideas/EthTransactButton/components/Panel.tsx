import { GroupProps } from "@react-three/fiber";
import { animated, useSpring, config } from "react-spring/three";
import { RoundedBox } from "@react-three/drei";
import { ReactNode, useState } from "react";
import Hitbox from "../ideas/Hitbox";

type PanelProps = {
  enabled: boolean;
  width: number;
  height: number;
  onClick?: () => void;
  children: ReactNode | ReactNode[];
} & GroupProps;

export default function Panel(props: PanelProps) {
  const { enabled, width, height, onClick, children, ...rest } = props;

  const restColor = "#fff";
  const hoverColor = "#ccc";

  const [hovered, setHovered] = useState(false);
  const { scale, color } = useSpring({
    scale: enabled ? (hovered ? 0.95 : 1) : 0,
    color: !onClick ? restColor : hovered ? hoverColor : restColor,
    config: config.gentle,
  });

  return (
    <group name="panel" {...rest}>
      <animated.group scale={scale}>
        <RoundedBox args={[width, height, 0.05]} radius={0.025} smoothness={10}>
          <animated.meshStandardMaterial color={color} />
        </RoundedBox>
        {onClick && (
          <Hitbox
            args={[width, height, 0.05]}
            onClick={onClick}
            onHover={() => setHovered(true)}
            onUnHover={() => setHovered(false)}
          />
        )}
        <group name="content" position-z={0.03}>
          {children}
        </group>
      </animated.group>
    </group>
  );
}
