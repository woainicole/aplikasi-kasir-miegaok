import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Halaman List Produk */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Daftar Produk', headerShown: false }} 
      />
      {/* Halaman Create (Otomatis punya tombol Back) */}
      <Stack.Screen 
        name="create" 
        options={{ title: 'Buat Produk Baru', headerShown: false }} 
      />
    </Stack>
  );
}