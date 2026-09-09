import RegistrationForm from "@/components/auth/RegistrationForm";
import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Href, router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const RegisterScreen = () => {
  const { redirectTo } = useLocalSearchParams<{ redirectTo?: string }>();

  const goToLogin = () =>
    router.replace({
      pathname: "/login",
      params: redirectTo ? { redirectTo } : undefined,
    });

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        goToLogin();
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goToLogin} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Brand.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>Zipp Republic Nigeria</Text>

        <View style={styles.formBlock}>
          <Text style={styles.heading}>Create account</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                router.replace({
                  pathname: "/login",
                  params: redirectTo ? { redirectTo } : undefined,
                })
              }
            >
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <RegistrationForm
            onSuccess={() => router.replace((redirectTo ?? "/") as Href)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Brand.white },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingBottom: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  brand: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    textAlign: "center",
    marginBottom: 60,
  },
  formBlock: { marginTop: 20 },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  switchRow: { flexDirection: "row", marginBottom: 24 },
  switchText: { fontSize: 13, color: Brand.textSecondary },
  switchLink: {
    fontSize: 13,
    color: "#4A6CF7",
    textDecorationLine: "underline",
  },
});
