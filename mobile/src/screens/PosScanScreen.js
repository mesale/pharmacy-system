import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Banknote, ShieldAlert } from 'lucide-react-native';
import api from '../api';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Input } from '../components/ui';

export default function PosScanScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tenderedCash, setTenderedCash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search))
    );
  }, [products, search]);

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.product.selling_price) * item.quantity), 0);
  const tax = 0;
  const total = Number((subtotal + tax).toFixed(2));
  const changeDue = paymentMethod === 'cash' && tenderedCash ? Math.max(0, parseFloat(tenderedCash) - total) : 0;

  const currency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));

  const addToCart = (product) => {
    if (product.total_stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.total_stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setSearch('');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const q = Math.max(1, Math.min(item.quantity + delta, item.product.total_stock));
        return { ...item, quantity: q };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product.id !== id));

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await api.post('/sales', {
        payment_method: paymentMethod,
        total_amount: total,
        tendered_amount: paymentMethod === 'cash' ? (tenderedCash ? tenderedCash : total) : total,
        change_due: changeDue,
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      Alert.alert('Success', 'Sale completed successfully!');
      setCart([]);
      setTenderedCash('');
      fetchProducts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const hasRx = cart.some(i => i.product.requires_prescription);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      {/* Product search list */}
      <Card>
        <CardHeader style={{ paddingBottom: 12, gap: 8 }}>
          <CardTitle>Point of Sale</CardTitle>
          <CardDescription>Search for products and add them to the customer's cart.</CardDescription>
          <View style={styles.searchWrap}>
            <Search size={16} color={colors.textMuted} style={{ position: 'absolute', left: 10, top: 16, zIndex: 1 }} />
            <Input
              style={{ paddingLeft: 32, height: 48, fontSize: 16 }}
              placeholder="Scan barcode or search product name..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {/* table header */}
          <View style={styles.thead}>
            <Text style={[styles.th, { flex: 1 }]}>Product</Text>
            <Text style={[styles.th, { width: 72, textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.th, { width: 44, textAlign: 'right' }]}>Stock</Text>
            <View style={{ width: 56 }} />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.muted}>No products found.</Text>
            </View>
          ) : (
            filteredProducts.map((product) => {
              const outOfStock = product.total_stock <= 0;
              return (
                <View key={product.id} style={[styles.trow, outOfStock && { opacity: 0.5 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{product.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={styles.mono}>{product.barcode || 'N/A'}</Text>
                      {product.requires_prescription && <Badge variant="secondary" style={{ paddingVertical: 0 }} textStyle={{ fontSize: 10 }}>Rx</Badge>}
                    </View>
                  </View>
                  <Text style={[styles.price, { width: 72, textAlign: 'right' }]} numberOfLines={1}>{currency(product.selling_price)}</Text>
                  <Text style={{ width: 44, textAlign: 'right', fontFamily: font.bold, fontWeight: '700', fontSize: 14, color: outOfStock ? colors.statusCritical : colors.primary }}>{product.total_stock}</Text>
                  <View style={{ width: 56, alignItems: 'flex-end' }}>
                    <Button variant="secondary" size="sm" disabled={outOfStock} onPress={() => addToCart(product)}>Add</Button>
                  </View>
                </View>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Cart */}
      <Card style={{ borderColor: colors.primarySoftBorder }}>
        <CardHeader style={{ backgroundColor: colors.surfaceContainer, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={20} color={colors.primary} />
            <CardTitle>Current Order</CardTitle>
          </View>
        </CardHeader>

        <CardContent style={{ padding: 0 }}>
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <ShoppingCart size={48} color={colors.borderStrong} />
              <Text style={[styles.muted, { marginTop: 12 }]}>The cart is currently empty.</Text>
              <Text style={styles.mutedSm}>Search for products above to begin.</Text>
            </View>
          ) : (
            cart.map((item, index) => (
              <View key={item.product.id} style={[styles.cartRow, { borderTopWidth: index === 0 ? 0 : 1 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.product.name}</Text>
                    <Text style={styles.mutedSm}>{currency(item.product.selling_price)} each</Text>
                  </View>
                  <Text style={styles.price}>{currency(parseFloat(item.product.selling_price) * item.quantity)}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => updateQuantity(item.product.id, -1)} style={styles.stepBtn}>
                      <Minus size={12} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.stepQty}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.product.id, 1)} style={styles.stepBtn}>
                      <Plus size={12} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={{ padding: 6 }}>
                    <Trash2 size={16} color={colors.statusCritical} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </CardContent>

        {/* Footer / totals */}
        <View style={styles.cartFooter}>
          {hasRx && (
            <View style={styles.rxWarn}>
              <ShieldAlert size={16} color={colors.statusSuccessText} />
              <Text style={styles.rxWarnText}>Prescription required for some items.</Text>
            </View>
          )}

          <View style={{ gap: 8 }}>
            <View style={styles.totalRow}>
              <Text style={styles.muted}>Subtotal</Text>
              <Text style={styles.totalVal}>{currency(subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.muted}>Tax (0%)</Text>
              <Text style={styles.totalVal}>{currency(tax)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={{ fontFamily: font.bold, fontWeight: '700', fontSize: 18, color: colors.textPrimary }}>Total</Text>
              <Text style={{ fontFamily: font.bold, fontWeight: '700', fontSize: 24, color: colors.primary }}>{currency(total)}</Text>
            </View>
          </View>

          {/* Payment method */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button variant={paymentMethod === 'cash' ? 'default' : 'outline'} style={{ flex: 1 }} onPress={() => setPaymentMethod('cash')}>
              {({ color, size }) => (
                <>
                  <Banknote size={size} color={color} />
                  <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Cash</Text>
                </>
              )}
            </Button>
            <Button variant={paymentMethod === 'card' ? 'default' : 'outline'} style={{ flex: 1 }} onPress={() => setPaymentMethod('card')}>
              {({ color, size }) => (
                <>
                  <CreditCard size={size} color={color} />
                  <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Card</Text>
                </>
              )}
            </Button>
          </View>

          {paymentMethod === 'cash' && cart.length > 0 && (
            <View style={{ gap: 8 }}>
              <Text style={styles.tenderLabel}>Amount Tendered</Text>
              <Input keyboardType="numeric" placeholder="Exact Change (Default)" value={tenderedCash} onChangeText={setTenderedCash} style={{ fontFamily: 'monospace', fontSize: 16 }} />
              {tenderedCash !== '' && parseFloat(tenderedCash) >= total && (
                <View style={styles.changeRow}>
                  <Text style={styles.changeText}>Change Due:</Text>
                  <Text style={styles.changeText}>{currency(changeDue)}</Text>
                </View>
              )}
              {tenderedCash !== '' && parseFloat(tenderedCash) < total && (
                <Text style={styles.insufficient}>Insufficient amount! Need {currency(total - parseFloat(tenderedCash))} more.</Text>
              )}
            </View>
          )}

          <Button
            size="lg"
            style={{ height: 56 }}
            disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && tenderedCash !== '' && parseFloat(tenderedCash) < total)}
            onPress={handleCheckout}
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  searchWrap: { position: 'relative', justifyContent: 'center', marginTop: 8 },
  thead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  th: { fontFamily: font.medium, fontWeight: '500', fontSize: 12, color: c.textMuted },
  trow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.gridLine, gap: 8 },
  itemName: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary },
  mono: { fontFamily: 'monospace', fontSize: 12, color: c.textMuted },
  muted: { fontFamily: font.regular, fontSize: 14, color: c.textMuted },
  mutedSm: { fontFamily: font.regular, fontSize: 12, color: c.textMuted },
  price: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary },
  emptyCart: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  cartRow: { paddingHorizontal: 16, paddingVertical: 16, borderTopColor: c.gridLine },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.border, borderRadius: radii.md, overflow: 'hidden' },
  stepBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  stepQty: { width: 40, textAlign: 'center', fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  cartFooter: { padding: 16, gap: 16, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surfaceMuted, borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg },
  rxWarn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, backgroundColor: c.primarySoft, borderRadius: radii.md, borderWidth: 1, borderColor: c.primarySoftBorder },
  rxWarnText: { fontFamily: font.regular, fontSize: 12, color: c.statusSuccessText },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalVal: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  divider: { height: 1, backgroundColor: c.border, marginVertical: 4 },
  tenderLabel: { fontFamily: font.medium, fontWeight: '500', fontSize: 11, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  changeRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: c.primarySoft, padding: 8, borderRadius: radii.md },
  changeText: { fontFamily: font.bold, fontWeight: '700', fontSize: 14, color: c.statusSuccessText },
  insufficient: { fontFamily: font.bold, fontWeight: '700', fontSize: 13, color: c.destructive, padding: 4 },
});
