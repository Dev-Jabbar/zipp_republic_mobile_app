import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DrawerShell from "./DrawerShell";

interface SearchDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (query: string) => void;

  onQueryChange?: (query: string) => void;
  /** Optional list of result rows to render below the input, e.g. product hits. */
  results?: { id: string; label: string }[];
  onResultPress?: (id: string) => void;
  /** True while the parent's search is in flight — shows a small spinner
   * instead of "No results" so a genuinely-empty result isn't confused
   * with a still-loading one. */
  loading?: boolean;
  /** Height of the AnnouncementBar + Header block above this drawer, so the
   * input starts right below it instead of hiding underneath it. */
  topInset?: number;
}

const SearchDrawer = ({
  visible,
  onClose,
  onSubmit,
  onQueryChange,
  results = [],
  onResultPress,
  loading = false,
  topInset = 0,
}: SearchDrawerProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    onQueryChange?.(text);
  };

  const showEmptyState =
    !loading && query.trim() !== "" && results.length === 0;

  return (
    <DrawerShell
      visible={visible}
      onClose={onClose}
      noTopSafeArea
      onShow={() => inputRef.current?.focus()}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={() => onSubmit?.(query)}
          placeholder="Search for anything"
          placeholderTextColor={Brand.text + "80"}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading ? (
          <ActivityIndicator size="small" color={Brand.text} />
        ) : (
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={Brand.text} />
          </TouchableOpacity>
        )}
      </View>

      {showEmptyState ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No products found for &quot;{query.trim()}&quot;.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() => onResultPress?.(item.id)}
            >
              <Ionicons
                name="search-outline"
                size={16}
                color={Brand.text}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.resultLabel}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </DrawerShell>
  );
};

export default SearchDrawer;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    paddingVertical: 4,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  resultLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  emptyState: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
  },
});
