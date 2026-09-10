import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { LogIn, Activity } from 'lucide-react-native';
import { fonts, font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Button, Input } from '../components/ui';
import api from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Brand block — mirrors GuestLayout header */}
      <View style={styles.brand}>
        <View style={{ backgroundColor: colors.primary, padding: 12, borderRadius: radii.lg, marginBottom: 16 }}>
          <Activity size={32} color="#ffffff" />
        </View>
        <Text style={styles.brandTitle}>PHARMACY</Text>
        <Text style={styles.brandSub}>Mobile Terminal</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>Auth Identifier (Email)</Text>
          <Input
            placeholder="user@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Security Key (Password)</Text>
          <Input
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Button size="lg" onPress={handleLogin} disabled={loading} style={{ marginTop: 8, height: 48 }}>
          {({ color, size }) => (
            loading
              ? <ActivityIndicator color="#ffffff" />
              : (
                <>
                  <LogIn size={18} color={color} />
                  <Text style={{ color, fontFamily: font.semibold, fontWeight: '600', fontSize: 14 }}>Authenticate</Text>
                </>
              )
          )}
        </Button>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: c.background, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 32 },
  brandTitle: { fontFamily: font.bold, fontWeight: '700', fontSize: 20, color: c.textPrimary, letterSpacing: 1 },
  brandSub: { fontFamily: font.medium, fontSize: 12, color: c.textMuted, letterSpacing: 1, marginTop: 4 },
  card: {
    backgroundColor: c.surfaceBase,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radii.lg,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  field: { gap: 8 },
  label: { fontFamily: font.bold, fontWeight: '700', fontSize: 12, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  errorText: {
    color: c.statusCriticalText,
    fontFamily: font.medium,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: c.statusCriticalBg,
    padding: 10,
    borderRadius: radii.md,
  },
});
