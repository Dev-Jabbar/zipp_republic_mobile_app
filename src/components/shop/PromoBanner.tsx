import { Image, ImageSourcePropType, StyleSheet } from "react-native";

type PromoBannerProps = {
  image: ImageSourcePropType;
};

const PromoBanner = ({ image }: PromoBannerProps) => {
  return <Image source={image} style={styles.image} resizeMode="cover" />;
};

export default PromoBanner;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: undefined,
    aspectRatio: 3,
  },
});
