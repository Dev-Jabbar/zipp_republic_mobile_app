import { Brand } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthError } from "@/services/authApi";
import { isNonEmpty, isValidEmail } from "@/utils/validation";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthInput from "./ui/AuthInput";

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

// Maps AuthError.code -> friendly message. Falls back to the raw
// error.message for any code not listed here.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
};

const LoginForm = ({ onSuccess, onForgotPassword }: LoginFormProps) => {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!isNonEmpty(email)) errors.email = "Email is required.";
    else if (!isValidEmail(email))
      errors.email = "Enter a valid email address.";
    if (!isNonEmpty(password)) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await signIn(email, password);
    if (success) onSuccess?.();
  };

  const serverErrorMessage =
    error instanceof AuthError
      ? (AUTH_ERROR_MESSAGES[error.code] ?? error.message)
      : error?.message;

  return (
    <View>
      <AuthInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={fieldErrors.email}
      />
      <AuthInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        isPassword
        error={fieldErrors.password}
      />

      {!!serverErrorMessage && (
        <Text style={styles.serverError}>{serverErrorMessage}</Text>
      )}

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Brand.white} />
        ) : (
          <Text style={styles.submitText}>SIGN IN</Text>
        )}
      </TouchableOpacity>

      {/* Forgot password flow is deferred per the checklist — this just
          exposes the hook for wiring up later. */}
      <TouchableOpacity onPress={onForgotPassword} style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot your password?</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  serverError: {
    fontSize: 13,
    color: "#D32F2F",
    marginBottom: 12,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 4,
  },
  submitText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  forgotBtn: { marginTop: 16, alignItems: "center" },
  forgotText: {
    fontSize: 13,
    color: Brand.text,
    textDecorationLine: "underline",
  },
});
