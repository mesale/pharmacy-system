import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  Activity,
  ShoppingCart,
  Package,
  History,
  Users,
  Tags,
  Truck,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { font, radii } from './src/theme';
import { ThemeProvider, useTheme } from './src/theme-context';
import api from './src/api';

import PosScanScreen from './src/screens/PosScanScreen';
import LoginScreen from './src/screens/LoginScreen';
import MedicinesScreen from './src/screens/MedicinesScreen';
import FinancialReportsScreen from './src/screens/FinancialReportsScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import GenericListScreen from './src/screens/GenericListScreen';
import StaffUsersScreen from './src/screens/StaffUsersScreen';

const Drawer = createDrawerNavigator();

// Mirrors AdminLayout.tsx navItems (same labels, same lucide icons, same adminOnly rules).
const NAV_ITEMS = [
  { label: 'Dashboard', icon: Activity, routeName: 'Dashboard' },
  { label: 'Checkout', icon: ShoppingCart, routeName: 'PosScan' },
  { label: 'Sales', icon: Activity, routeName: 'Reports', adminOnly: true },
  { label: 'Stock', icon: Package, routeName: 'Medicines' },
  { label: 'Categories', icon: Tags, routeName: 'Categories', adminOnly: true },
  { label: 'Suppliers', icon: Truck, routeName: 'Suppliers', adminOnly: true },
  { label: 'Users', icon: Users, routeName: 'Users', adminOnly: true },
  { label: 'Audit Log', icon: History, routeName: 'Audit Log', adminOnly: true },
];

const THEME_OPTIONS = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'Auto', icon: Monitor },
];

function ThemeToggle() {
  const { colors, mode, setMode } = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
      {THEME_OPTIONS.map((opt, i) => {
        const active = mode === opt.key;
        const Icon = opt.icon;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setMode(opt.key)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              paddingVertical: 8,
              backgroundColor: active ? colors.primary : 'transparent',
              borderLeftWidth: i === 0 ? 0 : 1,
              borderLeftColor: colors.border,
            }}
          >
            <Icon size={14} color={active ? colors.primaryForeground : colors.textSecondary} />
            <Text style={{ fontFamily: font.medium, fontSize: 12, color: active ? colors.primaryForeground : colors.textSecondary }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function CustomDrawerContent(props) {
  const { user, onLogout } = props;
  const { colors } = useTheme();
  const isAdmin = user?.roles?.some(r => (r.name || r) === 'admin') || user?.email === 'admin@pharmacy.test';
  const currentRoute = props.state.routeNames[props.state.index];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceBase }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* SidebarHeader — matches AdminLayout header block */}
        <View style={{ padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ backgroundColor: colors.primary, padding: 6, borderRadius: radii.md }}>
            <Activity size={20} color={colors.primaryForeground} />
          </View>
          <Text style={{ fontFamily: font.bold, fontWeight: '700', fontSize: 18, color: colors.textPrimary, letterSpacing: -0.3 }}>Pharmacy</Text>
        </View>

        {/* SidebarContent — nav menu */}
        <View style={{ paddingHorizontal: 8, paddingVertical: 16, gap: 4 }}>
          {NAV_ITEMS.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = currentRoute === item.routeName;
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.routeName}
                onPress={() => props.navigation.navigate(item.routeName)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 12,
                  height: 40,
                  borderRadius: radii.md,
                  backgroundColor: isActive ? colors.primarySoft : 'transparent',
                }}
              >
                <Icon size={16} color={isActive ? colors.primary : colors.textSecondary} />
                <Text style={{ fontFamily: isActive ? font.semibold : font.medium, fontSize: 14, color: isActive ? colors.primary : colors.textPrimary }}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Appearance toggle */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Appearance</Text>
        <ThemeToggle />
      </View>

      {/* SidebarFooter — user + logout */}
      <TouchableOpacity onPress={onLogout} style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: radii.full, backgroundColor: colors.primarySoft, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.primaryText, fontFamily: font.bold, fontWeight: '700', fontSize: 14 }}>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.textPrimary }}>{user?.name || 'Admin User'}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.textMuted }}>{isAdmin ? 'Administrator' : 'Worker'}</Text>
        </View>
        <LogOut size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function AppInner() {
  const { colors, scheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        const res = await api.get('/user');
        setUser(res.data.user || res.data);
      }
    } catch (err) {
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {}
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <LoginScreen onLoginSuccess={checkAuth} />
      </>
    );
  }

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme : DefaultTheme).colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surfaceBase,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} user={user} onLogout={handleLogout} />}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surfaceBase, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontFamily: font.semibold, fontWeight: '600', fontSize: 18 },
          headerTitleAlign: 'left',
          drawerType: 'front',
          drawerStyle: { width: 260, backgroundColor: colors.surfaceBase },
        }}
      >
        <Drawer.Screen name="Dashboard" component={DashboardScreen} />
        <Drawer.Screen name="PosScan" component={PosScanScreen} options={{ title: 'Checkout' }} />
        <Drawer.Screen name="Reports" component={FinancialReportsScreen} options={{ title: 'Sales' }} />
        <Drawer.Screen name="Medicines" component={MedicinesScreen} options={{ title: 'Stock' }} />
        <Drawer.Screen name="Categories" component={GenericListScreen} />
        <Drawer.Screen name="Suppliers" component={GenericListScreen} />
        <Drawer.Screen name="Users" component={StaffUsersScreen} />
        <Drawer.Screen name="Audit Log" component={GenericListScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
