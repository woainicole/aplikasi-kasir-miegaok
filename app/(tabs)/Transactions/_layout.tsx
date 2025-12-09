import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Halaman List Produk */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Riwayat Transaksi', headerShown: false }} 
      />
    </Stack>
  );
}