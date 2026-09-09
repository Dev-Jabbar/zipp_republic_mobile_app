import { Brand } from "@/constants/theme";
import { ScrollView, StyleSheet, View } from "react-native";

const ProductDetailSkeleton = () => (
  <ScrollView style={styles.container} scrollEnabled={false}>
    {/* Breadcrumb */}
    <View style={styles.breadcrumb}>
      <View style={styles.breadcrumbLine} />
    </View>

    {/* Image */}
    <View style={styles.imageBlock} />

    {/* Info block */}
    <View style={styles.infoBlock}>
      <View style={styles.lineBrand} />
      <View style={styles.lineName} />
      <View style={styles.linePrice} />
      <View style={styles.lineShipping} />

      {/* Size selector row */}
      <View style={styles.sizeRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.sizeBox} />
        ))}
      </View>

      {/* Add to cart row */}
      <View style={styles.actionsRow}>
        <View style={styles.qtyBox} />
        <View style={styles.addToCartBox} />
      </View>

      {/* Buy it now */}
      <View style={styles.buyNowBox} />
    </View>
  </ScrollView>
);

export default ProductDetailSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  breadcrumb: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  breadcrumbLine: {
    height: 12,
    width: "50%",
    backgroundColor: Brand.border,
    borderRadius: 2,
  },
  imageBlock: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: Brand.border,
  },
  infoBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lineBrand: {
    height: 10,
    width: "30%",
    backgroundColor: Brand.border,
    borderRadius: 2,
  },
  lineName: {
    height: 20,
    width: "70%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 10,
  },
  linePrice: {
    height: 16,
    width: "35%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 12,
  },
  lineShipping: {
    height: 10,
    width: "45%",
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 10,
  },
  sizeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  sizeBox: {
    width: 44,
    height: 40,
    backgroundColor: Brand.border,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  qtyBox: {
    width: 120,
    height: 48,
    backgroundColor: Brand.border,
    borderRadius: 2,
  },
  addToCartBox: {
    flex: 1,
    height: 48,
    backgroundColor: Brand.border,
    borderRadius: 2,
  },
  buyNowBox: {
    height: 52,
    backgroundColor: Brand.border,
    borderRadius: 2,
    marginTop: 12,
  },
});
