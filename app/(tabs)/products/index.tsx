import { Link } from "expo-router";
import {
  Check,
  Edit2,
  Filter,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
  X
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../../lib/supabase-client";
import { COLORS, colorWithOpacity, styles } from "./_styles"; // Import COLORS dan helper

// product type
interface Product {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  is_available: boolean;
  created_at: string;
}

// Helper function untuk format Rupiah
const formatRupiah = (amount: number) => {
  return `Rp${amount.toLocaleString('id-ID')}`;
};

// Universal Toast Utility
const showToast = (
  message: string,
  duration: number = ToastAndroid.SHORT,
  title: string = 'Info'
) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, duration);
  } else {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
      const uniqueCategories = [...new Set(data.map((p) => p.category).filter((c) => c))] as string[];
      setCategories(uniqueCategories);
    } else if (error) {
      showToast("Gagal mengambil data produk", ToastAndroid.SHORT, "Error");
    }
    setLoading(false);
  };

  // Refresh handler
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  };

  // Realtime listener
  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Delete product
  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      showToast("Gagal menghapus produk!", ToastAndroid.SHORT, "Error");
      return;
    }

    showToast("Produk berhasil dihapus!", ToastAndroid.SHORT, "Sukses");
    fetchProducts();
  };

  const openEdit = (item: Product) => {
    setEditItem(item);
    setPriceInput(formatRupiah(item.price));
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (!editItem) return;

    // Parse harga dari format Rupiah ke angka
    const price = parseFloat(priceInput.replace(/[^\d]/g, '')) || 0;
    
    const { error } = await supabase
      .from("products")
      .update({
        name: editItem.name,
        price: price,
        category: editItem.category,
        is_available: editItem.is_available,
      })
      .eq("id", editItem.id);

    if (error) {
      showToast("Gagal mengupdate produk!", ToastAndroid.SHORT, "Error");
      return;
    }

    showToast("Produk berhasil diupdate!", ToastAndroid.SHORT, "Sukses");
    setEditVisible(false);
    setEditItem(null);
    fetchProducts();
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const keyword = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(keyword) ||
      String(p.price).includes(keyword) ||
      (p.category ?? "").toLowerCase().includes(keyword);

    const matchCategory =
      filterCategory === "" || p.category === filterCategory;

    return matchSearch && matchCategory;
  });

  // Handler untuk toggle availability di Product Card
  const handleToggleAvailability = async (item: Product, newValue: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_available: newValue })
      .eq("id", item.id);

    if (error) {
      showToast("Gagal mengupdate status!", ToastAndroid.SHORT, "Error");
      return;
    }

    showToast("Status berhasil diupdate!", ToastAndroid.SHORT, "Sukses");
    fetchProducts();
  };

  // Format harga saat input
  const handlePriceChange = (text: string) => {
    // Hapus semua karakter non-digit
    const numeric = text.replace(/[^\d]/g, '');
    
    if (numeric) {
      const num = parseInt(numeric, 10);
      // Format ke Rupiah
      setPriceInput(`Rp${num.toLocaleString('id-ID')}`);
      
      // Update editItem dengan harga yang sudah diparse
      setEditItem((prev) => prev ? { ...prev, price: num } : null);
    } else {
      setPriceInput('');
      setEditItem((prev) => prev ? { ...prev, price: 0 } : null);
    }
  };

  // Skeleton Loader
  const ProductSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  );

  // Product Card Component
  const ProductCard = ({ item }: { item: Product }) => {
    // Colors untuk status badge
    const successBgColor = colorWithOpacity(COLORS.success, 0.2);
    const dangerBgColor = colorWithOpacity(COLORS.danger, 0.2);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>
                {formatRupiah(item.price)}
              </Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: item.is_available ? successBgColor : dangerBgColor,
              borderColor: item.is_available ? colorWithOpacity(COLORS.success, 0.4) : colorWithOpacity(COLORS.danger, 0.4)
            }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.is_available ? COLORS.success : COLORS.danger }
            ]} />
            <Text style={[
              styles.statusText,
              { color: item.is_available ? COLORS.success : COLORS.danger }
            ]}>
              {item.is_available ? 'Tersedia' : 'Habis'}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Tag size={16} color={COLORS.gray} />
            <Text style={styles.detailText}>
              {item.category || 'Tidak ada kategori'}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEdit(item)}
          >
            <Edit2 size={18} color={COLORS.primary} />
            <Text style={[styles.actionText, { color: COLORS.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>

          <View style={styles.availabilityToggle}>
            <Switch
              value={item.is_available}
              onValueChange={(value) => handleToggleAvailability(item, value)}
              trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => deleteProduct(item.id)}
          >
            <Trash2 size={18} color={COLORS.danger} />
            <Text style={[styles.actionText, { color: COLORS.danger }]}>
              Hapus
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty State
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Package size={64} color={COLORS.lightGray} />
      <Text style={styles.emptyTitle}>Tidak Ada Produk</Text>
      <Text style={styles.emptyText}>
        {search || filterCategory ? 'Coba ubah filter pencarian' : 'Tambahkan produk pertama Anda'}
      </Text>
      {(search || filterCategory) && (
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={() => {
            setSearch('');
            setFilterCategory('');
          }}
        >
          <Text style={styles.clearFilterText}>Hapus Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Produk</Text>
        <Text style={styles.headerSubtitle}>
          {filteredProducts.length} produk ditemukan
        </Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari produk..."
            placeholderTextColor={COLORS.gray}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            (filterCategory !== '' || showFilter) && styles.filterButtonActive
          ]}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Filter size={20} color={(filterCategory !== '' || showFilter) ? COLORS.white : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      {showFilter && (
        <View style={styles.filterPanel}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
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

      {/* Tambah Produk Button */}
      <Link href="/products/create" asChild>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color={COLORS.white} />
          <Text style={styles.addButtonText}>Tambah Produk Baru</Text>
        </TouchableOpacity>
      </Link>

      {/* Products List */}
      {loading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={<EmptyState />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <ProductCard item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Produk</Text>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nama Produk</Text>
                <TextInput
                  value={editItem?.name}
                  onChangeText={(t) =>
                    setEditItem((prev) => ({ ...prev!, name: t }))
                  }
                  placeholder="Masukkan nama produk"
                  style={styles.input}
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Harga</Text>
                <TextInput
                  value={priceInput}
                  onChangeText={handlePriceChange}
                  placeholder="Rp 0"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={COLORS.gray}
                />
                <Text style={styles.inputHelper}>
                  Contoh: Rp 25.000
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kategori</Text>
                <TextInput
                  value={editItem?.category ?? ""}
                  onChangeText={(t) =>
                    setEditItem((prev) => ({ ...prev!, category: t }))
                  }
                  placeholder="Masukkan kategori"
                  style={styles.input}
                  placeholderTextColor={COLORS.gray}
                />
              </View>

              <View style={styles.switchGroup}>
                <View style={styles.switchLabel}>
                  <Package size={20} color={COLORS.black} />
                  <Text style={styles.switchText}>Ketersediaan Produk</Text>
                </View>
                <Switch
                  value={editItem?.is_available ?? false}
                  onValueChange={(v) =>
                    setEditItem((prev) => ({ ...prev!, is_available: v }))
                  }
                  trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
                  thumbColor={COLORS.white}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={[styles.modalButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Check size={20} color={COLORS.white} />
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}