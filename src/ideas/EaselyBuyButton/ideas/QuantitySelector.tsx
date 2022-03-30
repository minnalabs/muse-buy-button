import { Text } from "@react-three/drei";
import {ComponentProps, useState} from "react";
import TextInput from "../components/TextInput";
import Button from "./Button";

type TextStyles = Partial<ComponentProps<typeof Text>>;

const FONT_FILE =
  "https://d27rt3a60hh1lx.cloudfront.net/fonts/Quicksand_Bold.otf";

type Props = {
  min: number,
  max: number,
  initialValue: number,
  // callback for when user changes value
  onChange: (value: number) => void,
  // callback for when user hits proceed button
  onProceed: () => void,
  textStyles?: TextStyles;
}

const QuantitySelector = (props: Props): JSX.Element => {
  const { min, max, initialValue, onChange, onProceed, ...rest } = props;
  const [value, setValue] = useState(initialValue.toString() ?? "1");
  const [error, setError] = useState<string>();
  const setValueWithCallback = (value: string) => {
    setValue(value);
    const asInt = parseInt(value);
    if (!isNaN(asInt) && asInt >= min && asInt <= max) {
      setError(undefined);
      onChange(asInt);
    } else {
      setError(`Must be between ${min} and ${max}.`);
    }
  }
  const headerTextStyles: TextStyles = {
    font: FONT_FILE,
    color: "black",
    fontSize: 0.06,
  };
  const errorTextStyles: TextStyles = {
    ...headerTextStyles,
    color: "red",
    fontSize: 0.02,
  };

  const onClick = () => {
    if (error) {
      return
    }

    onProceed();
  }

  return (
    <group name="quantity-selector" {...rest} >
      <group name="header">
        <Text {...headerTextStyles} position-y={0.04}>How many?</Text>
      </group>
      {error ? (
        <Text {...errorTextStyles} position-y={-0.1}>{error}</Text>
      ): null}
      <group name="selector" position-x={-0.05} position-y={-0.04}>
        <TextInput value={value.toString()} setValue={setValueWithCallback} />
      </group>
      <Button
        onClick={onClick}
        size={1}
        width={1}
        position-x={0.18}
        position-y={-0.04}
      >
        Go
      </Button>
    </group>

  );
}

export default QuantitySelector;
