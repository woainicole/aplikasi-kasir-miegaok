import { Stack } from 'expo-router';

export default function ProductsLayout() {
  return (
    <Stack>
      {/* Halaman List Produk */}
      <Stack.Screen 
        name="index" 
        options={{ title: 'Point of Sale', headerShown: false }} 
      />
    </Stack>
  );
}