import { Brand } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthError } from "@/services/authApi";
import {
  isNonEmpty,
  isValidEmail,
  isValidPassword,
  MIN_PASSWORD_LENGTH,
  passwordsMatch,
} from "@/utils/validation";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthInput from "./ui/AuthInput";

interface RegistrationFormProps {
  onSuccess?: () => void;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
};

const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!isNonEmpty(name)) errors.name = "Name is required.";
    if (!isNonEmpty(email)) errors.email = "Email is required.";
    else if (!isValidEmail(email))
      errors.email = "Enter a valid email address.";
    if (!isNonEmpty(password)) errors.password = "Password is required.";
    else if (!isValidPassword(password))
      errors.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!passwordsMatch(password, confirmPassword))
      errors.confirmPassword = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const success = await register(name, email, password);
    if (success) onSuccess?.();
  };

  const serverErrorMessage =
    error instanceof AuthError
      ? (AUTH_ERROR_MESSAGES[error.code] ?? error.message)
      : error?.message;

  return (
    <View>
      <AuthInput
        label="Name"
        value={name}
        onChangeText={setName}
        error={fieldErrors.name}
      />
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
      <AuthInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isPassword
        error={fieldErrors.confirmPassword}
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
          <Text style={styles.submitText}>CREATE ACCOUNT</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RegistrationForm;

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
});
