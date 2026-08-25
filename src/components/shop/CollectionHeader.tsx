import { Brand } from "@/constants/theme";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface FilterChip {
  key: string;
  label: string;
}

interface CollectionHeaderProps {
  count: number;
  totalCount: number;
  onFilterPress?: () => void;
  /** Active filters shown as removable chips (e.g. price range, in stock). Empty = no chip row rendered. */
  chips?: FilterChip[];
  onRemoveChip?: (key: string) => void;
  onClearAll?: () => void;
}

const CollectionHeader = ({
  count,
  totalCount,
  onFilterPress,
  chips = [],
  onRemoveChip,
  onClearAll,
}: CollectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <Text style={styles.filterText}>⇅ FILTER AND SORT</Text>
        </TouchableOpacity>
        <Text style={styles.count}>
          {count} OF {totalCount} PRODUCTS
        </Text>
      </View>

      {chips.length > 0 && (
        <View style={styles.chipRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScrollContent}
          >
            {chips.map((chip) => (
              <TouchableOpacity
                key={chip.key}
                style={styles.chip}
                onPress={() => onRemoveChip?.(chip.key)}
              >
                <Text style={styles.chipLabel}>{chip.label}</Text>
                <Text style={styles.chipRemove}>×</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClearAll} hitSlop={8}>
            <Text style={styles.clearAll}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CollectionHeader;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterBtn: { flexDirection: "row", alignItems: "center" },
  filterText: { fontSize: 13, fontWeight: "600", color: Brand.text },
  count: { fontSize: 13, fontWeight: "600", color: Brand.text },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  chipScrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  chipLabel: {
    fontSize: 12,
    color: Brand.text,
  },
  chipRemove: {
    fontSize: 14,
    color: Brand.text,
    opacity: 0.6,
  },
  clearAll: {
    fontSize: 12,
    color: Brand.text,
    textDecorationLine: "underline",
    marginLeft: 8,
  },
});
