import { supabase } from './supabase-client';

export interface TempPasswordResponse {
  success: boolean;
  message: string;
  tempPassword?: string;
  userFullName?: string;
  error?: string;
}

/**
 * VERSI MENGGUNAKAN TABEL users_profile YANG SUDAH ADA
 */
export async function sendTemporaryPassword(email: string): Promise<TempPasswordResponse> {
  try {
    console.log('🔐 Proses password sementara untuk:', email);

    // 1. Validasi email
    if (!email || !email.includes('@') || !email.includes('.')) {
      return {
        success: false,
        message: 'Format email tidak valid',
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. CARA MENDAPATKAN USER_ID DARI EMAIL:
    // Karena users_profile tidak punya kolom email, kita perlu cari user_id dari auth
    // Tapi frontend tidak bisa akses auth.admin.listUsers()
    
    // SOLUSI: Coba sign in dengan password dummy untuk trigger error
    // Jika error "Invalid login credentials", berarti email MUNGKIN ada di system
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: 'dummy_check_password_123!@#',
    });

    let userId: string | null = null;
    let userFullName = 'Pengguna';

    // 3. ANALISA RESPONSE:
    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        // Email ADA di sistem, tapi password salah
        // Kita perlu mendapatkan user_id dari response error atau cara lain
        console.log('✅ Email terdaftar di sistem, tapi perlu dapatkan user_id');
        
        // Coba cara alternatif: Sign up dengan email yang sama akan error jika email sudah ada
        const { error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: 'temporary_check_123!',
          options: {
            // Supabase akan return error jika email sudah terdaftar
            emailRedirectTo: 'mie-gaok://redirect'
          }
        });

        if (signUpError && signUpError.message.includes('already registered')) {
          // Email sudah terdaftar, tapi kita tetap tidak dapat user_id
          console.log('⚠️ Email sudah terdaftar, tapi tidak bisa dapat user_id dari frontend');
          
          // Karena tidak bisa dapat user_id, kita akan buat password dan minta admin handle
          const tempPassword = generateEasyPassword();
          
          return {
            success: true,
            message: `Password sementara: ${tempPassword}\n\n⚠️ Hubungi admin untuk mengupdate password di database.`,
            tempPassword: tempPassword,
            userFullName: userFullName,
          };
        }
      }
      
      // Error lain
      console.error('❌ Auth error:', authError.message);
      
      // Fallback: Generate password saja tanpa save ke DB
      const tempPassword = generateEasyPassword();
      
      return {
        success: true,
        message: `Password sementara: ${tempPassword}\n\n⚠️ Hubungi admin untuk verifikasi.`,
        tempPassword: tempPassword,
        userFullName: userFullName,
      };
    } else if (authData?.user) {
      // BERHASIL LOGIN (tidak mungkin karena password dummy)
      // Ini seharusnya tidak terjadi
      userId = authData.user.id;
      console.log('✅ Got user ID from auth:', userId);
    }

    // 4. GENERATE PASSWORD
    const tempPassword = generateEasyPassword();
    
    // 5. JIKA ADA USER_ID, UPDATE users_profile
    if (userId) {
      const { error: updateError } = await supabase
        .from('users_profile')
        .upsert({
          id: userId,
          full_name: userFullName,
          temp_password: tempPassword,
          temp_password_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('❌ Gagal update users_profile:', updateError);
        
        return {
          success: true,
          message: `Password sementara: ${tempPassword}\n\n⚠️ Gagal save ke database.`,
          tempPassword: tempPassword,
          userFullName: userFullName,
        };
      }
      
      console.log('✅ Password berhasil disimpan di users_profile');
      
      return {
        success: true,
        message: `Password sementara: ${tempPassword}\n\n✅ Password telah disimpan.`,
        tempPassword: tempPassword,
        userFullName: userFullName,
      };
    }
    
    // 6. JIKA TIDAK ADA USER_ID (kasus umum)
    console.log('⚠️ Tidak dapat user_id, return password saja');
    
    return {
      success: true,
      message: `Password sementara: ${tempPassword}\n\n🔧 Berikan password ini ke admin untuk diupdate.`,
      tempPassword: tempPassword,
      userFullName: userFullName,
    };

  } catch (error: any) {
    console.error('❌ Error sendTemporaryPassword:', error);
    
    // Fallback: tetap generate password
    const tempPassword = generateEasyPassword();
    
    return {
      success: true,
      message: `Password sementara: ${tempPassword}\n\n⚠️ Error system, hubungi admin.`,
      tempPassword: tempPassword,
      error: error.message,
    };
  }
}

/**
 * Generate password mudah
 */
function generateEasyPassword(): string {
  const adjectives = ['Mie', 'Gaok', 'Enak', 'Pedas', 'Gurih'];
  const nouns = ['Ayam', 'Bakso', 'Sosis', 'Special', 'Spesial'];
  const numbers = Math.floor(100 + Math.random() * 900); // 100-999
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adj}${noun}${numbers}!`;
}

/**
 * Verifikasi password sementara dengan LOGIN LANGSUNG ke Supabase Auth
 */
export async function verifyTempPassword(email: string, password: string): Promise<{
  success: boolean;
  userId?: string;
  fullName?: string;
  message: string;
}> {
  try {
    // Langsung coba login dengan password sementara
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (error) {
      // Jika gagal, coba cek di users_profile
      const { data: profileData } = await supabase
        .from('users_profile')
        .select('id, full_name, temp_password, temp_password_expires')
        .eq('temp_password', password)
        .single();

      if (profileData) {
        // Cek expired
        if (profileData.temp_password_expires) {
          const now = new Date();
          const expires = new Date(profileData.temp_password_expires);
          
          if (now > expires) {
            return { success: false, message: 'Password sudah kadaluarsa' };
          }
        }

        return {
          success: true,
          userId: profileData.id,
          fullName: profileData.full_name,
          message: 'Password valid (dari temp)',
        };
      }
      
      return { success: false, message: error.message };
    }

    // Login berhasil dengan password sementara
    return {
      success: true,
      userId: data.user.id,
      fullName: data.user.user_metadata?.full_name || 'Pengguna',
      message: 'Login berhasil',
    };

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Update password user setelah login dengan temp password
 */
export async function updateUserPassword(newPassword: string): Promise<TempPasswordResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: 'User tidak ditemukan',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: 'Gagal mengupdate password',
        error: error.message,
      };
    }

    // Clear temp password dari users_profile
    await supabase
      .from('users_profile')
      .update({
        temp_password: null,
        temp_password_expires: null,
      })
      .eq('id', user.id);

    return {
      success: true,
      message: 'Password berhasil diupdate',
    };

  } catch (error: any) {
    return {
      success: false,
      message: 'Terjadi kesalahan',
      error: error.message,
    };
  }
}