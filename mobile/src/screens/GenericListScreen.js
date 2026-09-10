import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, Tags, Truck, History, Phone, Mail, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import api from '../api';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../components/ui';

const CONFIG = {
  Categories: { endpoint: '/categories', title: 'Categories', subtitle: 'Manage product categories for your inventory.', listTitle: 'Category Database', Icon: Tags },
  Suppliers: { endpoint: '/suppliers', title: 'Suppliers', subtitle: 'Manage external vendors and pharmaceutical suppliers.', listTitle: 'Supplier Directory', Icon: Truck },
  'Audit Log': { endpoint: '/adjustments', title: 'Audit Log', subtitle: 'Track all manual inventory adjustments and discrepancy resolutions.', listTitle: 'Stock Adjustment Log', Icon: History },
};

export default function GenericListScreen({ route }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const cfg = CONFIG[route.name] || CONFIG.Categories;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [route.name]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(cfg.endpoint);
      setItems(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAudit = route.name === 'Audit Log';
  const Icon = cfg.Icon;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>{cfg.title}</Text>
          <Text style={styles.subtitle}>{cfg.subtitle}</Text>
        </View>
        {!isAudit && (
          <Button>
            {({ color, size }) => (
              <>
                <Plus size={size} color={color} />
                <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Add {cfg.title.replace(/s$/, '')}</Text>
              </>
            )}
          </Button>
        )}
      </View>

      <Card>
        <CardHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon size={20} color={colors.textMuted} />
            <CardTitle>{cfg.listTitle}</CardTitle>
          </View>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : items.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.muted}>No {route.name.toLowerCase()} found.</Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View key={item.id} style={[styles.row, { borderTopWidth: index === 0 ? 0 : 1 }]}>
                {route.name === 'Categories' && (
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                    <Text style={styles.countText}>{item.products_count || 0} products</Text>
                  </>
                )}

                {route.name === 'Suppliers' && (
                  <>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Phone size={12} color={colors.textMuted} />
                        <Text style={styles.muted}>{item.phone || '—'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Mail size={12} color={colors.textMuted} />
                        <Text style={styles.muted}>{item.email || '—'}</Text>
                      </View>
                    </View>
                    <Text style={styles.countText}>{item.stock_batches_count || 0} batches</Text>
                  </>
                )}

                {isAudit && (() => {
                  const qty = item.quantity_change ?? (item.type === 'add' ? item.quantity : -item.quantity) ?? 0;
                  const negative = qty < 0;
                  const productName = item.product?.name || item.batch?.product?.name || 'Unknown';
                  return (
                    <>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{productName}</Text>
                        <Text style={styles.muted}>{(item.reason || '')}{item.user?.name ? ` · by ${item.user.name}` : ''}</Text>
                        <Text style={styles.timestamp}>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {negative ? <ArrowDownRight size={16} color={colors.statusCritical} /> : <ArrowUpRight size={16} color={colors.primary} />}
                        <Text style={{ fontFamily: font.bold, fontWeight: '700', fontSize: 14, color: negative ? colors.statusCritical : colors.primary }}>{Math.abs(qty)}</Text>
                      </View>
                    </>
                  );
                })()}
              </View>
            ))
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
  timestamp: { fontFamily: 'monospace', fontSize: 11, color: c.textFaint, marginTop: 4 },
  countText: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.primary },
});
