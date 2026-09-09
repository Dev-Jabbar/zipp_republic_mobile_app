import { Brand } from "@/constants/theme";
import { useCartStore } from "@/store/useCartStore";
import { formatNaira } from "@/utils/currency";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DrawerShell from "./DrawerShell";

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
  onStartShopping?: () => void;
  onCheckout?: () => void;
  /** Height of the AnnouncementBar + Header block above this drawer, so the
   * CART title starts right below it instead of hiding underneath it. */
  topInset?: number;
}

const CartDrawer = ({
  visible,
  onClose,
  onStartShopping,
  onCheckout,
  topInset = 0,
}: CartDrawerProps) => {
  const items = useCartStore((s) => s.items);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const removeItem = useCartStore((s) => s.removeItem);

  const isEmpty = items.length === 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    // swipeToClose disabled — this drawer's main content is a scrollable
    // item list. react-native-modal's swipe gesture recognizer has to
    // evaluate every touch (even a plain vertical scroll) to check if
    // it's a horizontal swipe-to-close, which was causing a perceptible
    // lag at the start of each scroll gesture. The X button + backdrop
    // tap still close it fine without that competing recognizer.
    <DrawerShell
      visible={visible}
      onClose={onClose}
      noTopSafeArea
      swipeToClose={false}
    >
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>CART</Text>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Ionicons name="close" size={24} color={Brand.text} />
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Ionicons name="cart-outline" size={64} color={Brand.text} />
            <View style={styles.emptyBadge}>
              <Ionicons name="close" size={13} color={Brand.white} />
            </View>
          </View>
          <Text style={styles.emptyText}>Your cart is currently empty.</Text>
          <TouchableOpacity
            style={styles.startShoppingBtn}
            onPress={() => {
              onClose();
              onStartShopping?.();
            }}
          >
            <Text style={styles.startShoppingText}>START SHOPPING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.itemsList}
            contentContainerStyle={styles.itemsListContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View
                key={`${item.id}-${item.size ?? ""}-${item.color ?? ""}`}
                style={styles.itemRow}
              >
                {/* item.image is typed `any` on CartItem, so it could
                    arrive as a string URL, a { uri } object, undefined,
                    or something malformed — normalize/guard here instead
                    of trusting it, since a bad shape here was crashing
                    the whole drawer. */}
                {(() => {
                  const source =
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image;
                  const hasValidSource =
                    source && (source.uri || typeof source === "number");

                  return hasValidSource ? (
                    <Image source={source} style={styles.itemImage} />
                  ) : (
                    <View style={styles.itemImagePlaceholder} />
                  );
                })()}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {!!(item.size || item.color) && (
                    <Text style={styles.itemMeta}>
                      {[item.color, item.size].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {formatNaira(item.price)}
                  </Text>

                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        decrementItem(item.id, item.size, item.color)
                      }
                      hitSlop={8}
                    >
                      <Ionicons name="remove" size={14} color={Brand.text} />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        incrementItem(item.id, item.size, item.color)
                      }
                      hitSlop={8}
                    >
                      <Ionicons name="add" size={14} color={Brand.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => removeItem(item.id, item.size, item.color)}
                  hitSlop={10}
                >
                  <Ionicons name="trash-outline" size={18} color={Brand.text} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Subtotal</Text>
              <Text style={styles.subtotalValue}>{formatNaira(subtotal)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
              <Text style={styles.checkoutText}>CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </DrawerShell>
  );
};

export default CartDrawer;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Brand.text,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    marginBottom: 20,
  },
  emptyBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Brand.black,
    borderWidth: 2,
    borderColor: Brand.white,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Brand.text,
    marginBottom: 24,
    textAlign: "center",
  },
  startShoppingBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 4,
  },
  startShoppingText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  itemImage: {
    width: 72,
    height: 88,
    borderRadius: 4,
    backgroundColor: Brand.border,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 72,
    height: 88,
    borderRadius: 4,
    backgroundColor: "#EEEEEE",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: Brand.text,
    opacity: 0.5,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.text,
    minWidth: 18,
    textAlign: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  subtotalLabel: {
    fontSize: 13,
    color: Brand.text,
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
  },
  checkoutBtn: {
    backgroundColor: Brand.black,
    paddingVertical: 15,
    borderRadius: 4,
    alignItems: "center",
  },
  checkoutText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
