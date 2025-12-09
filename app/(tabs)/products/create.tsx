import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../../lib/supabase-client";

// Design Constants - simple and clean
const COLORS = {
  primary: "#007AFF",
  primaryDark: "#0056CC",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#FF9500",
  light: "#F8F9FA",
  dark: "#1C1C1E",
  gray: "#8E8E93",
  grayLight: "#E5E5EA",
  white: "#FFFFFF",
  border: "#D1D5DB",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Format price input to Rupiah
  const formatPrice = (text: string) => {
    // Remove all non-numeric characters
    const numeric = text.replace(/[^\d]/g, "");
    
    if (numeric) {
      const num = parseInt(numeric, 10);
      // Format with thousand separators
      return `Rp${num.toLocaleString("id-ID")}`;
    }
    return "";
  };

  // Handle price input with formatting
  const handlePriceChange = (text: string) => {
    // Remove all non-numeric characters for storing
    const numeric = text.replace(/[^\d]/g, "");
    setPrice(numeric);
  };

  // Get formatted price for display
  const displayPrice = price ? formatPrice(price) : "";

  // Save product with better validation
  const saveProduct = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert("Perhatian", "Nama produk wajib diisi!");
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      Alert.alert("Perhatian", "Harga produk harus lebih dari 0!");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from("products").insert({
        name: name.trim(),
        price: parseFloat(price),
        category: category.trim() || null,
        is_available: true,
      });

      if (error) {
        Alert.alert("Gagal", `Gagal menyimpan produk: ${error.message}`);
      } else {
        Alert.alert(
          "Berhasil",
          "Produk berhasil ditambahkan!",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("Error", "Terjadi kesalahan saat menyimpan produk");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all fields
  const clearForm = () => {
    setName("");
    setPrice("");
    setCategory("");
  };

  // Check if form is valid
  const isFormValid = name.trim() && price && parseFloat(price) > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tambah Produk Baru</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nama Produk <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama produk"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
              maxLength={100}
              editable={!isLoading}
            />
            <Text style={styles.charCount}>
              {name.length}/100 karakter
            </Text>
          </View>

          {/* Price Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Harga <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Rp 0"
              placeholderTextColor={COLORS.gray}
              value={displayPrice}
              onChangeText={handlePriceChange}
              keyboardType="numeric"
              editable={!isLoading}
            />
            <Text style={styles.helperText}>
              Masukkan angka tanpa titik atau koma
            </Text>
          </View>

          {/* Category Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Makanan, Minuman, Snack"
              placeholderTextColor={COLORS.gray}
              value={category}
              onChangeText={setCategory}
              maxLength={50}
              editable={!isLoading}
            />
            <Text style={styles.optionalText}>(Opsional)</Text>
          </View>

          {/* Quick Examples */}
          <View style={styles.examplesContainer}>
            <Text style={styles.examplesTitle}>Contoh Cepat:</Text>
            <View style={styles.examplesRow}>
              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => {
                  setName("Es Teh Manis");
                  setPrice("5000");
                  setCategory("Minuman");
                }}
                disabled={isLoading}
              >
                <Text style={styles.exampleButtonText}>Es Teh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => {
                  setName("Nasi Goreng");
                  setPrice("25000");
                  setCategory("Makanan");
                }}
                disabled={isLoading}
              >
                <Text style={styles.exampleButtonText}>Nasi Goreng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.exampleButton}
                onPress={() => {
                  setName("Keripik Kentang");
                  setPrice("15000");
                  setCategory("Snack");
                }}
                disabled={isLoading}
              >
                <Text style={styles.exampleButtonText}>Snack</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearForm}
            disabled={isLoading || (!name && !price && !category)}
          >
            <Text style={styles.clearButtonText}>Hapus Semua</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!isFormValid || isLoading) && styles.saveButtonDisabled,
            ]}
            onPress={saveProduct}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Menyimpan...</Text>
            ) : (
              <Text style={styles.saveButtonText}>Simpan Produk</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Status */}
        <View style={styles.statusContainer}>
          {!name && (
            <Text style={styles.statusText}>
              ⓘ Nama produk belum diisi
            </Text>
          )}
          {(!price || parseFloat(price) <= 0) && (
            <Text style={styles.statusText}>
              ⓘ Harga harus lebih dari 0
            </Text>
          )}
          {isFormValid && (
            <Text style={[styles.statusText, styles.statusValid]}>
              ✓ Form sudah valid, klik "Simpan Produk"
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.dark,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "right",
    marginTop: SPACING.xs,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    fontStyle: "italic",
  },
  optionalText: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  examplesContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  examplesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  exampleButton: {
    backgroundColor: COLORS.primary + "10",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  exampleButtonText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  clearButtonText: {
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.grayLight,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.grayLight,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusValid: {
    color: COLORS.success,
  },
});