// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '../providers/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  //const colorScheme = useColorScheme();//

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          
          {/* AUTH PAGES */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />

          {/* MAIN APP (TABS) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* OPTIONAL MODAL */}
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>

        <StatusBar style="dark" />
      </ThemeProvider>
    </AuthProvider>
  );
}
