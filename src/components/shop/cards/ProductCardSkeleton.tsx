import { Brand } from "@/constants/theme";
import { getCardVariant } from "@/utils/product";
import { StyleSheet, View } from "react-native";

interface ProductCardSkeletonProps {
  category?: string;
  fullWidth?: boolean;
}

/** Mirrors ProductCard's sizing so the grid/carousel doesn't shift once real data arrives. */
const ProductCardSkeleton = ({
  category = "",
  fullWidth = false,
}: ProductCardSkeletonProps) => {
  const isLandscape = getCardVariant(category) === "landscape";

  return (
    <View
      style={[styles.card, !fullWidth && { width: isLandscape ? 300 : 230 }]}
    >
      <View
        style={[
          styles.imageBlock,
          fullWidth
            ? { width: "100%", aspectRatio: 1 }
            : {
                width: isLandscape ? 300 : 230,
                height: isLandscape ? 300 : 300,
              },
        ]}
      />
      <View style={styles.lineShort} />
      <View style={styles.lineLong} />
      <View style={styles.linePrice} />
    </View>
  );
};

export default ProductCardSkeleton;

const styles = StyleSheet.create({
  card: { marginRight: 0 },
  imageBlock: {
    borderRadius: 4,
    backgroundColor: Brand.border,
  },
  lineShort: {
    height: 10,
    width: "40%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 8,
  },
  lineLong: {
    height: 12,
    width: "80%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 6,
  },
  linePrice: {
    height: 12,
    width: "30%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 6,
  },
});
