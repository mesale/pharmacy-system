import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { DollarSign, Activity, AlertCircle, Package, ShoppingCart, ArrowUpRight } from 'lucide-react-native';
import api from '../api';
import { fonts, font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, Button, Badge } from '../components/ui';

export default function DashboardScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState('weekly');
  const [activeBar, setActiveBar] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, [trend]);

  const fetchDashboard = async () => {
    setLoading(true);
    setActiveBar(null);
    try {
      const res = await api.get(`/dashboard?trend=${trend}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.chartData || [];
  const maxSales = Math.max(...chartData.map(d => d.sales), 100);

  const StatCard = ({ title, value, subtitle, valueColor = colors.textPrimary, Icon, iconColor = colors.textMuted }) => (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        <Text style={styles.statTitle}>{title}</Text>
        <Icon size={16} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statSub}>{subtitle}</Text>
    </Card>
  );

  const QuickAction = ({ Icon, iconBg, iconColor, title, subtitle, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <View style={[styles.quickIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickSub}>{subtitle}</Text>
      </View>
      <ArrowUpRight size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      {/* Page header */}
      <View style={{ gap: 12 }}>
        <View>
          <Text style={styles.h1}>Overview</Text>
          <Text style={styles.subtitle}>Here is what's happening in your pharmacy today.</Text>
        </View>
        <Button variant="outline" size="sm" style={{ alignSelf: 'flex-start' }}>
          {({ size }) => (
            <>
              <Activity size={size} color={colors.primary} />
              <Text style={styles.liveText}>Live Sync Active</Text>
            </>
          )}
        </Button>
      </View>

      {loading && !data ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <>
          <StatCard title="Gross Sales Today" value={`$${data?.grossSalesToday?.toFixed(2) || '0.00'}`} subtitle={`${data?.transactionCountToday || 0} transactions processed`} Icon={DollarSign} />
          <StatCard title="Net Profit" value={`$${data?.netProfitToday?.toFixed(2) || '0.00'}`} subtitle="After unit costs deduction" valueColor={colors.primary} Icon={Activity} />
          <StatCard title="Expiring/Expired Batches" value={`${(data?.expiringBatchesCount || 0) + (data?.expiredBatchesCount || 0)}`} subtitle="Requires immediate audit" valueColor={colors.accentOrange} Icon={AlertCircle} iconColor={colors.accentOrangeIcon} />
          <StatCard title="Low Stock Alerts" value={`${data?.lowStockCount || 0}`} subtitle="Products reached reorder level" valueColor={colors.statusCritical} Icon={Package} iconColor={colors.accentRedIcon} />

          {/* Sales Trend Chart */}
          <Card style={{ padding: 16 }}>
            <View style={styles.chartHeader}>
              <Text style={styles.cardTitle}>Sales Trend</Text>
              <View style={styles.trendButtons}>
                {['weekly', 'monthly', 'yearly'].map((t) => (
                  <TouchableOpacity key={t} onPress={() => setTrend(t)} style={[styles.trendBtn, trend === t && styles.trendBtnActive]}>
                    <Text style={[styles.trendBtnText, trend === t && styles.trendBtnTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 250, flexDirection: 'row', alignItems: 'flex-end', paddingTop: 20 }}>
              <View style={{ justifyContent: 'space-between', height: '100%', paddingRight: 8, paddingBottom: 24 }}>
                <Text style={styles.axisText}>${maxSales}</Text>
                <Text style={styles.axisText}>${Math.round(maxSales * 0.75)}</Text>
                <Text style={styles.axisText}>${Math.round(maxSales * 0.5)}</Text>
                <Text style={styles.axisText}>${Math.round(maxSales * 0.25)}</Text>
                <Text style={styles.axisText}>$0</Text>
              </View>

              <View style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View style={styles.gridLineContainer}><View style={styles.gridLine} /></View>
                <View style={[styles.gridLineContainer, { bottom: '25%' }]}><View style={styles.gridLine} /></View>
                <View style={[styles.gridLineContainer, { bottom: '50%' }]}><View style={styles.gridLine} /></View>
                <View style={[styles.gridLineContainer, { bottom: '75%' }]}><View style={styles.gridLine} /></View>
                <View style={[styles.gridLineContainer, { bottom: '100%' }]}><View style={styles.gridLine} /></View>

                {chartData.map((d, i) => {
                  const heightPercent = (d.sales / maxSales) * 100;
                  const isActive = activeBar === i;
                  return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      {isActive && (
                        <View style={styles.tooltip}>
                          <Text style={styles.tooltipText}>${d.sales.toFixed(0)}</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveBar(isActive ? null : i)}
                        style={{ height: `${Math.max(2, heightPercent)}%`, width: '70%', backgroundColor: colors.chartBar, borderTopLeftRadius: 4, borderTopRightRadius: 4, marginBottom: 24, zIndex: 10 }}
                      />
                      <Text style={[styles.axisText, { position: 'absolute', bottom: 0 }]} numberOfLines={1}>{d.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card style={{ padding: 16, gap: 12 }}>
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <Text style={styles.statSub}>Frequently used modules</Text>
            </View>
            <QuickAction Icon={ShoppingCart} iconBg={colors.primarySoft} iconColor={colors.primary} title="Checkout" subtitle="Process new sale" onPress={() => navigation.navigate('PosScan')} />
            <QuickAction Icon={Package} iconBg={colors.primarySoft} iconColor={colors.primary} title="Inventory" subtitle="Manage stock and medicines" onPress={() => navigation.navigate('Medicines')} />
            <QuickAction Icon={Activity} iconBg={colors.accentPurpleBg} iconColor={colors.accentPurple} title="Financial Reports" subtitle="View detailed analytics" onPress={() => navigation.navigate('Reports')} />
          </Card>

          {/* Attention Required */}
          {(data?.criticalAlerts?.length > 0) && (
            <Card style={{ borderColor: colors.attnBorder }}>
              <View style={styles.attnHeader}>
                <AlertCircle size={20} color={colors.attnIcon} />
                <Text style={styles.attnTitle}>Attention Required</Text>
              </View>
              {data.criticalAlerts.map((alert, i) => {
                const isLow = alert.type === 'low_stock';
                const detail = isLow
                  ? `${alert.current_stock} remaining (Threshold: ${alert.threshold})`
                  : `Batch ${alert.batch_number} (Expires: ${alert.expiry_date})`;
                return (
                  <View key={i} style={[styles.attnRow, { borderTopWidth: i === 0 ? 0 : 1 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {alert.type === 'expired' && <Badge variant="destructive">Expired</Badge>}
                      {alert.type === 'expiring' && <Badge variant="warning">Expiring</Badge>}
                      {isLow && <Badge variant="outline">Low Stock</Badge>}
                      <Text style={styles.attnProduct}>{alert.product}</Text>
                    </View>
                    <Text style={styles.statSub}>{detail}</Text>
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  h1: { fontFamily: font.bold, fontWeight: '700', fontSize: 28, color: c.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: font.regular, fontSize: 14, color: c.textMuted, marginTop: 4 },
  liveText: { fontFamily: font.medium, fontWeight: '500', fontSize: 13, color: c.textPrimary },
  statCard: { padding: 20 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statTitle: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  statValue: { fontFamily: font.bold, fontWeight: '700', fontSize: 24, marginBottom: 4 },
  statSub: { fontFamily: font.regular, fontSize: 12, color: c.textMuted },
  cardTitle: { fontFamily: font.semibold, fontWeight: '600', fontSize: 16, color: c.textPrimary },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  trendButtons: { flexDirection: 'row', borderRadius: radii.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  trendBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRightWidth: 1, borderRightColor: c.border },
  trendBtnActive: { backgroundColor: c.primary },
  trendBtnText: { fontFamily: font.medium, fontSize: 12, color: c.textPrimary },
  trendBtnTextActive: { color: c.primaryForeground },
  axisText: { fontFamily: font.regular, fontSize: 10, color: c.textMuted },
  gridLineContainer: { position: 'absolute', left: 0, right: 0, bottom: 24 },
  gridLine: { borderBottomWidth: 1, borderBottomColor: c.gridLine, width: '100%' },
  tooltip: { position: 'absolute', top: -30, backgroundColor: c.textPrimary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, zIndex: 20 },
  tooltipText: { color: c.background, fontFamily: font.bold, fontSize: 12 },
  quickAction: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radii.md, borderWidth: 1, borderColor: c.border },
  quickIcon: { padding: 8, borderRadius: radii.full },
  quickTitle: { fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: c.textPrimary },
  quickSub: { fontFamily: font.regular, fontSize: 12, color: c.textMuted },
  attnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: c.attnBg, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, borderBottomWidth: 1, borderBottomColor: c.border },
  attnTitle: { fontFamily: font.semibold, fontWeight: '600', fontSize: 16, color: c.attnTitle },
  attnRow: { paddingHorizontal: 16, paddingVertical: 12, borderTopColor: c.gridLine },
  attnProduct: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
});
