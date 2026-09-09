import AccountTabs from "@/components/shop/ui/AccountTabs";
import { Brand } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useAddresses } from "@/hooks/shops/useAddresses";
import { useMarketingPreference } from "@/hooks/shops/useMarketingPreference";
import { updateDisplayName } from "@/services/profileApi";
import { useAuthStore } from "@/store/useAuthStore";
import { Address } from "@/types/profile";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const EMPTY_ADDRESS_FORM: AddressForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

const AddressCard = ({
  addr,
  onDelete,
}: {
  addr: Address;
  onDelete: () => void;
}) => {
  const confirmDelete = () => {
    Alert.alert(
      "Delete address?",
      `Remove "${addr.fullName}, ${addr.address}" from your saved addresses? This can't be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ],
    );
  };

  return (
    <View style={styles.addressCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.addressName}>{addr.fullName}</Text>
        <Text style={styles.addressLine}>
          {addr.address}, {addr.city}, {addr.state}
        </Text>
        <Text style={styles.addressLine}>{addr.phone}</Text>
      </View>
      <TouchableOpacity onPress={confirmDelete} hitSlop={10}>
        <Text style={styles.deleteLink}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const ProfileScreen = () => {
  const { isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const {
    addresses,
    loading: addressesLoading,
    addAddress,
    deleteAddress,
  } = useAddresses();
  const { value: marketingEmail, toggle: toggleMarketing } =
    useMarketingPreference();

  const [localName, setLocalName] = useState(user?.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(localName);
  const [savingName, setSavingName] = useState(false);

  const startEditingName = () => {
    setNameDraft(localName);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      await updateDisplayName(trimmed);
      setLocalName(trimmed);
      setEditingName(false);
    } catch (err) {
      console.error("updateDisplayName failed:", err);
    } finally {
      setSavingName(false);
    }
  };

  // ── Address form ──────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] =
    useState<AddressForm>(EMPTY_ADDRESS_FORM);
  const [savingAddress, setSavingAddress] = useState(false);

  const updateAddressField = (key: keyof AddressForm, value: string) =>
    setAddressForm((f) => ({ ...f, [key]: value }));

  const isAddressFormValid =
    addressForm.fullName.trim() &&
    addressForm.phone.trim() &&
    addressForm.address.trim() &&
    addressForm.city.trim() &&
    addressForm.state.trim();

  const handleAddAddress = async () => {
    if (!isAddressFormValid) return;
    setSavingAddress(true);
    try {
      await addAddress(addressForm);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setShowAddForm(false);
    } catch (err) {
      console.error("addAddress failed:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Zipp Republic Nigeria</Text>
      </View>

      <AccountTabs active="profile" />

      <ScrollView contentContainerStyle={styles.content}>
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              placeholder="Your name"
              placeholderTextColor={Brand.textSecondary}
            />
            <TouchableOpacity
              style={styles.editBtn}
              onPress={saveName}
              disabled={savingName || !nameDraft.trim()}
            >
              {savingName ? (
                <ActivityIndicator size="small" color={Brand.text} />
              ) : (
                <Text style={styles.editText}>Save</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setEditingName(false)}
              disabled={savingName}
            >
              <Text style={styles.editText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileRow}>
            <Text style={styles.profileName}>{localName}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={startEditingName}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>Email</Text>
          <Text style={styles.fieldValue}>{user?.email}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          {!showAddForm && (
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.addLink}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {addressesLoading ? (
          <View style={styles.addressBox}>
            <ActivityIndicator size="small" color={Brand.text} />
          </View>
        ) : addresses.length === 0 && !showAddForm ? (
          <View style={styles.addressBox}>
            <Text style={styles.addressEmpty}>No addresses added</Text>
            <TouchableOpacity onPress={() => setShowAddForm(true)}>
              <Text style={styles.addLink}>Add</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onDelete={() => deleteAddress(addr.id)}
            />
          ))
        )}

        {showAddForm && (
          <View style={styles.formCard}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={Brand.textSecondary}
              value={addressForm.fullName}
              onChangeText={(v) => updateAddressField("fullName", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={Brand.textSecondary}
              keyboardType="phone-pad"
              value={addressForm.phone}
              onChangeText={(v) => updateAddressField("phone", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={Brand.textSecondary}
              value={addressForm.address}
              onChangeText={(v) => updateAddressField("address", v)}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="City"
                placeholderTextColor={Brand.textSecondary}
                value={addressForm.city}
                onChangeText={(v) => updateAddressField("city", v)}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="State"
                placeholderTextColor={Brand.textSecondary}
                value={addressForm.state}
                onChangeText={(v) => updateAddressField("state", v)}
              />
            </View>
            <View style={styles.formActionsRow}>
              <TouchableOpacity
                style={styles.formCancelBtn}
                onPress={() => {
                  setShowAddForm(false);
                  setAddressForm(EMPTY_ADDRESS_FORM);
                }}
                disabled={savingAddress}
              >
                <Text style={styles.formCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.formSaveBtn,
                  (!isAddressFormValid || savingAddress) &&
                    styles.formSaveBtnDisabled,
                ]}
                onPress={handleAddAddress}
                disabled={!isAddressFormValid || savingAddress}
              >
                {savingAddress ? (
                  <ActivityIndicator size="small" color={Brand.white} />
                ) : (
                  <Text style={styles.formSaveText}>Save address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Marketing preferences</Text>
        <View style={styles.marketingRow}>
          <Text style={styles.marketingLabel}>Email</Text>
          <Switch value={marketingEmail} onValueChange={toggleMarketing} />
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={styles.signOutAllBtn}>
          <Text style={styles.signOutAllText}>Sign out of all devices</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  content: {
    padding: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: Brand.text,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 12,
    color: Brand.text,
  },
  fieldBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  fieldValue: {
    fontSize: 13,
    color: Brand.text,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 8,
    marginTop: 4,
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  addressEmpty: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  addLink: {
    fontSize: 13,
    color: "#4A6CF7",
    fontWeight: "700",
  },
  addressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  addressName: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  deleteLink: {
    fontSize: 12,
    color: "#D14343",
    fontWeight: "600",
  },
  formCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Brand.text,
    marginBottom: 10,
  },
  inputRow: { flexDirection: "row", gap: 10 },
  inputHalf: { flex: 1 },
  formActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  formCancelBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  formCancelText: { fontSize: 13, color: Brand.textSecondary },
  formSaveBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  formSaveBtnDisabled: { opacity: 0.5 },
  formSaveText: { fontSize: 13, fontWeight: "700", color: Brand.white },
  marketingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  marketingLabel: {
    fontSize: 13,
    color: Brand.text,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
  },
  signOutText: {
    fontSize: 13,
    color: "#4A6CF7",
    fontWeight: "700",
  },
  signOutAllBtn: {
    alignItems: "center",
  },
  signOutAllText: {
    fontSize: 12,
    color: "#4A6CF7",
    textDecorationLine: "underline",
  },
});
