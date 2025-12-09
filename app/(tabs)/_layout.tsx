import { Tabs } from 'expo-router';
import {
  FileText,
  Home,
  Package,
  ShoppingCart,
  Users
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'; // ← Import dari package yang benar

const COLORS = {
  primary: '#B82329',
  secondary: '#F5A835',
  white: '#FFFFFF',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray700: '#374151',
};

// Komponen utama dengan Safe Area
function MainTabLayout() {
  const insets = useSafeAreaInsets(); // ← Dapatkan insets untuk safe area
  
  return (
    <View style={[
      styles.container,
      {
        // Tambahkan padding berdasarkan safe area
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }
    ]}>
      {/* StatusBar untuk Android */}
      {Platform.OS === 'android' && (
        <StatusBar 
          backgroundColor={COLORS.white}
          barStyle="dark-content"
          translucent={false}
        />
      )}
      
      <Tabs
        screenOptions={{
          // Tab Bar styling
          tabBarStyle: { 
            backgroundColor: COLORS.white,
            height: Platform.OS === 'ios' ? 85 : 70,
            borderTopWidth: 1,
            borderTopColor: COLORS.gray200,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 12,
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray500,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
            marginBottom: Platform.OS === 'ios' ? 4 : 0,
          },
          
          // Hide header for all tabs
          headerShown: false,
          
          // Tab bar item style
          tabBarItemStyle: {
            paddingVertical: 6,
            paddingHorizontal: 4,
          },
        }}
      >
        {/* Screen configurations tetap sama */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  <Home 
                    size={22} 
                    color={focused ? COLORS.primary : color} 
                    strokeWidth={focused ? 2.5 : 2}
                  />
                </View>
              </View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="products"
          options={{
            title: 'Produk',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  <Package 
                    size={22} 
                    color={focused ? COLORS.primary : color} 
                    strokeWidth={focused ? 2.5 : 2}
                  />
                </View>
              </View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="PoS"
          options={{
            title: 'Kasir',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  <ShoppingCart 
                    size={22} 
                    color={focused ? COLORS.primary : color} 
                    strokeWidth={focused ? 2.5 : 2}
                  />
                </View>
              </View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="Transactions"
          options={{
            title: 'Transaksi',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  <FileText 
                    size={22} 
                    color={focused ? COLORS.primary : color} 
                    strokeWidth={focused ? 2.5 : 2}
                  />
                </View>
              </View>
            ),
          }}
        />
        
        <Tabs.Screen
          name="TambahAkun"
          options={{
            title: 'Akun',
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                  <Users 
                    size={22} 
                    color={focused ? COLORS.primary : color} 
                    strokeWidth={focused ? 2.5 : 2}
                  />
                </View>
              </View>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// Wrap dengan SafeAreaProvider
export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <MainTabLayout />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  iconWrapperActive: {
    transform: [{ translateY: -2 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: `${COLORS.primary}10`,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});