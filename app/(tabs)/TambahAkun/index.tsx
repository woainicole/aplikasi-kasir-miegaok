import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
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

// Color palette
const COLORS = {
  primary: '#B82329',
  secondary: '#F5A835',
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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      fullName: '',
    };

    // Email validation
    if (!email) {
      newErrors.email = 'Email tidak boleh kosong';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Nama lengkap tidak boleh kosong';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Nama minimal 2 karakter';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  async function handleSignup() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Insert profile (jika ada tabel users_profile)
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from("users_profile")
            .insert({
              id: authData.user.id,
              full_name: fullName,
              email: email,
              created_at: new Date().toISOString(),
            });

          if (profileError) {
            console.warn("Profile creation warning:", profileError.message);
          }
        } catch (profileErr) {
          console.warn("Profile table might not exist:", profileErr);
        }
      }

      Alert.alert(
        "Berhasil",
        "Akun berhasil dibuat untuk staff.",
        [
          {
            text: "OK",
            onPress: () => {
              setEmail("");
              setPassword("");
              setFullName("");
              setErrors({ email: '', password: '', fullName: '' });
            }
          }
        ]
      );
      
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  const renderErrorText = (error: string) => {
    if (!error) return null;
    return <Text style={styles.errorText}>{error}</Text>;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Tambah Akun Staff</Text>
          <View style={{ width: 0 }} />
        </View>

        <Text style={styles.subtitle}>
          Tambahkan akun baru untuk staff/kasir
        </Text>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <View style={[
              styles.inputWrapper,
              errors.fullName ? styles.inputErrorWrapper : null
            ]}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={COLORS.gray500} 
                style={styles.inputIcon}
              />
              <TextInput
                value={fullName}
                placeholder="Masukkan nama lengkap"
                onChangeText={setFullName}
                style={styles.input}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            {renderErrorText(errors.fullName)}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={[
              styles.inputWrapper,
              errors.email ? styles.inputErrorWrapper : null
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={COLORS.gray500} 
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                placeholder="email@contoh.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                style={styles.input}
                editable={!loading}
              />
            </View>
            {renderErrorText(errors.email)}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={[
              styles.inputWrapper,
              errors.password ? styles.inputErrorWrapper : null
            ]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={COLORS.gray500} 
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                placeholder="Minimal 6 karakter"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                style={styles.input}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={COLORS.gray500} 
                />
              </TouchableOpacity>
            </View>
            {renderErrorText(errors.password)}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
                <Text style={styles.signupButtonText}>Buat Akun Staff</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  formContainer: {
    backgroundColor: COLORS.white,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  passwordToggle: {
    padding: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  signupButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    marginTop: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});