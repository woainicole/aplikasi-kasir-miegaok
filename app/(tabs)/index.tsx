// Home.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Progress from 'react-native-progress';
import { supabase } from "../../lib/supabase-client";
import { useAuth } from "../../providers/AuthContext";

/* ============================
   COLOR PALETTE & CONSTANTS
   ============================ */
const COLORS = {
  primary: '#B82329',     // Merah Gelap (mangkuk)
  secondary: '#F5A835',   // Orange Cerah (background utama)
  white: '#FFFFFF',       // Putih (mie dan tulisan)
  black: '#000000',       // Hitam (sumpit)
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#3b82f6',
  error: '#ef4444',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

/* ============================
   TYPES
   ============================ */
type Order = {
  id: string;
  order_number: number | null;
  customer_name: string | null;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
};

type TopProduct = {
  id: string;
  name: string;
  qty: number;
  revenue?: number;
};

type DailyRevenue = {
  day: string;
  date: string;
  revenue: number;
  orders: number;
};

type StatCard = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: string;
};

/* ============================
   DASHBOARD SCREEN
   ============================ */
export default function Home() {
  const { session, logout } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Stats
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [ordersToday, setOrdersToday] = useState<number>(0);
  const [revenueToday, setRevenueToday] = useState<number>(0);
  const [availableProducts, setAvailableProducts] = useState<number>(0);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0);

  // Lists
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [statCards, setStatCards] = useState<StatCard[]>([]);

  /* ============================
     HELPER FUNCTIONS
     ============================ */
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}K`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    return `${diffDays}h lalu`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* ============================
     FETCH DASHBOARD DATA
     ============================ */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Total Orders
      const { count: totalOrdersCount } = await supabase
        .from("orders")
        .select("id", { count: "exact" });
      setTotalOrders(totalOrdersCount || 0);

      // Total Revenue & Average Order Value
      const { data: allOrders } = await supabase
        .from("orders")
        .select("total_amount, created_at");

      const totalRev = allOrders?.reduce(
        (acc, order) => acc + Number(order.total_amount),
        0
      ) || 0;
      setTotalRevenue(totalRev);

      const avgValue = allOrders?.length ? totalRev / allOrders.length : 0;
      setAverageOrderValue(avgValue);

      // Today's Orders
      const { count: todayOrdersCount, data: todayOrders } = await supabase
        .from("orders")
        .select("total_amount", { count: "exact" })
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString());

      setOrdersToday(todayOrdersCount || 0);

      // Today's Revenue
      const todayRev = todayOrders?.reduce(
        (acc, order) => acc + Number(order.total_amount),
        0
      ) || 0;
      setRevenueToday(todayRev);

      // Available Products
      const { count: productsCount } = await supabase
        .from("products")
        .select("id", { count: "exact" });
      setAvailableProducts(productsCount || 0);

      // Recent Orders (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: recent } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", weekAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(8);

      setRecentOrders((recent as Order[]) || []);

      // Top Products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select(`
          quantity,
          price,
          products (
            id,
            name
          )
        `)
        .limit(100);

      const productMap = new Map<string, TopProduct>();
      orderItems?.forEach((item: any) => {
        const productId = item.products?.id;
        const productName = item.products?.name || "Unknown";
        const qty = Number(item.quantity) || 0;
        const revenue = (Number(item.price) || 0) * qty;

        if (productId) {
          const existing = productMap.get(productId);
          if (existing) {
            existing.qty += qty;
            existing.revenue = (existing.revenue || 0) + revenue;
          } else {
            productMap.set(productId, {
              id: productId,
              name: productName,
              qty,
              revenue,
            });
          }
        }
      });

      const topProductsList = Array.from(productMap.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);
      setTopProducts(topProductsList);

      // Daily Revenue (last 7 days)
      const dailyData: DailyRevenue[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: dayOrders } = await supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", startOfDay.toISOString())
          .lte("created_at", endOfDay.toISOString());

        const dayRevenue = dayOrders?.reduce(
          (acc, order) => acc + Number(order.total_amount),
          0
        ) || 0;

        dailyData.push({
          day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          revenue: dayRevenue,
          orders: dayOrders?.length || 0,
        });
      }
      setDailyRevenue(dailyData);

      // Update stat cards
      setStatCards([
        {
          id: '1',
          title: 'Total Pendapatan',
          value: formatCurrency(totalRev),
          subtitle: 'Semua waktu',
          icon: '💰',
          color: COLORS.primary,
        },
        {
          id: '2',
          title: 'Pesanan Hari Ini',
          value: todayOrdersCount?.toString() || '0',
          subtitle: `Pendapatan: ${formatCurrency(todayRev)}`,
          icon: '📦',
          color: COLORS.success,
        },
        {
          id: '3',
          title: 'Total Pesanan',
          value: totalOrdersCount?.toString() || '0',
          subtitle: `Rata-rata: ${formatCurrency(avgValue)}`,
          icon: '📊',
          color: COLORS.info,
        },
        {
          id: '4',
          title: 'Produk Tersedia',
          value: productsCount?.toString() || '0',
          subtitle: 'Dalam inventori',
          icon: '🛒',
          color: COLORS.warning,
        },
      ]);

    } catch (err) {
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  /* ============================
     RENDER FUNCTIONS
     ============================ */
  const renderStatCard = (item: StatCard) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      </View>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statTitle}>{item.title}</Text>
      <Text style={styles.statSubtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderOrderItem = ({ item }: { item: Order }) => {
    const orderDate = new Date(item.created_at);
    const timeAgo = getTimeAgo(orderDate);
    const formattedDate = formatDate(item.created_at);

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>
              #{item.order_number?.toString().padStart(4, '0') || 'N/A'}
            </Text>
            <Text style={styles.orderCustomer}>
              {item.customer_name || 'Pelanggan'}
            </Text>
          </View>
          <Text style={styles.orderTimeAgo}>{timeAgo}</Text>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderMeta}>
            <Text style={styles.orderDate}>{formattedDate}</Text>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>
                {item.payment_method || 'Tunai'}
              </Text>
            </View>
          </View>
          <Text style={styles.orderAmount}>
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
      </View>
    );
  };

  const renderProductItem = ({ item, index }: { item: TopProduct; index: number }) => {
    const maxQty = Math.max(...topProducts.map(p => p.qty), 1);
    const progress = item.qty / maxQty;

    return (
      <View style={styles.productCard}>
        <View style={styles.productRank}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productStats}>
            {item.qty} terjual • {formatCurrency(item.revenue || 0)}
          </Text>
        </View>

        <Progress.Circle
          size={40}
          progress={progress}
          color={COLORS.primary}
          thickness={3}
          borderWidth={0}
          unfilledColor={COLORS.gray200}
          showsText
          formatText={() => item.qty.toString()}
          textStyle={styles.progressText}
        />
      </View>
    );
  };

  const renderRevenueChart = () => {
    const maxRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Pendapatan 7 Hari Terakhir</Text>
          <Text style={styles.chartSubtitle}>
            Total: {formatCurrency(dailyRevenue.reduce((sum, day) => sum + day.revenue, 0))}
          </Text>
        </View>

        <View style={styles.chartBars}>
          {dailyRevenue.map((day, index) => (
            <View key={index} style={styles.chartBarContainer}>
              <View style={styles.chartBarWrapper}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max((day.revenue / maxRevenue) * 80, 8)}%`,
                      backgroundColor: day.revenue > 0 ? COLORS.primary : COLORS.gray300,
                    }
                  ]}
                />
              </View>
              <Text style={styles.chartBarLabel}>{day.day}</Text>
              <Text style={styles.chartBarValue}>
                {formatCurrency(day.revenue)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /* ============================
     RENDER STATES
     ============================ */
  if (!session) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Anda belum login</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </View>
    );
  }

  /* ============================
     MAIN RENDER
     ============================ */
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Selamat datang,</Text>
            <Text style={styles.userName}>
              {session.user.email?.split('@')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* STATS GRID 2x2 */}
        <View style={styles.statsGridContainer}>
          <Text style={styles.sectionTitle}>Ringkasan Statistik</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              {renderStatCard(statCards[0])}
              {renderStatCard(statCards[1])}
            </View>
            <View style={styles.statRow}>
              {renderStatCard(statCards[2])}
              {renderStatCard(statCards[3])}
            </View>
          </View>
        </View>

        {/* REVENUE CHART */}
        {renderRevenueChart()}

        {/* RECENT ORDERS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
          </View>
          
          {recentOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Belum ada pesanan</Text>
            </View>
          ) : (
            <FlatList
              data={recentOrders}
              renderItem={renderOrderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* TOP PRODUCTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produk Terlaris</Text>
          </View>
          
          {topProducts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Belum ada data penjualan</Text>
            </View>
          ) : (
            <FlatList
              data={topProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* FOOTER SPACER */}
        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================
   STYLES
   ============================ */
