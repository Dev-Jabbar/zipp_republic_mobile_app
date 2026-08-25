import PriceRangeSlider from "@/components/shop/ui/PriceRangeSlider";
import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerShell from "./DrawerShell";

export type SortOption =
  | "featured"
  | "most_relevant"
  | "best_selling"
  | "az"
  | "za"
  | "price_low_high"
  | "price_high_low"
  | "date_old_new"
  | "date_new_old";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "most_relevant", label: "Most relevant" },
  { value: "best_selling", label: "Best selling" },
  { value: "az", label: "Alphabetically, A-Z" },
  { value: "za", label: "Alphabetically, Z-A" },
  { value: "price_low_high", label: "Price, low to high" },
  { value: "price_high_low", label: "Price, high to low" },
  { value: "date_old_new", label: "Date, old to new" },
  { value: "date_new_old", label: "Date, new to old" },
];

export interface FilterState {
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
}

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
  topInset?: number;
  /** Absolute bounds of the price slider — usually 0 and the highest priced product. */
  priceBounds: { min: number; max: number };
  /** Total product count before filtering, and how many match the current draft filters. */
  totalCount: number;
  filteredCount: number;
  value: FilterState;
  onApply: (filters: FilterState) => void;
}

const FilterDrawer = ({
  visible,
  onClose,
  topInset = 0,
  priceBounds,
  totalCount,
  filteredCount,
  value,
  onApply,
}: FilterDrawerProps) => {
  const insets = useSafeAreaInsets();
  // Draft state — only committed to the parent when "Apply" is pressed, so
  // dragging the slider doesn't re-filter the product grid on every pixel.
  const [draft, setDraft] = useState<FilterState>(value);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Reset the draft back to the last actually-applied filters every time
  // the drawer opens, so dragging-but-cancelling doesn't leave stale values
  // showing next time it's reopened.
  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === draft.sortBy)?.label ?? "Featured";

  const handleApply = () => {
    setSortMenuOpen(false);
    onApply(draft);
    onClose();
  };

  return (
    <DrawerShell visible={visible} onClose={onClose} noTopSafeArea>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>FILTER AND SORT</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCount} OF {totalCount} PRODUCTS
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={22} color={Brand.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVAILABILITY</Text>
          <View style={styles.row}>
            <Switch
              value={draft.inStockOnly}
              onValueChange={(v) => setDraft((d) => ({ ...d, inStockOnly: v }))}
              trackColor={{ false: Brand.border, true: Brand.black }}
            />
            <Text style={styles.rowLabel}>In stock</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRICE</Text>
          <Text style={styles.helperText}>
            The highest price is ₦{priceBounds.max.toLocaleString()}.00
          </Text>

          <View style={styles.sliderWrapper}>
            <PriceRangeSlider
              min={priceBounds.min}
              max={priceBounds.max}
              valueMin={draft.minPrice}
              valueMax={draft.maxPrice}
              onChange={(lo, hi) =>
                setDraft((d) => ({ ...d, minPrice: lo, maxPrice: hi }))
              }
            />
          </View>

          <View style={styles.priceInputsRow}>
            <View style={styles.priceInputBox}>
              <Text style={styles.currencyPrefix}>₦</Text>
              <TextInput
                value={String(draft.minPrice)}
                onChangeText={(t) =>
                  setDraft((d) => ({
                    ...d,
                    minPrice: Math.min(Number(t) || 0, d.maxPrice),
                  }))
                }
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
            <View style={styles.priceInputBox}>
              <Text style={styles.currencyPrefix}>₦</Text>
              <TextInput
                value={String(draft.maxPrice)}
                onChangeText={(t) =>
                  setDraft((d) => ({
                    ...d,
                    maxPrice: Math.max(Number(t) || 0, d.minPrice),
                  }))
                }
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </View>
        </View>

        {/* Sort by */}
        <View style={styles.section}>
          <View style={styles.sortRow}>
            <Text style={styles.sectionTitle}>SORT BY</Text>
            <TouchableOpacity
              style={styles.sortSelect}
              onPress={() => setSortMenuOpen((v) => !v)}
            >
              <Text style={styles.sortSelectLabel}>{currentSortLabel}</Text>
              <Ionicons
                name={sortMenuOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color={Brand.text}
              />
            </TouchableOpacity>
          </View>

          {sortMenuOpen && (
            <View style={styles.sortMenu}>
              {SORT_OPTIONS.map((opt) => {
                const selected = opt.value === draft.sortBy;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.sortOption,
                      selected && styles.sortOptionSelected,
                    ]}
                    onPress={() => {
                      setDraft((d) => ({ ...d, sortBy: opt.value }));
                      setSortMenuOpen(false);
                    }}
                  >
                    <Text style={styles.sortOptionLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.applyBtn, { paddingBottom: insets.bottom + 76 }]}
        onPress={handleApply}
      >
        <Text style={styles.applyText}>APPLY</Text>
      </TouchableOpacity>
    </DrawerShell>
  );
};

export default FilterDrawer;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    color: Brand.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Brand.text,
    opacity: 0.5,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Brand.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  helperText: {
    fontSize: 12,
    color: Brand.text,
    opacity: 0.6,
    marginBottom: 20,
  },
  sliderWrapper: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  priceInputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  priceInputBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 14,
    color: Brand.text,
    opacity: 0.6,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    color: Brand.text,
    paddingVertical: 10,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortSelect: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortSelectLabel: {
    fontSize: 13,
    color: Brand.text,
  },
  sortMenu: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  sortOptionSelected: {
    backgroundColor: Brand.border,
  },
  sortOptionLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  applyBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
