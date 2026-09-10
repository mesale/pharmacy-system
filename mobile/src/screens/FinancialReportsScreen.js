import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { DollarSign, Activity, ArrowUpRight, CalendarDays, FileSpreadsheet, BarChart3, Loader2, X } from 'lucide-react-native';
import { font, radii } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from '../components/ui';
import api from '../api';

export default function FinancialReportsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayItems, setDayItems] = useState([]);
  const [loadingDay, setLoadingDay] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDayDetails = async (date) => {
    setSelectedDate(date);
    setLoadingDay(true);
    try {
      const res = await api.get(`/reports/day/${date}`);
      setDayItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDay(false);
    }
  };

  const currency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val));

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
      <View>
        <Text style={styles.h1}>Financial Reports</Text>
        <Text style={styles.subtitle}>Detailed breakdown of sales, revenue, and profit margins.</Text>
      </View>

      {/* Filter Period */}
      <Card>
        <CardHeader style={{ paddingBottom: 16 }}>
          <CardTitle style={{ fontSize: 18 }}>Filter Period</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Start Date</Text>
            <Input placeholder="mm/dd/yyyy" editable={false} value="" />
          </View>
          <View style={{ gap: 8 }}>
            <Text style={styles.label}>End Date</Text>
            <Input placeholder="mm/dd/yyyy" editable={false} value="" />
          </View>
          <Button style={{ alignSelf: 'flex-start' }}>
            {({ color, size }) => (
              <>
                <CalendarDays size={size} color={color} />
                <Text style={{ color, fontFamily: font.medium, fontWeight: '500', fontSize: 14 }}>Generate Report</Text>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : !data ? (
        <Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>Failed to load reports.</Text>
      ) : (
        <>
          <StatCard title="Total Revenue" value={currency(data.summary?.total_revenue || 0)} subtitle="Gross sales" Icon={DollarSign} />
          <StatCard title="Cost of Goods" value={currency(data.summary?.total_cogs || 0)} subtitle="Total inventory cost" valueColor={colors.statusWarning} Icon={BarChart3} />
          <StatCard title="Net Profit" value={currency(data.summary?.total_profit || 0)} subtitle="After unit costs deduction" valueColor={colors.primary} Icon={ArrowUpRight} iconColor={colors.primary} />
          <StatCard title="Transactions" value={`${data.summary?.total_transactions || 0}`} subtitle="Completed sales" Icon={Activity} />

          {/* Daily Ledger */}
          <Card>
            <CardHeader>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={20} color={colors.textMuted} />
                <CardTitle>Daily Ledger Breakdown</CardTitle>
              </View>
              <CardDescription>Tap a row to see the exact products sold on that day.</CardDescription>
            </CardHeader>
            <CardContent style={{ padding: 0 }}>
              <View style={styles.thead}>
                <Text style={[styles.th, { flex: 2 }]}>Date</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>Txns</Text>
                <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Gross Revenue</Text>
              </View>
              {data.dailyData?.length === 0 ? (
                <Text style={[styles.muted, { textAlign: 'center', marginVertical: 24 }]}>No sales recorded for this period.</Text>
              ) : (
                data.dailyData?.map((day) => {
                  const dateStr = new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  return (
                    <TouchableOpacity key={day.date} style={styles.trow} onPress={() => openDayDetails(day.date)}>
                      <Text style={[styles.cellStrong, { flex: 2 }]}>{dateStr}</Text>
                      <Text style={[styles.cellMuted, { flex: 1, textAlign: 'center' }]}>{day.total_transactions}</Text>
                      <Text style={[styles.cellStrong, { flex: 2, textAlign: 'right' }]}>{currency(day.revenue)}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Day details modal */}
      <Modal visible={!!selectedDate} animationType="slide" transparent onRequestClose={() => setSelectedDate(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Sales Detail</Text>
                <Text style={styles.mutedSm}>{selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 16 }}>
              {loadingDay ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
              ) : dayItems.length === 0 ? (
                <Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>No specific products found for this day.</Text>
              ) : (
                <View>
                  <View style={styles.thead}>
                    <Text style={[styles.th, { flex: 3 }]}>Product Name</Text>
                    <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>Qty</Text>
                    <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>Revenue</Text>
                  </View>
                  {dayItems.map((item, idx) => (
                    <View key={idx} style={styles.trow}>
                      <Text style={[styles.cellStrong, { flex: 3 }]}>{item.name}</Text>
                      <Text style={[styles.cellMuted, { flex: 1, textAlign: 'right' }]}>{item.total_quantity}</Text>
                      <Text style={{ flex: 2, textAlign: 'right', fontFamily: font.semibold, fontWeight: '600', fontSize: 14, color: colors.primary }}>{currency(item.total_revenue)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  h1: { fontFamily: font.bold, fontWeight: '700', fontSize: 28, color: c.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: font.regular, fontSize: 14, color: c.textMuted, marginTop: 4 },
  label: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  statCard: { padding: 20 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statTitle: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  statValue: { fontFamily: font.bold, fontWeight: '700', fontSize: 24, marginBottom: 4 },
  statSub: { fontFamily: font.regular, fontSize: 12, color: c.textMuted },
  thead: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
  th: { fontFamily: font.medium, fontWeight: '500', fontSize: 12, color: c.textMuted },
  trow: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.gridLine, alignItems: 'center' },
  cellStrong: { fontFamily: font.medium, fontWeight: '500', fontSize: 14, color: c.textPrimary },
  cellMuted: { fontFamily: font.regular, fontSize: 14, color: c.textMuted },
  muted: { fontFamily: font.regular, fontSize: 14, color: c.textMuted },
  mutedSm: { fontFamily: font.regular, fontSize: 13, color: c.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: c.surfaceBase, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, height: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontFamily: font.bold, fontWeight: '700', fontSize: 18, color: c.textPrimary },
});
