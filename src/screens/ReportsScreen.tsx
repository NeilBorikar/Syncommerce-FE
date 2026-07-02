import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { reportService } from '../services/reportService';
import { SalesReport } from '../types';
import { Colors } from '../theme/colors';
import { BarChart2, TrendingUp, DollarSign, Calendar, Users, Package } from 'lucide-react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function ReportsScreen() {
  const { business } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date range defaults to last 30 days
  const [dateRange, setDateRange] = useState('30days'); // '7days' | '30days' | 'all'

  const loadReport = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      
      const today = new Date();
      let fromDate = new Date();
      if (dateRange === '7days') fromDate.setDate(today.getDate() - 7);
      else if (dateRange === '30days') fromDate.setDate(today.getDate() - 30);
      else fromDate = new Date(2020, 0, 1); // "All time"

      const data = await reportService.getSalesReport(
        business.id,
        fromDate.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      setReport(data);
    } catch (e) {
      console.log('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [business?.id, dateRange]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const chartLabels = report?.top_products?.slice(0, 4).map(p => p.name.substring(0, 5) + '..') || ['No Data'];
  const chartData = report?.top_products?.slice(0, 4).map(p => p.quantity) || [0];
  const hasChartData = report?.top_products && report.top_products.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Reports</Text>
        <Text style={styles.subtitle}>Analyze your store's performance</Text>
        
        <View style={styles.dateFilters}>
          {['7days', '30days', 'all'].map((range) => (
            <TouchableOpacity 
              key={range} 
              style={[styles.filterBtn, dateRange === range && styles.filterBtnActive]}
              onPress={() => setDateRange(range)}
            >
              <Text style={[styles.filterText, dateRange === range && styles.filterTextActive]}>
                {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadReport} tintColor={Colors.primary} />}
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
              <TrendingUp size={20} color={Colors.primary} />
            </View>
            <Text style={styles.kpiLabel}>Total Sales</Text>
            <Text style={styles.kpiValue}>₹{report?.total_sales?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: Colors.accent + '20' }]}>
              <Package size={20} color={Colors.accent} />
            </View>
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue}>{report?.total_orders?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: Colors.success + '20' }]}>
              <DollarSign size={20} color={Colors.success} />
            </View>
            <Text style={styles.kpiLabel}>Profit</Text>
            <Text style={styles.kpiValue}>₹{report?.total_profit?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.iconBox, { backgroundColor: Colors.warning + '20' }]}>
              <BarChart2 size={20} color={Colors.warning} />
            </View>
            <Text style={styles.kpiLabel}>GST Collected</Text>
            <Text style={styles.kpiValue}>₹{report?.gst_total?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Top Products Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products (Units Sold)</Text>
          {hasChartData ? (
            <BarChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData }],
              }}
              width={screenWidth - 48}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: Colors.bg1,
                backgroundGradientFrom: Colors.bg1,
                backgroundGradientTo: Colors.bg1,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: { borderRadius: 16 },
                barPercentage: 0.6,
              }}
              style={{ marginVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: Colors.border }}
            />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Not enough data to display chart.</Text>
            </View>
          )}
        </View>

        {/* Employee Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Performance</Text>
          {report?.employee_performance && report.employee_performance.length > 0 ? (
            <View style={styles.listCard}>
              {report.employee_performance.map((emp, i) => (
                <View key={i} style={[styles.listItem, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={styles.empAvatar}>
                    <Text style={styles.empAvatarText}>{emp.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.empName} numberOfLines={1}>{emp.name}</Text>
                    <Text style={styles.empSub}>{emp.bills_created} bills created</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.empSales}>₹{emp.sales_generated?.toLocaleString() || '0'}</Text>
                    <Text style={styles.empAvg}>Avg ₹{Math.round(emp.avg_bill || 0)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Users size={32} color={Colors.textMuted} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Text style={styles.emptyText}>No employee sales recorded for this period.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 16 },
  dateFilters: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: Colors.bg2, borderWidth: 1, borderColor: Colors.border },
  filterBtnActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.primary },
  scroll: { padding: 24, paddingBottom: 40 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  kpiCard: { width: '48%', backgroundColor: Colors.bg1, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpiLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyBox: { height: 160, backgroundColor: Colors.bg1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  listCard: { backgroundColor: Colors.bg1, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: Colors.border },
  empAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accent + '20', justifyContent: 'center', alignItems: 'center' },
  empAvatarText: { color: Colors.accent, fontSize: 16, fontWeight: 'bold' },
  empName: { color: Colors.text, fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  empSub: { color: Colors.textMuted, fontSize: 12 },
  empSales: { color: Colors.success, fontSize: 15, fontWeight: 'bold' },
  empAvg: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});
