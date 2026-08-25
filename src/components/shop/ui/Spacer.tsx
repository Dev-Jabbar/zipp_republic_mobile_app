import { View } from "react-native";

type SpacerProps = {
  size?: number;
  horizontal?: boolean;
};

const Spacer = ({ size = 16, horizontal = false }: SpacerProps) => {
  return <View style={horizontal ? { width: size } : { height: size }} />;
};

export default Spacer;
