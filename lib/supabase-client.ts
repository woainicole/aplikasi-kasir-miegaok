import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import 'react-native-url-polyfill/auto'; // <-- IMPORTANT: Add this

const extra = Constants.expoConfig?.extra || {};

export const supabase = createClient(
  extra.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL,
  extra.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage, // Required for React Native
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Important for React Native
    },
  }
);

export default supabase;