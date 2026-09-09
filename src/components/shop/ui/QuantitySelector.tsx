import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
}

const QuantitySelector = ({
  quantity,
  onChange,
  min = 1,
}: QuantitySelectorProps) => {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => onChange(Math.max(min, quantity - 1))}
        hitSlop={8}
      >
        <Ionicons name="remove" size={16} color={Brand.text} />
      </TouchableOpacity>
      <Text style={styles.value}>{quantity}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => onChange(quantity + 1)}
        hitSlop={8}
      >
        <Ionicons name="add" size={16} color={Brand.text} />
      </TouchableOpacity>
    </View>
  );
};

export default QuantitySelector;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 2,
    height: 52,
    paddingHorizontal: 16,
  },
  btn: {
    padding: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.text,
  },
});
