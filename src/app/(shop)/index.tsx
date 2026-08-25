import Footer from "@/components/shop/Footer";
import HeroBanner from "@/components/shop/HeroBanner";
import Marquee from "@/components/shop/Marquee";
import ProductSection from "@/components/shop/ProductSection";
import PromoBanner from "@/components/shop/PromoBanner";
import Testimonial from "@/components/shop/Testimonial";
import Spacer from "@/components/shop/ui/Spacer";
import { useGoToCollection } from "@/hooks/shops/useGoToCollection";
import { ScrollView, StyleSheet } from "react-native";

const ShopIndex = () => {
  const goToCollection = useGoToCollection();

  return (
    <ScrollView style={styles.container}>
      <HeroBanner
        onShopMenPress={() => goToCollection("men")}
        onShopWomenPress={() => goToCollection("women")}
      />
      <Spacer />
      <ProductSection
        title="NEW ARRIVALS"
        isNewArrivals
        subtitle="Explore the newest drops from Zipp Republic"
      />
      <ProductSection
        title="TSHIRTS"
        category="tshirts"
        shopLinkLabel="Shop Tshirts"
      />
      <Marquee />
      <ProductSection
        title="Zipp Republic Slides"
        category="slides"
        subtitle="Shop Our Premium Slides"
        shopLinkLabel="Shop Slides"
        centerContent
        offset={0}
        limit={3}
      />
      <ProductSection category="slides" offset={3} />
      <Spacer size={80} />
      <PromoBanner image={require("@/assets/images/promoBanner.jpg")} />
      <Spacer size={80} />
      <ProductSection
        title="Jackets & Hoodies"
        category="jackets"
        centerContent
      />
      <Spacer size={100} />
      <Testimonial />
      <Spacer size={50} />
      <Footer />
    </ScrollView>
  );
};

export default ShopIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
