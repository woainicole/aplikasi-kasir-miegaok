import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase-client";
import { useAuth } from "../../../providers/AuthContext";

// Icons
import {
  CreditCard,
  Filter,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  ShoppingCart,
  Tag,
  Trash2,
  Wallet,
  X
} from "lucide-react-native";
import { styles } from "./_styles";

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

// ---------- Types ----------
type Product = {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  is_available?: boolean;
  created_at?: string;
};

type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  note?: string | null;
  created_at?: string;
  product_name?: string | null;
};

type Cart = {
  id: string;
  user_id?: string | null;
  customer_name?: string | null;
  created_at?: string;
};

// ---------- Helpers ----------
const showToast = (msg: string) => {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert("Info", msg);
  }
};

const formatRupiah = (n: number) =>
  `Rp ${n.toLocaleString("id-ID", { minimumFractionDigits: 0 })}`;

// Payment Methods
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Tunai', icon: Wallet, color: '#10B981' },
  { id: 'qris', label: 'QRIS', icon: QrCode, color: '#3B82F6' },
  { id: 'transfer', label: 'Transfer', icon: CreditCard, color: '#8B5CF6' },
  { id: 'debit', label: 'Kartu Debit', icon: CreditCard, color: '#EF4444' },
];

// Generate customer code
let customerCounter = 0;
const generateCustomerCode = () => {
  customerCounter++;
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `CUST${day}${month}${hour}${minute}${String(customerCounter).padStart(3, '0')}`;
};

