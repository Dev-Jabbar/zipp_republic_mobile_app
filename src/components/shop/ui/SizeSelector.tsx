import { Brand } from "@/constants/theme";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SizeSelectorProps {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
}

const SizeSelector = ({ sizes, selected, onSelect }: SizeSelectorProps) => {
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.label}>SIZE: {selected}</Text>
      </View>
      <View style={styles.row}>
        {sizes.map((size) => {
          const isSelected = size === selected;
          return (
            <TouchableOpacity
              key={size}
              style={[styles.box, isSelected && styles.boxSelected]}
              onPress={() => onSelect(size)}
            >
              <Text
                style={[styles.boxText, isSelected && styles.boxTextSelected]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SizeSelector;

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  box: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  boxSelected: {
    borderColor: Brand.black,
    borderWidth: 2,
  },
  boxText: {
    fontSize: 13,
    color: Brand.text,
  },
  boxTextSelected: {
    fontWeight: "700",
  },
});
