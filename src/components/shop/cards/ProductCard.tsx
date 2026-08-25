import { Brand } from "@/constants/theme";
import { formatNaira } from "@/utils/currency";
import { getCardVariant } from "@/utils/product";
import { Image, StyleSheet, Text, View } from "react-native";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  brandName?: string;
  image?: string;
  category: string;
  colors?: string[];
  fullWidth?: boolean; // true = fill parent (grid), false = fixed width (horizontal scroll)
}

const ProductCard = ({
  name,
  price,
  originalPrice,
  onSale,
  brandName = "ZIPP REPUBLIC",
  image,
  category,
  colors,
  fullWidth = false,
}: ProductCardProps) => {
  const variant = getCardVariant(category);
  const isLandscape = variant === "landscape";

  return (
    <View
      style={[styles.card, !fullWidth && { width: isLandscape ? 300 : 230 }]}
    >
      <View
        style={[
          styles.imageWrapper,
          fullWidth
            ? { width: "100%", aspectRatio: 1 }
            : {
                width: isLandscape ? 300 : 230,
                height: isLandscape ? 300 : 300,
              },
        ]}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        {onSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleText}>SALE</Text>
          </View>
        )}
      </View>

      <Text style={styles.brand}>{brandName}</Text>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.priceRow}>
        {originalPrice && (
          <Text style={styles.originalPrice}>{formatNaira(originalPrice)}</Text>
        )}
        <Text style={styles.price}>{formatNaira(price)}</Text>
      </View>

      {!!colors?.length && (
        <Text style={styles.colors}>
          Available in {colors.length} color{colors.length > 1 ? "s" : ""}
        </Text>
      )}
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: { marginRight: 0 },
  imageWrapper: {
    borderRadius: 4,
    overflow: "hidden",
    justifyContent: "flex-start",
    padding: 8,
  },
  image: { position: "absolute", width: "100%", height: "100%" },
  imagePlaceholder: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#EEEEEE",
  },
  saleBadge: {
    backgroundColor: Brand.sale,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  saleText: { color: Brand.saleText, fontSize: 10, fontWeight: "bold" },
  brand: { fontSize: 11, color: Brand.textSecondary, marginTop: 8 },
  name: { fontSize: 13, fontWeight: "600", color: Brand.text, marginTop: 2 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: Brand.priceStrikethrough,
    textDecorationLine: "line-through",
  },
  price: { fontSize: 14, fontWeight: "bold", color: Brand.text },
  colors: { fontSize: 11, color: Brand.textSecondary, marginTop: 4 },
});