// ---------- Component ----------
export default function PoSPage() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodRefreshing, setProdRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [showFilter, setShowFilter] = useState(true);
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartRefreshing, setCartRefreshing] = useState(false);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [customerNameInput, setCustomerNameInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');

  // Fetch products and extract unique categories
  const fetchProducts = useCallback(async () => {
    setProdLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("fetchProducts error", error);
        showToast("Gagal mengambil daftar produk");
        setProducts([]);
        setCategories([]);
      } else {
        const productData = data as Product[] ?? [];
        setProducts(productData);
        
        // Extract unique categories from products
        const uniqueCategories = Array.from(
          new Set(
            productData
              .filter(p => p.category)
              .map(p => p.category as string)
          )
        ).sort();
        
        setCategories(uniqueCategories);
      }
    } catch (e) {
      console.error(e);
      setProducts([]);
      setCategories([]);
      showToast("Terjadi kesalahan saat ambil produk");
    } finally {
      setProdLoading(false);
    }
  }, []);

  const refreshProducts = useCallback(async () => {
    setProdRefreshing(true);
    await fetchProducts();
    setProdRefreshing(false);
  }, [fetchProducts]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCart(null);
      setCartItems([]);
      setCartLoading(false);
      return;
    }

    setCartLoading(true);
    try {
      const { data: carts, error: cartErr } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (cartErr) {
        console.error("fetchCart error:", cartErr);
        showToast("Gagal ambil keranjang");
        setCart(null);
        setCartItems([]);
        setCartLoading(false);
        return;
      }

      let myCart: Cart | null = carts && carts.length ? (carts[0] as Cart) : null;

      if (!myCart) {
        const { data: inserted, error: insertErr } = await supabase
          .from("cart")
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertErr) {
          console.error("create cart error", insertErr);
          showToast("Gagal membuat keranjang");
          setCart(null);
          setCartItems([]);
          setCartLoading(false);
          return;
        }
        myCart = inserted as Cart;
      }

      setCart(myCart);

      const { data: items, error: itemsErr } = await supabase
        .from("cart_items")
        .select("*, products(name)")
        .eq("cart_id", myCart.id);

      if (itemsErr) {
        console.error("fetch cart_items error", itemsErr);
        setCartItems([]);
      } else {
        const mapped: CartItem[] =
          (items ?? []).map((it: any) => ({
            id: it.id,
            cart_id: it.cart_id,
            product_id: it.product_id,
            quantity: it.quantity,
            price: parseFloat(it.price),
            subtotal: parseFloat(it.subtotal),
            note: it.note,
            created_at: it.created_at,
            product_name: it.products?.name ?? null,
          })) ?? [];

        setCartItems(mapped);
      }
    } catch (e) {
      console.error(e);
      showToast("Error saat ambil keranjang");
      setCart(null);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [userId]);

  const refreshCart = useCallback(async () => {
    setCartRefreshing(true);
    await fetchCart();
    setCartRefreshing(false);
  }, [fetchCart]);

  // Initialize
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Realtime subscriptions
  useEffect(() => {
    const prodChannel = supabase
      .channel("products-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    let cartChannel: any = null;
    if (cart?.id) {
      cartChannel = supabase
        .channel(`cart-${cart.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "cart_items", filter: `cart_id=eq.${cart.id}` },
          () => fetchCart()
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(prodChannel);
      if (cartChannel) supabase.removeChannel(cartChannel);
    };
  }, [fetchProducts, fetchCart, cart?.id]);

  // Cart operations
  const addToCart = async (product: Product, qty = 1) => {
    if (!cart) {
      showToast("Keranjang belum siap. Coba lagi.");
      return;
    }

    try {
      const existing = cartItems.find((ci) => ci.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        const newSubtotal = Number((newQty * existing.price).toFixed(2));

        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: newQty, subtotal: newSubtotal })
          .eq("id", existing.id);

        if (error) {
          console.error("update cart_item error", error);
          showToast("Gagal update item keranjang");
        } else {
          showToast("Jumlah diperbarui");
          fetchCart();
        }
      } else {
        const price = product.price;
        const subtotal = Number((price * qty).toFixed(2));
        const { error } = await supabase
          .from("cart_items")
          .insert({
            cart_id: cart.id,
            product_id: product.id,
            quantity: qty,
            price: price,
            subtotal: subtotal,
          });

        if (error) {
          console.error("insert cart_item error", error);
          showToast("Gagal menambahkan ke keranjang");
        } else {
          showToast("Ditambahkan ke keranjang");
          fetchCart();
        }
      }
    } catch (e) {
      console.error("addToCart exception", e);
      showToast("Terjadi kesalahan saat tambah ke keranjang");
    }
  };

  const updateCartItemQty = async (item: CartItem, newQty: number) => {
    if (newQty <= 0) {
      return deleteCartItem(item.id);
    }

    try {
      const newSubtotal = Number((newQty * item.price).toFixed(2));
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQty, subtotal: newSubtotal })
        .eq("id", item.id);

      if (error) {
        console.error("updateCartItemQty error", error);
        showToast("Gagal update jumlah");
      } else {
        fetchCart();
      }
    } catch (e) {
      console.error(e);
      showToast("Kesalahan update jumlah");
    }
  };

  const deleteCartItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
      if (error) {
        console.error("deleteCartItem error", error);
        showToast("Gagal hapus item");
      } else {
        showToast("Item dihapus");
        fetchCart();
      }
    } catch (e) {
      console.error(e);
      showToast("Kesalahan hapus item");
    }
  };

  // Compute totals
  const totals = useMemo(() => {
    const sub = cartItems.reduce((s, it) => s + Number(it.subtotal ?? 0), 0);
    return {
      subtotal: Number(sub.toFixed(2)),
      tax: 0,
      total: Number(sub.toFixed(2)),
      itemCount: cartItems.reduce((c, it) => c + it.quantity, 0),
    };
  }, [cartItems]);

  // Checkout dengan format pelanggan CUSTXXXXX
  const checkout = async (payment_method: string, customer_name_input?: string) => {
    if (!cart || cartItems.length === 0) {
      showToast("Keranjang kosong");
      return;
    }

    setCheckoutLoading(true);

    try {
      let customer_name = (customer_name_input ?? cart.customer_name ?? "").trim();
      if (!customer_name) {
        // Generate customer code like CUST07122135001
        customer_name = generateCustomerCode();
      }

      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          customer_name: customer_name,
          total_amount: totals.total,
          payment_method: payment_method,
        })
        .select()
        .single();

      if (orderErr || !orderData) {
        console.error("insert order error", orderErr);
        showToast("Gagal membuat pesanan");
        setCheckoutLoading(false);
        return;
      }

      const orderId = orderData.id;
      const itemsPayload = cartItems.map((it) => ({
        order_id: orderId,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal,
        note: it.note ?? null,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsErr) {
        console.error("insert order_items error", itemsErr);
        showToast("Gagal memasukkan item pesanan");
        setCheckoutLoading(false);
        return;
      }

      const { error: delErr } = await supabase.from("cart").delete().eq("id", cart.id);
      if (delErr) {
        console.error("delete cart error", delErr);
      }

      showToast("Transaksi berhasil!");
      setCustomerNameInput("");
      await fetchCart();
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan saat checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!cart) return;
    
    Alert.alert(
      "Konfirmasi",
      "Yakin ingin mengosongkan keranjang?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Kosongkan",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from("cart").delete().eq("id", cart.id);
            if (error) {
              showToast("Gagal mengosongkan keranjang");
            } else {
              showToast("Keranjang dikosongkan");
              fetchCart();
            }
          },
        },
      ]
    );
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(product => product.category === filterCategory);
    }
    
    // Apply search filter
    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [products, filterCategory, search]);

  // Render Product Item
  const ProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => addToCart(item, 1)}
      activeOpacity={0.7}
    >
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.category && (
            <View style={styles.categoryTag}>
              <Tag size={12} color={styles.categoryTagText.color} />
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}
        </View>
        <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
      </View>
      <TouchableOpacity
        style={styles.addToCartBtn}
        onPress={() => addToCart(item, 1)}
      >
        <Plus size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Render Cart Item
  const CartItemRow = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.product_name || 'Produk'}
        </Text>
        <Text style={styles.cartItemPrice}>
          {formatRupiah(item.price)} × {item.quantity}
        </Text>
      </View>
      
      <View style={styles.cartItemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateCartItemQty(item, item.quantity - 1)}
          >
            <Minus size={16} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.qtyText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateCartItemQty(item, item.quantity + 1)}
          >
            <Plus size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cartItemSubtotal}>
          {formatRupiah(item.subtotal)}
        </Text>
        
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteCartItem(item.id)}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Kasir</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterToggleBtn}
              onPress={() => setShowFilter(!showFilter)}
            >
              <Filter size={20} color={styles.headerTitle.color} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshBtn} onPress={refreshProducts}>
              <RefreshCw size={20} color={styles.headerTitle.color} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartBadge} onPress={() => setActiveTab('cart')}>
              <ShoppingCart size={20} color="#FFFFFF" />
              {totals.itemCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{totals.itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari produk..."
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.clearSearchBtn}>
              <X size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        {showFilter && (
          <View style={styles.filterPanel}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryScrollContent}
            >
              <TouchableOpacity
                onPress={() => setFilterCategory("")}
                style={[
                  styles.categoryChip,
                  filterCategory === "" && styles.categoryChipActive
                ]}
              >
                <Text style={[
                  styles.categoryText,
                  filterCategory === "" && styles.categoryTextActive
                ]}>
                  Semua Produk
                </Text>
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  style={[
                    styles.categoryChip,
                    filterCategory === cat && styles.categoryChipActive
                  ]}
                >
                  <Text style={[
                    styles.categoryText,
                    filterCategory === cat && styles.categoryTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {(filterCategory !== '' || search !== '') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilterCategory('');
                  setSearch('');
                }}
              >
                <Text style={styles.clearFiltersText}>Hapus Semua Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.activeTab]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>
              Produk ({filteredProducts.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'cart' && styles.activeTab]}
            onPress={() => setActiveTab('cart')}
          >
            <Text style={[styles.tabText, activeTab === 'cart' && styles.activeTabText]}>
              Keranjang ({totals.itemCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {activeTab === 'products' ? (
        // Products Tab
        <View style={styles.productsContainer}>
          {prodLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={styles.headerTitle.color} />
              <Text style={styles.loadingText}>Memuat produk...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingCart size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {search || filterCategory 
                  ? "Tidak ada produk yang sesuai dengan filter" 
                  : "Tidak ada produk tersedia"}
              </Text>
              {(search || filterCategory) && (
                <TouchableOpacity 
                  style={styles.clearFilterButton}
                  onPress={() => {
                    setFilterCategory('');
                    setSearch('');
                  }}
                >
                  <Text style={styles.clearFilterButtonText}>Hapus Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Filter Summary */}
              {(search || filterCategory) && (
                <View style={styles.filterSummary}>
                  <Text style={styles.filterSummaryText}>
                    Menampilkan {filteredProducts.length} produk
                    {search && ` untuk "${search}"`}
                    {filterCategory && ` dalam kategori "${filterCategory}"`}
                  </Text>
                </View>
              )}
              
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductItem item={item} />}
                numColumns={2}
                columnWrapperStyle={styles.productGrid}
                contentContainerStyle={styles.productList}
                refreshControl={
                  <RefreshControl
                    refreshing={prodRefreshing}
                    onRefresh={refreshProducts}
                    colors={[styles.headerTitle.color]}
                    tintColor={styles.headerTitle.color}
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      ) : (
        // Cart Tab
        <View style={styles.cartContainer}>
          {cartLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={styles.headerTitle.color} />
              <Text style={styles.loadingText}>Memuat keranjang...</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ShoppingCart size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Keranjang kosong</Text>
              <TouchableOpacity
                style={styles.browseProductsBtn}
                onPress={() => setActiveTab('products')}
              >
                <Text style={styles.browseProductsText}>Lihat Produk</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.cartScrollView}
                refreshControl={
                  <RefreshControl
                    refreshing={cartRefreshing}
                    onRefresh={refreshCart}
                    colors={[styles.headerTitle.color]}
                    tintColor={styles.headerTitle.color}
                  />
                }
                showsVerticalScrollIndicator={false}
              >
                {cartItems.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
                
                {/* Customer Name Input */}
                <View style={styles.customerInputContainer}>
                  <Text style={styles.sectionLabel}>Nama Pelanggan (Opsional)</Text>
                  <Text style={styles.customerHint}>
                    Kosongkan untuk menggunakan kode otomatis: CUSTXXXXX
                  </Text>
                  <View style={styles.customerInputRow}>
                    <TextInput
                      value={customerNameInput}
                      onChangeText={setCustomerNameInput}
                      placeholder="Masukkan nama pelanggan"
                      style={styles.customerInput}
                      placeholderTextColor="#999"
                    />
                    {customerNameInput.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setCustomerNameInput("")}
                        style={styles.clearCustomerBtn}
                      >
                        <X size={18} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Payment Methods */}
                <View style={styles.paymentSection}>
                  <Text style={styles.sectionLabel}>Metode Pembayaran</Text>
                  <View style={styles.paymentMethods}>
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isActive = paymentMethod === method.id;
                      return (
                        <TouchableOpacity
                          key={method.id}
                          style={[
                            styles.paymentMethodBtn,
                            isActive && { backgroundColor: method.color },
                          ]}
                          onPress={() => setPaymentMethod(method.id)}
                        >
                          <Icon size={20} color={isActive ? "#FFFFFF" : method.color} />
                          <Text style={[
                            styles.paymentMethodText,
                            isActive && styles.paymentMethodTextActive,
                          ]}>
                            {method.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Cart Summary & Actions */}
              <View style={styles.cartSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{formatRupiah(totals.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
                  <Text style={[styles.summaryValue, styles.totalValue]}>
                    {formatRupiah(totals.total)}
                  </Text>
                </View>
                
                <View style={styles.cartActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.clearCartBtn]}
                    onPress={clearCart}
                    disabled={checkoutLoading}
                  >
                    <Trash2 size={18} color="#EF4444" />
                    <Text style={styles.clearCartBtnText}>Kosongkan</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.checkoutBtn]}
                    onPress={() => checkout(paymentMethod, customerNameInput)}
                    disabled={checkoutLoading || cartItems.length === 0}
                  >
                    {checkoutLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <ShoppingCart size={18} color="#FFFFFF" />
                        <Text style={styles.checkoutBtnText}>
                          Checkout • {formatRupiah(totals.total)}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}