import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, Users, Shield, User } from 'lucide-react-native';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';
import api from '../api';

export default function StaffUsersScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Staff Accounts</Text>
          <Text style={styles.subtitle}>Manage system access, worker credentials, and roles.</Text>
        </View>
        <Button>
          {({ color, size }) => (
            <>
              <Plus size={size} color={color} />
              <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Add Staff</Text>
            </>
          )}
        </Button>
      </View>

      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Users size={20} color={colors.textMuted} />
            <CardTitle>Personnel Directory</CardTitle>
          </View>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : users.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.muted}>No staff members found.</Text>
            </View>
          ) : (
            users.map((user, index) => {
              const role = user.roles?.[0]?.name || 'worker';
              const isAdmin = role === 'admin';
              return (
                <View key={user.id} style={[styles.row, { borderTopWidth: index === 0 ? 0 : 1 }]}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isAdmin ? <Shield size={16} color={colors.statusWarning} /> : <User size={16} color={colors.textMuted} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{user.name}</Text>
                      <Text style={styles.muted}>{user.email}</Text>
                    </View>
                  </View>
                  <Badge variant={isAdmin ? 'default' : 'secondary'} style={isAdmin ? { backgroundColor: colors.statusWarning } : null} textStyle={isAdmin ? { color: '#18181b' } : null}>
                    {isAdmin ? 'Administrator' : 'Worker'}
                  </Badge>
                </View>
              );
            })
          )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  h1: { fontFamily: font.bold, fontWeight: '700', fontSize: 28, color: c.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: font.regular, fontSize: 14, color: c.textMuted, marginTop: 4 },
  row: { paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, borderTopColor: c.gridLine },
  itemName: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary },
  muted: { fontFamily: font.regular, fontSize: 13, color: c.textMuted },
});
