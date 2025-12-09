import 'dotenv/config';

export default {
  expo: {
    name: "mie-gaok",
    slug: "mie-gaok",
    scheme: "miegaok",

    // --- PASTIKAN BAGIAN INI ADA ---
    android: {
      // GANTI DENGAN PACKAGE NAME UNIK ANDA SENDIRI
      package: "com.miegaok.kasir", // Contoh yang baik
      versionCode: 1 // Angka integer, harus meningkat setiap kali Anda melakukan build baru
    },
    // -----------------------------

    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "7eadad0c-d2f5-4fec-ad41-f5a6ec7cdf67" 
      }
    },
  },
};