import { router } from "expo-router";
import { ChevronRight, Eye, EyeOff, Info, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../lib/supabase-client";

// Color palette - merah dan kuning
const COLORS = {
  primary: '#B82329',     // Merah Gelap
  secondary: '#F5A835',   // Orange/Kuning Cerah
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!validateEmail(email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(
            "Login Gagal",
            "Email atau password salah. Silakan coba lagi."
          );
        } else {
          Alert.alert("Login Gagal", error.message);
        }
      } else {
        // Login successful
        router.replace("/");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        "Terjadi kesalahan saat login. Silakan coba lagi nanti."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission on enter
  const handleSubmit = () => {
    handleLogin();
  };

  // Render error text
  const renderErrorText = (error?: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

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
        {/* Background dengan gradasi merah/kuning */}
        <View style={styles.backgroundContainer}>
          <View style={styles.redSection} />
          <View style={styles.yellowSection} />
        </View>

        {/* Content di atas background */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoInnerCircle}>
                  <Image 
                    source={require('../../assets/images/mie-gaok.jpeg')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <Text style={styles.title}>Kasir Mie Gaok</Text>
            <Text style={styles.subtitle}>
              Sistem Manajemen Kasir dan Stok
            </Text>
          </View>

          {/* Form Section - Card Putih */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Mail size={18} color={COLORS.primary} /> Email
              </Text>
              <View style={[
                styles.inputWrapper,
                errors.email && styles.inputErrorWrapper
              ]}>
                <Mail size={20} color={COLORS.gray500} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor={COLORS.gray500}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="next"
                />
              </View>
              {renderErrorText(errors.email)}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelContainer}>
                <Text style={styles.label}>
                  <Lock size={18} color={COLORS.primary} /> Password
                </Text>
              </View>
              <View style={[
                styles.inputWrapper,
                errors.password && styles.inputErrorWrapper
              ]}>
                <Lock size={20} color={COLORS.gray500} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Masukkan password"
                  placeholderTextColor={COLORS.gray500}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={22} color={COLORS.gray500} />
                  ) : (
                    <Eye size={22} color={COLORS.gray500} />
                  )}
                </TouchableOpacity>
              </View>
              {renderErrorText(errors.password)}
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>MASUK</Text>
                  <View style={styles.loginButtonIcon}>
                    <Text style={styles.loginButtonIconText}>→</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <Text style={styles.securityText}>
                🔒 Sistem kasir aman dan terenkripsi
              </Text>
            </View>
          </View>

          {/* Features Preview */}
          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Fitur Utama:</Text>
            <View style={styles.featuresGrid}>
              <View style={[styles.featureCard, { backgroundColor: '#FFF0F0' }]}>
                <Text style={[styles.featureIcon, { color: COLORS.primary }]}>💰</Text>
                <Text style={styles.featureText}>Transaksi Kasir</Text>
              </View>
              <View style={[styles.featureCard, { backgroundColor: '#FFF8E1' }]}>
                <Text style={[styles.featureIcon, { color: COLORS.secondary }]}>📦</Text>
                <Text style={styles.featureText}>Manajemen Stok</Text>
              </View>
              <View style={[styles.featureCard, { backgroundColor: '#FFF0F0' }]}>
                <Text style={[styles.featureIcon, { color: COLORS.primary }]}>📊</Text>
                <Text style={styles.featureText}>Laporan Penjualan</Text>
              </View>
              <View style={[styles.featureCard, { backgroundColor: '#FFF8E1' }]}>
                <Text style={[styles.featureIcon, { color: COLORS.secondary }]}>🍜</Text>
                <Text style={styles.featureText}>Menu Mie Gaok</Text>
              </View>
            </View>
          </View>

          {/* Footer - Versi tombol */}
          <View style={styles.footer}>
            <Text style={styles.copyrightText}>
              © {new Date().getFullYear()} Projek PkM Teknik Informatika UNPAM - v1.0.0
            </Text>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInfoModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.infoButtonContent}>
                <Info size={18} color={COLORS.primary} />
                <Text style={styles.infoButtonText}>Detail Projek PkM</Text>
                <ChevronRight size={18} color={COLORS.gray500} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal untuk menampilkan informasi PKM */}
      <Modal
        visible={showInfoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Info size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Informasi Projek PKM</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Kasir Mie Gaok</Text>
                <Text style={styles.infoCardSubtitle}>
                  Sistem Manajemen Kasir dan Stok Digital
                </Text>
              </View>

              {/* Detail Institusi */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>📚 Institusi</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Universitas:</Text>
                  <Text style={styles.detailValue}>Universitas Pamulang</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Program Studi:</Text>
                  <Text style={styles.detailValue}>Teknik Informatika</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Kelas:</Text>
                  <Text style={styles.detailValue}>05 TPLM 003</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Jenis Projek:</Text>
                  <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                    Pengabdian kepada Masyarakat (PkM)
                  </Text>
                </View>
              </View>

              {/* Anggota Kelompok */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>👥 Anggota Kelompok</Text>
                
                <View style={styles.memberGrid}>
                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.primary }]}>A</Text>
                    </View>
                    <Text style={styles.memberName}>Alvin Andrianto</Text>
                    <Text style={styles.memberNim}>231011402720</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.secondary }]}>A</Text>
                    </View>
                    <Text style={styles.memberName}>Aplonia Lau</Text>
                    <Text style={styles.memberNim}>231011400462</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.primary }]}>D</Text>
                    </View>
                    <Text style={styles.memberName}>Darren Hoir Putra</Text>
                    <Text style={styles.memberNim}>231011400446</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.secondary }]}>H</Text>
                    </View>
                    <Text style={styles.memberName}>Hanif Prasetyo</Text>
                    <Text style={styles.memberNim}>231011402122</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.primary }]}>M</Text>
                    </View>
                    <Text style={styles.memberName}>Muhamad Teguh Abi Saputra</Text>
                    <Text style={styles.memberNim}>231011402014</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.secondary }]}>M</Text>
                    </View>
                    <Text style={styles.memberName}>Muhammad Rizky Ramadhan</Text>
                    <Text style={styles.memberNim}>231011400406</Text>
                  </View>

                  <View style={styles.memberCard}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={[styles.memberInitial, { color: COLORS.primary }]}>O</Text>
                    </View>
                    <Text style={styles.memberName}>Oktavianus Ahut</Text>
                    <Text style={styles.memberNim}>231011400428</Text>
                  </View>
                </View>
              </View>

              {/* Fitur Aplikasi */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>🚀 Fitur Aplikasi</Text>
                <View style={styles.featureList}>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIconContainer, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>💰</Text>
                    </View>
                    <Text style={styles.featureItemText}>Sistem Kasir Digital</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIconContainer, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>📦</Text>
                    </View>
                    <Text style={styles.featureItemText}>Manajemen Stok Produk</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIconContainer, { backgroundColor: '#FFEBEE' }]}>
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>📊</Text>
                    </View>
                    <Text style={styles.featureItemText}>Laporan Penjualan</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <View style={[styles.featureIconContainer, { backgroundColor: '#FFF3E0' }]}>
                      <Text style={{ color: COLORS.secondary, fontWeight: 'bold' }}>🍜</Text>
                    </View>
                    <Text style={styles.featureItemText}>Menu Mie Gaok Lengkap</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.okButton}
                onPress={() => setShowInfoModal(false)}
              >
                <Text style={styles.okButtonText}>Mengerti</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Background dengan gradasi merah/kuning
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
  },
  redSection: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  yellowSection: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  // Content di atas background
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: "center",
    marginTop: SPACING['3xl'],
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  logoInnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    opacity: 0.9,
  },
  // Form Card (Putih)
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
    width: '100%', // Tambah ini

  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
    textDecorationLine: 'underline', // Opsional: tambah underline

  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  inputErrorWrapper: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
    color: COLORS.gray700,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    padding: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    alignItems: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  loginButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${COLORS.white}30`,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonIconText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  securityNote: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },
  // Features Card
  featuresCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.gray700,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  featureCard: {
    width: "48%",
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.gray700,
    fontWeight: "600",
    textAlign: "center",
  },
  // Footer - Versi tombol
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  infoButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    width: '100%',
  },
  infoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoButtonText: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.gray700,
    fontWeight: '300',
    lineHeight: 20,
  },
  modalContent: {
    maxHeight: 400,
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  infoCardSubtitle: {
    fontSize: 14,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '600',
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  memberCard: {
    width: '48%',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray700,
    textAlign: 'center',
    marginBottom: 2,
  },
  memberNim: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  featureList: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureItemText: {
    fontSize: 14,
    color: COLORS.gray700,
    fontWeight: '500',
    flex: 1,
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  okButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  okButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});