const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  contentContainer: {
    paddingBottom: SPACING['4xl'],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray500,
    fontSize: 14,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Changed to flex-start for better alignment
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 10, // Added more top padding
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    minHeight: 100, // Ensure minimum height for header
  },
  headerContent: {
    flex: 1,
    paddingTop: SPACING.xs, // Add small padding at top
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: SPACING.xs, // Changed to SPACING.xs
  },
  userName: {
    fontSize: 22, // Slightly larger for better visibility
    fontWeight: '700',
    color: COLORS.gray700,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginTop: SPACING.xs, // Align with welcome text
  },
  logoutText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Stats Grid 2x2
  statsGridContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  statsGrid: {
    marginTop: SPACING.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.gray500,
  },

  // Section
  section: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Chart
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl, // Increased margin
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: SPACING.xl,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarWrapper: {
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  chartBar: {
    width: 20,
    borderRadius: 6,
    minHeight: 8,
  },
  chartBarLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  chartBarValue: {
    fontSize: 9,
    color: COLORS.gray700,
    marginTop: 4,
    textAlign: 'center',
  },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: 4,
  },
  orderCustomer: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  orderTimeAgo: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2, // Align with order number
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  orderDate: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  paymentBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 11,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // Product Card
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 2,
  },
  productStats: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray700,
  },

  // Empty State
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING['3xl'],
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
  },

  // Separator
  separator: {
    height: SPACING.sm,
  },

  // Footer Spacer
  footerSpacer: {
    height: SPACING['3xl'],
  },

  // Error Text
  errorText: {
    fontSize: 16,
    color: COLORS.gray500,
  },
});