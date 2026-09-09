// Destination: src/app/(shop)/products/[id].tsx

import ProductCard from "@/components/shop/cards/ProductCard";
import ProductDetailSkeleton from "@/components/shop/cards/ProductDetailSkeleton";
import FaqSection from "@/components/shop/FaqSection";
import Footer from "@/components/shop/Footer";
import ProductInfoLinks from "@/components/shop/ProductInfoLinks";
import ShareRow from "@/components/shop/ShareRow";
import AsyncBoundary from "@/components/shop/ui/AsyncBoundary";
import QuantitySelector from "@/components/shop/ui/QuantitySelector";
import SizeSelector from "@/components/shop/ui/SizeSelector";
import { mockFaqs } from "@/constants/mockFaqs";
import { Brand } from "@/constants/theme";
import { useGoToProduct } from "@/hooks/shops/useGoToProduct";
import { useProduct } from "@/hooks/shops/useProduct";
import { useRelatedProducts } from "@/hooks/shops/useRelatedProducts";
import { useCartStore } from "@/store/useCartStore";
import { formatNaira } from "@/utils/currency";
import { getCardVariant } from "@/utils/product";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);
  const { products: relatedProducts } = useRelatedProducts(product);
  const goToProduct = useGoToProduct();
  const addItem = useCartStore((s) => s.addItem);
  const isLandscape = product
    ? getCardVariant(product.category) === "landscape"
    : false;

  const sizes = product?.sizes ?? DEFAULT_SIZES;
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  // Reset selections whenever the product itself changes (e.g. tapping a
  // related product while already on a detail page navigates to a new
  // id — this screen instance gets reused, so state needs to reset).
  useEffect(() => {
    setSelectedSize((product?.sizes ?? DEFAULT_SIZES)[0]);
    setQuantity(1);
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        image: { uri: product.image },
        price: product.price,
        size: selectedSize,
      },
      quantity,
    );
  };

  const handleBuyItNow = () => {
    handleAddToCart();
    // TODO: navigate straight to checkout once that screen is built.
  };

  return (
    <AsyncBoundary
      loading={loading}
      error={error}
      skeleton={<ProductDetailSkeleton />}
    >
      {!product ? (
        // Real "not found" (product doesn't exist) — distinct from the
        // skeleton above, which only covers the loading phase. Kept as
        // plain text since there's nothing to shape a skeleton around
        // once we know for certain there's no product to show.
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Product not found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {/* Breadcrumb */}
          <View style={styles.breadcrumb}>
            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.breadcrumbLink}>Home</Text>
            </TouchableOpacity>
            <Text style={styles.breadcrumbSeparator}> / </Text>
            <Text style={styles.breadcrumbCurrent} numberOfLines={1}>
              {product.name}
            </Text>
          </View>

          {/* Image */}
          <View
            style={[
              styles.imageWrapper,
              { aspectRatio: isLandscape ? 4 / 3 : 3 / 4 },
            ]}
          >
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </View>

          {/* Info block */}
          <View style={styles.infoBlock}>
            <Text style={styles.brand}>ZIPP REPUBLIC</Text>
            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.priceRow}>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>
                  {formatNaira(product.originalPrice)}
                </Text>
              )}
              <Text style={styles.price}>{formatNaira(product.price)}</Text>
              {product.onSale && (
                <View style={styles.saleBadge}>
                  <Text style={styles.saleText}>SALE</Text>
                </View>
              )}
            </View>

            <Text style={styles.shippingNote}>
              Shipping calculated at checkout.
            </Text>

            <View style={styles.section}>
              <SizeSelector
                sizes={sizes}
                selected={selectedSize}
                onSelect={setSelectedSize}
              />
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.qtyWrapper}>
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
              </View>
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={handleAddToCart}
              >
                <Text style={styles.addToCartText}>ADD TO CART</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyItNow}>
              <Text style={styles.buyNowText}>BUY IT NOW</Text>
            </TouchableOpacity>

            <View style={styles.section}>
              <ProductInfoLinks />
            </View>

            <View style={styles.section}>
              <ShareRow productName={product.name} />
            </View>
          </View>

          {/* You may also like */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>YOU MAY ALSO LIKE</Text>
              <Text style={styles.relatedSubtitle}>
                Combine your style with these products
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScrollContent}
              >
                {relatedProducts.map((related) => (
                  <ProductCard
                    key={related.id}
                    name={related.name}
                    price={related.price}
                    originalPrice={related.originalPrice}
                    onSale={related.onSale}
                    image={related.image}
                    category={related.category}
                    colors={related.colors}
                    onPress={() => goToProduct(related.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <FaqSection
            faqs={mockFaqs}
            subtitle="They appreciate cut and details, things that aren't so obvious."
          />

          <Footer />
        </ScrollView>
      )}
    </AsyncBoundary>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  breadcrumbLink: {
    fontSize: 12,
    color: Brand.text,
    textDecorationLine: "underline",
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  breadcrumbCurrent: {
    fontSize: 12,
    color: Brand.textSecondary,
    flexShrink: 1,
  },
  imageWrapper: {
    width: "100%",
    backgroundColor: Brand.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EEEEEE",
  },
  infoBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  brand: {
    fontSize: 11,
    color: Brand.textSecondary,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Brand.text,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  originalPrice: {
    fontSize: 14,
    color: Brand.priceStrikethrough,
    textDecorationLine: "line-through",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  saleBadge: {
    backgroundColor: Brand.sale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saleText: {
    color: Brand.saleText,
    fontSize: 10,
    fontWeight: "bold",
  },
  shippingNote: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginTop: 6,
  },
  section: {
    marginTop: 24,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  qtyWrapper: {
    width: 120,
  },
  addToCartBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.black,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Brand.text,
  },
  buyNowBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 2,
    marginTop: 12,
  },
  buyNowText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  relatedSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.text,
  },
  relatedSubtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    marginTop: 4,
  },
  relatedScrollContent: {
    marginTop: 16,
    paddingRight: 16,
  },
});
