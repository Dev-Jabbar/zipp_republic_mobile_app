import CollectionHeader from "@/components/shop/CollectionHeader";
import ProductCard from "@/components/shop/cards/ProductCard";
import ProductCardSkeleton from "@/components/shop/cards/ProductCardSkeleton";
import FilterDrawer from "@/components/shop/drawers/FilterDrawer";
import AsyncBoundary from "@/components/shop/ui/AsyncBoundary";
import { Brand } from "@/constants/theme";
import {
  getChips,
  getDrawerFilters,
  useCollectionFilters,
} from "@/hooks/shops/useCollectionFilters";
import { useCollectionProducts } from "@/hooks/shops/useCollectionProducts";
import { useHeaderMeasurementStore } from "@/store/useHeaderMeasurementStore";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const SKELETON_COUNT = 6;

const CollectionScreen = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const headerHeight = useHeaderMeasurementStore((s) => s.headerHeight);
  const [filterVisible, setFilterVisible] = useState(false);

  // 1. Filter STATE — doesn't need priceBounds, so no ordering problem.
  const { appliedFilters, applyFilters, removeChip, clearAll } =
    useCollectionFilters();

  // 2. Actual data fetch — needs appliedFilters from step 1.
  const { products, totalCount, priceBounds, loading, error } =
    useCollectionProducts({
      slug,
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      inStockOnly: appliedFilters.inStockOnly,
      sortBy: appliedFilters.sortBy,
    });

  const drawerFilters = getDrawerFilters(appliedFilters, priceBounds);
  const chips = useMemo(
    () => getChips(appliedFilters, priceBounds),
    [appliedFilters, priceBounds],
  );

  const headerComponent = (
    <CollectionHeader
      count={products.length}
      totalCount={totalCount}
      onFilterPress={() => setFilterVisible(true)}
      chips={chips}
      onRemoveChip={removeChip}
      onClearAll={clearAll}
    />
  );

  return (
    <>
      <AsyncBoundary
        loading={loading}
        error={error}
        skeleton={
          <FlatList
            style={styles.list}
            data={Array.from({ length: SKELETON_COUNT })}
            keyExtractor={(_, i) => `skeleton-${i}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.content}
            ListHeaderComponent={headerComponent}
            renderItem={() => (
              <View style={styles.cardWrapper}>
                <ProductCardSkeleton fullWidth />
              </View>
            )}
          />
        }
      >
        <FlatList
          style={styles.list}
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          ListHeaderComponent={headerComponent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ProductCard
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                onSale={item.onSale}
                image={item.image}
                category={item.category}
                colors={item.colors}
                fullWidth
              />
            </View>
          )}
        />
      </AsyncBoundary>

      <FilterDrawer
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        topInset={headerHeight}
        priceBounds={priceBounds}
        totalCount={totalCount}
        filteredCount={products.length}
        value={drawerFilters}
        onApply={applyFilters}
      />
    </>
  );
};

export default CollectionScreen;

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: Brand.white },
  content: { padding: 16, paddingBottom: 60 },
  row: { justifyContent: "space-between" },
  cardWrapper: { width: "48%", marginBottom: 20 },
});
