// Destination: src/components/shop/drawers/DrawerShell.tsx

import { Brand } from "@/constants/theme";
import { ReactNode } from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RNModal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DrawerShellProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** 'right' = side panel sliding in from the right (cart, search). 'up' = full-screen panel sliding up from the bottom (main menu). Defaults to 'right'. */
  direction?: "right" | "up";
  /** Only used for direction="right". Fraction of screen width, or fixed px. Defaults to 86% capped at 420. */
  width?: number;
  /** Skip the automatic safe-area top padding — use when this panel sits underneath a persistent header that already handles its own inset. */
  noTopSafeArea?: boolean;
  /** Fires once the entrance animation has actually finished — use this instead of a guessed setTimeout for things like autofocusing an input. */
  onShow?: () => void;
  /**
   * Whether swipe-to-close is enabled. Defaults to true. Set false for
   * panels with meaningful vertical scroll content (e.g. CartDrawer) —
   * react-native-modal's swipe gesture recognizer has to evaluate every
   * touch to decide if it's a horizontal swipe-to-close BEFORE handing
   * control to an inner ScrollView, even with propagateSwipe on. That
   * evaluation is a real, perceptible delay at the start of every scroll
   * gesture. Turning swipe off entirely removes the competing
   * recognizer, so scrolling has nothing to arbitrate against. The X
   * button + backdrop tap still close the drawer either way.
   */
  swipeToClose?: boolean;
}

const DrawerShell = ({
  visible,
  onClose,
  children,
  direction = "right",
  width,
  noTopSafeArea = false,
  onShow,
  swipeToClose = true,
}: DrawerShellProps) => {
  const insets = useSafeAreaInsets();
  const isUp = direction === "up";
  const panelWidth = width ?? Math.min(SCREEN_WIDTH * 0.86, 420);

  // Built as an explicitly-typed ViewStyle object rather than an inline
  // style array. Plain object literals like `{ paddingTop: n }` are
  // structurally ambiguous to TS (they satisfy ViewStyle, TextStyle, AND
  // ImageStyle at once), so inside a `StyleProp<ViewStyle>` array they
  // can get widened to a union that no longer matches what the `style`
  // prop expects. Annotating as ViewStyle up front avoids that.
  const panelStyle: ViewStyle = {
    ...styles.panel,
    ...(isUp
      ? { width: "100%", height: "100%" }
      : { width: panelWidth, height: "100%" }),
    ...(!noTopSafeArea ? { paddingTop: insets.top } : null),
  };

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={swipeToClose ? onClose : undefined}
      onModalShow={onShow}
      swipeDirection={swipeToClose ? (isUp ? "down" : "right") : undefined}
      propagateSwipe
      animationIn={isUp ? "slideInUp" : "slideInRight"}
      animationOut={isUp ? "slideOutDown" : "slideOutRight"}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      coverScreen={false}
      backdropOpacity={0.4}
      style={isUp ? styles.modalUpCombined : styles.modal}
    >
      {/*
        react-native-modal (and RN's own Modal underneath it) renders this
        content into a SEPARATE native root view, outside the app's main
        view tree. The GestureHandlerRootView wrapping app/_layout.tsx
        never reaches in here — so any gesture-handler-based component
        (like PriceRangeSlider) inside a drawer silently gets no gestures
        at all unless we give it its own root here.
      */}
      <GestureHandlerRootView
        style={isUp ? styles.gestureRootUp : styles.gestureRootRight}
      >
        <View style={panelStyle}>{children}</View>
      </GestureHandlerRootView>
    </RNModal>
  );
};

export default DrawerShell;

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  modalUpCombined: {
    margin: 0,
    justifyContent: "flex-end",
    flexDirection: "column",
  },

  gestureRootRight: {
    alignSelf: "flex-end",
    // BUG FIX: this had no height/flex at all, so its child (panelStyle,
    // height: "100%") was 100% of an undefined-height parent. React
    // Native's flexbox then sizes the whole tree to fit its CONTENT
    // instead of clipping it to the screen — which is why the inner
    // ScrollView (in CartDrawer etc) worked fine with few items but
    // silently stopped scrolling/clipping once content grew past the
    // visible screen height. gestureRootUp already had this right
    // (flex: 1) — this brings the "right" variant in line with it.
    height: "100%",
  },
  gestureRootUp: {
    alignSelf: "stretch",
    flex: 1,
  },
  panel: {
    backgroundColor: Brand.white,
  },
});
