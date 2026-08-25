import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const RootLayoutContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(shop)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </View>
  );
};

const RootLayout = () => {
  return (
    // GestureHandlerRootView MUST be the outermost wrapper (above
    // SafeAreaProvider), or every gesture-handler-based component
    // (this slider, swipeables, native-stack transitions, etc.) will
    // render fine but silently ignore all touches — no error, no
    // warning, gestures just do nothing.
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <RootLayoutContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
