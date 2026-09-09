import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface AuthInputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

const AuthInput = ({ label, error, isPassword, ...rest }: AuthInputProps) => {
  const [hidden, setHidden] = useState(!!isPassword);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <TextInput
          {...rest}
          secureTextEntry={isPassword ? hidden : rest.secureTextEntry}
          style={styles.input}
          placeholderTextColor={Brand.textSecondary}
          autoCapitalize={isPassword ? "none" : rest.autoCapitalize}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={Brand.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default AuthInput;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 12, color: Brand.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    paddingHorizontal: 14,
    height: 50,
  },
  inputRowError: { borderColor: "#D32F2F" },
  input: { flex: 1, fontSize: 14, color: Brand.text },
  error: { fontSize: 12, color: "#D32F2F", marginTop: 4 },
});
