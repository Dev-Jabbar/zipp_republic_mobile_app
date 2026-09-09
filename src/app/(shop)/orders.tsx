import AccountTabs from "@/components/shop/ui/AccountTabs";
import AsyncBoundary from "@/components/shop/ui/AsyncBoundary";
import { Brand } from "@/constants/theme";
import { useRequireAuth } from "@/hooks/auth/useRequireAuth";
import { useOrders } from "@/hooks/shops/useOrders";
import { useAuthStore } from "@/store/useAuthStore";
import { Order, OrderStatus } from "@/types/order";
import { formatNaira } from "@/utils/currency";
import { Href, router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Same status set as OrderStatus in types/order.ts — kept as a small
// local lookup rather than importing colors from Brand, since these are
// semantic status colors, not brand colors, and don't need to track
// theme changes elsewhere.
const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  processing: { bg: "#FFF4E5", text: "#B76E00" },
  shipped: { bg: "#E5F0FF", text: "#1958B8" },
  delivered: { bg: "#E6F7ED", text: "#1F8A4C" },
  cancelled: { bg: "#FBEAEA", text: "#C23A3A" },
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const OrderCard = ({ order }: { order: Order }) => {
  const statusStyle = STATUS_STYLES[order.status];
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardHeader}>
        <Text style={styles.orderCode}>
          #{order.id.slice(-6).toUpperCase()}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.orderMeta}>
        {formatDate(order.createdAt)} · {itemCount} item
        {itemCount > 1 ? "s" : ""}
      </Text>

      {order.items.slice(0, 3).map((item, i) => (
        <Text
          key={`${item.id}-${i}`}
          style={styles.orderItemLine}
          numberOfLines={1}
        >
          {item.name}
          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
        </Text>
      ))}
      {order.items.length > 3 && (
        <Text style={styles.orderItemLine}>
          +{order.items.length - 3} more item
          {order.items.length - 3 > 1 ? "s" : ""}
        </Text>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotalLabel}>Total</Text>
        <Text style={styles.orderTotalValue}>
          {formatNaira(order.subtotal)}
        </Text>
      </View>
    </View>
  );
};

const OrdersScreen = () => {
  const { isAuthenticated } = useRequireAuth();
  const user = useAuthStore((s) => s.user);
  const { orders, loading, error } = useOrders();

  // Avoid flashing real content before the redirect in useRequireAuth
  // actually fires — it runs in a useEffect, which is always one render
  // behind the initial render.
  if (!isAuthenticated) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Zipp Republic Nigeria</Text>
      </View>

      <AccountTabs active="orders" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextBlock}>
            <Text style={styles.welcomeTitle}>
              Welcome, {(user?.name || "there").toUpperCase()}
            </Text>
            <Text style={styles.welcomeSubtitle}>Ready to shop?</Text>
          </View>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => router.push("/" as Href)}
          >
            <Text style={styles.shopNowText}>Shop now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Order History</Text>

        <AsyncBoundary
          loading={loading}
          error={error}
          skeleton={
            <View style={styles.skeletonCard}>
              <Text style={styles.emptyText}>Loading your orders…</Text>
            </View>
          }
        >
          {orders.length === 0 ? (
            <View style={styles.emptyOrdersCard}>
              <Text style={styles.emptyText}>
                You haven&apos;t placed any orders yet.
              </Text>
            </View>
          ) : (
            orders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </AsyncBoundary>
      </ScrollView>
    </View>
  );
};

export default OrdersScreen;

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
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 16,
  },
  welcomeTextBlock: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  shopNowBtn: {
    backgroundColor: "#4A6CF7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  shopNowText: {
    color: Brand.white,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Brand.text,
    marginTop: 24,
    marginBottom: 10,
  },
  emptyOrdersCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  skeletonCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  orderCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderCode: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
    letterSpacing: 0.5,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  orderMeta: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 8,
  },
  orderItemLine: {
    fontSize: 12,
    color: Brand.text,
    opacity: 0.75,
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  orderTotalLabel: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  orderTotalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
  },
});
