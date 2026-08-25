import ProductCard from "@/components/shop/cards/ProductCard";
import ProductCardSkeleton from "@/components/shop/cards/ProductCardSkeleton";
import AsyncBoundary from "@/components/shop/ui/AsyncBoundary";
import { Brand } from "@/constants/theme";
import { useProductSection } from "@/hooks/shops/useProductSection";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface ProductSectionProps {
  title?: string;
  category?: string;
  isNewArrivals?: boolean;
  subtitle?: string;
  shopLinkLabel?: string;
  centerContent?: boolean;
  offset?: number;
  limit?: number;
}

const ProductSection = ({
  title,
  category,
  isNewArrivals = false,
  subtitle,
  shopLinkLabel,
  centerContent = false,
  offset = 0,
  limit,
}: ProductSectionProps) => {
  const { products, loading, error } = useProductSection({
    category,
    isNewArrivals,
    offset,
    limit,
  });

  // How many skeleton cards to show while loading — falls back to a
  // sensible default when no limit was given, so an unlimited section
  // doesn't try to render an unbounded skeleton row.
  const skeletonCount = limit ?? 4;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, centerContent && styles.centered]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, centerContent && styles.centered]}>
          {subtitle}
        </Text>
      )}
      {shopLinkLabel && (
        <Text style={[styles.shopLink, centerContent && styles.centered]}>
          {shopLinkLabel}
        </Text>
      )}

      <AsyncBoundary
        loading={loading}
        error={error}
        skeleton={
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <View key={i} style={styles.skeletonSpacing}>
                <ProductCardSkeleton category={category} />
              </View>
            ))}
          </ScrollView>
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              onSale={product.onSale}
              image={product.image}
              category={product.category}
              colors={product.colors}
            />
          ))}
        </ScrollView>
      </AsyncBoundary>
    </View>
  );
};

export default ProductSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: Brand.white,
  },
  title: { fontSize: 22, fontWeight: "bold", color: Brand.text },
  subtitle: { fontSize: 14, color: Brand.textSecondary, marginTop: 4 },
  shopLink: {
    fontSize: 14,
    color: Brand.text,
    textDecorationLine: "underline",
    marginTop: 8,
    marginBottom: 12,
  },
  centered: { textAlign: "center" },
  scroll: { marginTop: 12 },
  skeletonSpacing: { marginRight: 12 },
});
