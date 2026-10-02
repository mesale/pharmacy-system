import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Platform, StatusBar as RNStatusBar } from 'react-native';
import { LogIn, Activity, Sun, Moon, Monitor } from 'lucide-react-native';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '../components/ui';
import api, { API_URL } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clear the status bar / notch for the absolutely-positioned theme toggle, since
// the login screen renders outside the navigator (no header to offset it).
const TOP_INSET = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 48;

const THEME_OPTIONS = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'system', label: 'Auto', icon: Monitor },
];

// Light / Dark / Auto selector — mirrors the drawer's ThemeToggle and the web
// login's toggle, wired to the same theme context (mode/setMode).
function ThemeToggle() {
  const { colors, mode, setMode } = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceBase, overflow: 'hidden' }}>
      {THEME_OPTIONS.map((opt, i) => {
        const active = mode === opt.key;
        const Icon = opt.icon;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setMode(opt.key)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 7,
              backgroundColor: active ? colors.primary : 'transparent',
              borderLeftWidth: i === 0 ? 0 : 1,
              borderLeftColor: colors.border,
            }}
          >
            <Icon size={13} color={active ? colors.primaryForeground : colors.textSecondary} />
            <Text style={{ fontFamily: font.medium, fontWeight: '500', fontSize: 11, color: active ? colors.primaryForeground : colors.textSecondary }}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function LoginScreen({ onLoginSuccess }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [email, setEmail] = useState('admin@pharmacy.test');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/login', { email: email.trim(), password });
      const { token, user } = response.data;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      if (onLoginSuccess) onLoginSuccess(user);
    } catch (err) {
      // Distinguish a real auth failure (server responded) from the app simply
      // not being able to reach the backend, which otherwise looked identical.
      if (err.response) {
        setError(err.response.data?.message || 'Login failed. Please check your credentials.');
      } else {
        setError(`Can't reach the server at ${API_URL}. Make sure the backend is running and your device is on the same Wi-Fi network.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Theme selector, top-right — matches the web login screen. */}
      <View style={styles.themeWrap}>
        <ThemeToggle />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Brand block — same logo mark as the drawer header, using the app's
            standard h1 type scale so it reads like the rest of the screens. */}
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Activity size={28} color={colors.primaryForeground} />
          </View>
          <Text style={styles.h1}>Pharmacy</Text>
        </View>

        {/* Standard Card + CardHeader + CardContent, matching the other screens
            (e.g. the Reports "Filter Period" card) rather than a bespoke panel. */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 16 }}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Password</Text>
              <Input
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button size="lg" onPress={handleLogin} disabled={loading} style={{ marginTop: 4 }}>
              {({ color, size }) => (
                loading
                  ? <ActivityIndicator color={color} />
                  : (
                    <>
                      <LogIn size={size} color={color} />
                      <Text style={{ color, fontFamily: font.semibold, fontWeight: '600', fontSize: 16 }}>Sign In</Text>
                    </>
                  )
              )}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  themeWrap: { position: 'absolute', top: TOP_INSET + 8, right: 16, zIndex: 10 },
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 24 },
  brand: { alignItems: 'center' },
  logo: { backgroundColor: c.primary, padding: 14, borderRadius: radii.lg, marginBottom: 12 },
  h1: { fontFamily: font.bold, fontWeight: '700', fontSize: 28, color: c.textPrimary, letterSpacing: -0.5 },
  label: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  errorBox: { backgroundColor: c.statusCriticalBg, borderRadius: radii.md, padding: 12 },
  errorText: { color: c.statusCriticalText, fontFamily: font.medium, fontWeight: '500', fontSize: 13, textAlign: 'center' },
});
