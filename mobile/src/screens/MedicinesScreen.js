import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, X, Search, Save, AlertCircle } from 'lucide-react-native';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input } from '../components/ui';
import api from '../api';

export default function MedicinesScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', selling_price: '', stock: '' });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/products');
      setMedicines(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', selling_price: '', stock: '' });
    setIsAdding(!isAdding);
  };

  const openEdit = (med) => {
    setEditingId(med.id);
    setForm({
      name: med.name || '',
      selling_price: med.selling_price ? med.selling_price.toString() : '',
      stock: med.total_stock !== undefined ? med.total_stock.toString() : '0',
    });
    setIsAdding(true);
  };

  const currency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));

  const filteredMeds = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || (m.barcode && m.barcode.includes(search))
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h1}>Inventory Stock</Text>
          <Text style={styles.subtitle}>Manage medicines, pricing, and stock levels.</Text>
        </View>
        <Button variant={isAdding ? 'outline' : 'default'} onPress={openAdd}>
          {({ color, size }) => (
            <>
              {isAdding ? <X size={size} color={color} /> : <Plus size={size} color={color} />}
              <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>{isAdding ? 'Cancel' : 'Add Product'}</Text>
            </>
          )}
        </Button>
      </View>

      {isAdding && (
        <Card style={{ borderColor: colors.primarySoftBorder }}>
          <CardHeader style={{ backgroundColor: colors.primarySoft, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, paddingBottom: 16 }}>
            <CardTitle style={{ color: colors.primaryText, fontSize: 18 }}>{editingId ? 'Edit Product' : 'New Product Registration'}</CardTitle>
            <CardDescription>Enter the details of the new medication or item into the system.</CardDescription>
          </CardHeader>
          <CardContent style={{ paddingTop: 16, gap: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Product Name</Text>
              <Input value={form.name} onChangeText={t => setForm({ ...form, name: t })} placeholder="e.g. Paracetamol 500mg" />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Selling Price ($)</Text>
              <Input keyboardType="numeric" value={form.selling_price} onChangeText={t => setForm({ ...form, selling_price: t })} placeholder="0.00" />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Initial Stock</Text>
              <Input keyboardType="numeric" value={form.stock} onChangeText={t => setForm({ ...form, stock: t })} placeholder="0" />
            </View>
            <Button onPress={() => setIsAdding(false)} style={{ alignSelf: 'flex-end' }}>
              {({ color, size }) => (
                <>
                  <Save size={size} color={color} />
                  <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Save Product</Text>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search + list */}
      <Card>
        <CardHeader style={{ paddingBottom: 16 }}>
          <View style={styles.searchWrap}>
            <Search size={16} color={colors.textMuted} style={{ position: 'absolute', left: 10, top: 12, zIndex: 1 }} />
            <Input
              style={{ paddingLeft: 32 }}
              placeholder="Search by product name or barcode..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : filteredMeds.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.muted}>No products found matching your criteria.</Text>
            </View>
          ) : (
            filteredMeds.map((med, index) => {
              const isLowStock = med.total_stock <= med.reorder_level;
              const isOutOfStock = med.total_stock <= 0;
              const stockColor = isOutOfStock ? colors.statusCritical : isLowStock ? colors.statusWarning : colors.primary;
              return (
                <View key={med.id} style={[styles.row, { borderTopWidth: index === 0 ? 0 : 1 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{med.name}</Text>
                    <Text style={styles.mono}>{med.barcode || 'No Barcode'}</Text>
                    <Text style={[styles.muted, { marginTop: 4 }]}>{med.category?.name || 'Uncategorized'}</Text>
                    <Text style={styles.price}>{currency(med.selling_price)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                      {isLowStock && <AlertCircle size={12} color={stockColor} />}
                      <Text style={{ fontFamily: font.bold, fontWeight: '700', fontSize: 14, color: stockColor }}>{med.total_stock} {med.unit || 'Pieces'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {med.requires_prescription && <Badge variant="success">Rx Required</Badge>}
                      {med.is_controlled && <Badge variant="destructive">Controlled</Badge>}
                    </View>
                  </View>
                  <Button variant="outline" size="sm" onPress={() => openEdit(med)}>Manage Stock</Button>
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
  label: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  searchWrap: { position: 'relative', justifyContent: 'center' },
  row: { paddingVertical: 16, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, borderTopColor: c.gridLine },
  itemName: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary },
  mono: { fontFamily: 'monospace', fontSize: 12, color: c.textMuted },
  muted: { fontFamily: font.regular, fontSize: 14, color: c.textMuted },
  price: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary, marginTop: 4 },
});
