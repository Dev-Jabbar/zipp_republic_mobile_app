import { Brand } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useAddresses } from "@/hooks/shops/useAddresses";
import { createOrder } from "@/services/ordersApi";
import { useCartStore } from "@/store/useCartStore";
import { PaymentMethod, ShippingAddress } from "@/types/order";
import { formatNaira } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
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

const EMPTY_ADDRESS: AddressForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
};

// Static demo labels — there's no real payment processor wired up on the
// Spark plan yet, so this is purely for the order summary/history to
// show something meaningful under "Payment". Never store real card data.
const PAYMENT_OPTIONS: { method: PaymentMethod; label: string }[] = [
  { method: "card", label: "Card payment (demo)" },
  { method: "bank_transfer", label: "Bank transfer (demo)" },
  { method: "cash_on_delivery", label: "Cash on delivery" },
];

const CheckoutScreen = () => {
  const { isAuthenticated } = useRequireAuth();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const { addresses, loading: addressesLoading } = useAddresses();

  const [form, setForm] = useState<AddressForm>(EMPTY_ADDRESS);
  // null = "not decided yet" (still waiting on addresses to load), a
  // real Address id = that saved address is selected, "new" = the
  // manual form below is in use. Defaults to the first saved address
  // once addresses finish loading, or "new" if there are none — see
  // the effect below, which only runs the default-pick once so it
  // doesn't fight with the user's own later selection.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (addressesLoading || selectedAddressId !== null) return;
    setSelectedAddressId(addresses.length > 0 ? addresses[0].id : "new");
  }, [addressesLoading, addresses, selectedAddressId]);

  // Avoid flashing real content before useRequireAuth's redirect effect
  // fires — same pattern as orders.tsx/profile.tsx.
  if (!isAuthenticated) return null;

  const usingSavedAddress =
    selectedAddressId !== null && selectedAddressId !== "new";

  const isFormValid =
    (usingSavedAddress ||
      (form.fullName.trim() &&
        form.phone.trim() &&
        form.address.trim() &&
        form.city.trim() &&
        form.state.trim())) &&
    paymentMethod !== null;

  const updateField = (key: keyof AddressForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePlaceOrder = async () => {
    if (!isFormValid || !paymentMethod) return;

    let shippingAddress: ShippingAddress;
    if (usingSavedAddress) {
      const saved = addresses.find((a) => a.id === selectedAddressId);
      if (!saved) return; // shouldn't happen — selection came from this same list
      shippingAddress = {
        fullName: saved.fullName,
        phone: saved.phone,
        address: saved.address,
        city: saved.city,
        state: saved.state,
      };
    } else {
      shippingAddress = form;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payment = PAYMENT_OPTIONS.find((p) => p.method === paymentMethod)!;
      const orderId = await createOrder(
        items,
        subtotal,
        shippingAddress,
        payment,
      );
      clearCart();
      setPlacedOrderId(orderId);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong placing your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ─────────────────────────────────────────────
  // Shown in place of the form once an order's been placed, rather than
  // navigating away — keeps this a single screen/file, no new route.
  if (placedOrderId) {
    // Short, readable confirmation code — last 6 chars of the Firestore
    // doc ID, uppercased. Not a separate stored field, just a display
    // convenience derived from the real order id.
    const shortCode = placedOrderId.slice(-6).toUpperCase();

    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconWrapper}>
          <Ionicons name="checkmark-circle" size={72} color={Brand.text} />
        </View>
        <Text style={styles.successTitle}>Order placed!</Text>
        <Text style={styles.successSubtitle}>
          Thanks for shopping with us. Your order confirmation is:
        </Text>
        <Text style={styles.successCode}>#{shortCode}</Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/orders" as Href)}
        >
          <Text style={styles.primaryBtnText}>VIEW MY ORDERS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/" as Href)}
        >
          <Text style={styles.secondaryBtnText}>CONTINUE SHOPPING</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Empty cart state ──────────────────────────────────────────
  // Checkout can be reached directly (deep link, back button after a
  // completed order, etc), not just via the cart drawer's button — guard
  // against building an order out of nothing.
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/" as Href)}
        >
          <Text style={styles.primaryBtnText}>START SHOPPING</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Form state ────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Checkout</Text>

      {/* Order summary */}
      <Text style={styles.sectionTitle}>Order Summary</Text>
      <View style={styles.summaryCard}>
        {items.map((item) => (
          <View
            key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}`}
            style={styles.summaryRow}
          >
            <Text style={styles.summaryItemName} numberOfLines={1}>
              {item.name}
              {item.quantity > 1 ? ` ×${item.quantity}` : ""}
            </Text>
            <Text style={styles.summaryItemPrice}>
              {formatNaira(item.price * item.quantity)}
            </Text>
          </View>
        ))}
        <View style={[styles.summaryRow, styles.summaryTotalRow]}>
          <Text style={styles.summaryTotalLabel}>Subtotal</Text>
          <Text style={styles.summaryTotalValue}>{formatNaira(subtotal)}</Text>
        </View>
      </View>

      {/* Shipping address */}
      <Text style={styles.sectionTitle}>Shipping Address</Text>
      <View style={styles.formCard}>
        {addressesLoading ? (
          <ActivityIndicator size="small" color={Brand.text} />
        ) : (
          <>
            {addresses.map((addr) => {
              const selected = selectedAddressId === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={styles.addressOption}
                  onPress={() => setSelectedAddressId(addr.id)}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressOptionName}>
                      {addr.fullName}
                    </Text>
                    <Text style={styles.addressOptionLine}>
                      {addr.address}, {addr.city}, {addr.state}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.addressOption}
              onPress={() => setSelectedAddressId("new")}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedAddressId === "new" && styles.radioOuterSelected,
                ]}
              >
                {selectedAddressId === "new" && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.addressOptionName}>Enter a new address</Text>
            </TouchableOpacity>
          </>
        )}

        {selectedAddressId === "new" && (
          <View style={styles.manualAddressForm}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={Brand.textSecondary}
              value={form.fullName}
              onChangeText={(v) => updateField("fullName", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={Brand.textSecondary}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(v) => updateField("phone", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor={Brand.textSecondary}
              value={form.address}
              onChangeText={(v) => updateField("address", v)}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="City"
                placeholderTextColor={Brand.textSecondary}
                value={form.city}
                onChangeText={(v) => updateField("city", v)}
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="State"
                placeholderTextColor={Brand.textSecondary}
                value={form.state}
                onChangeText={(v) => updateField("state", v)}
              />
            </View>
          </View>
        )}
      </View>

      {/* Payment method */}
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.formCard}>
        {PAYMENT_OPTIONS.map((option) => {
          const selected = paymentMethod === option.method;
          return (
            <TouchableOpacity
              key={option.method}
              style={styles.paymentRow}
              onPress={() => setPaymentMethod(option.method)}
            >
              <View
                style={[
                  styles.radioOuter,
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.paymentLabel}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
        <Text style={styles.paymentDisclaimer}>
          Demo mode — no real payment is processed.
        </Text>
      </View>

      {submitError && <Text style={styles.errorText}>{submitError}</Text>}

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          (!isFormValid || submitting) && styles.primaryBtnDisabled,
        ]}
        disabled={!isFormValid || submitting}
        onPress={handlePlaceOrder}
      >
        {submitting ? (
          <ActivityIndicator color={Brand.white} />
        ) : (
          <Text style={styles.primaryBtnText}>PLACE ORDER</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.white },
  content: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Brand.text,
    marginBottom: 8,
    marginTop: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryItemName: { fontSize: 13, color: Brand.text, flex: 1, marginRight: 8 },
  summaryItemPrice: { fontSize: 13, color: Brand.text, fontWeight: "600" },
  summaryTotalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    marginBottom: 0,
  },
  summaryTotalLabel: { fontSize: 14, fontWeight: "700", color: Brand.text },
  summaryTotalValue: { fontSize: 15, fontWeight: "700", color: Brand.text },
  formCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 14,
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
  addressOption: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  addressOptionName: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
    marginTop: 1,
  },
  addressOptionLine: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  manualAddressForm: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Brand.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioOuterSelected: { borderColor: Brand.text },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Brand.text,
  },
  paymentLabel: { fontSize: 13, color: Brand.text },
  paymentDisclaimer: {
    fontSize: 11,
    color: Brand.textSecondary,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#D14343",
    marginTop: 16,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 24,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  secondaryBtn: { paddingVertical: 14, alignItems: "center" },
  secondaryBtnText: {
    color: Brand.text,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: Brand.white,
  },
  successIconWrapper: { marginBottom: 16 },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  successCode: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.text,
    letterSpacing: 1,
    marginBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.white,
    paddingHorizontal: 32,
  },
  emptyText: { fontSize: 14, color: Brand.textSecondary, marginBottom: 20 },
});
