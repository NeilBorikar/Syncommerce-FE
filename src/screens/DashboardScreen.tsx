import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { reportService } from '../services/reportService';
import { inventoryService } from '../services/inventoryService';
import { customerService } from '../services/customerService';
import { SalesReport, InventoryItem, Customer } from '../types';
import { Colors } from '../theme/colors';
import { TrendingUp, Package, Users, FileText, AlertCircle, RefreshCw } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }: any) {
  const { user, business } = useAuth();
  const [report, setReport] = useState<SalesReport | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const loadDashboard = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      setError('');
      
      const [reportData, inventoryData, customerData] = await Promise.allSettled([
        reportService.getSalesReport(business.id, thirtyDaysAgo, today),
        inventoryService.getInventory(business.id),
        customerService.listCustomers(business.id),
      ]);

      if (reportData.status === 'fulfilled') setReport(reportData.value);
      if (inventoryData.status === 'fulfilled') setInventory(inventoryData.value);
      if (customerData.status === 'fulfilled') setCustomers(customerData.value);
    } catch (e: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalRevenue = report?.total_sales ?? 0;
  const totalOrders = report?.total_orders ?? 0;
  const totalProducts = inventory.length;
  const totalCustomers = customers.length;
  const lowStockItems = inventory.filter(i => i.quantity <= (i.low_stock_threshold ?? 10));

  const chartLabels = report?.top_products?.slice(0, 5).map(p => p.name.substring(0, 6) + '..') || ['No Data'];
  const chartData = report?.top_products?.slice(0, 5).map(p => p.revenue) || [0];
  const hasChartData = report?.top_products && report.top_products.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Last 30 days performance</Text>
          </View>
          <TouchableOpacity onPress={loadDashboard} style={styles.refreshBtn}>
            <RefreshCw size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDashboard} tintColor={Colors.primary} />}
      >
        {error ? (
          <View style={styles.errorBox}>
            <AlertCircle color={Colors.danger} size={20} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <TrendingUp size={24} color={Colors.primary} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Revenue</Text>
            <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <FileText size={24} color={Colors.accent} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Orders</Text>
            <Text style={styles.kpiValue}>{totalOrders.toLocaleString()}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Users size={24} color={Colors.success} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Customers</Text>
            <Text style={styles.kpiValue}>{totalCustomers.toLocaleString()}</Text>
          </View>
          <View style={[styles.kpiCard, lowStockItems.length > 0 && { borderColor: Colors.danger }]}>
            <Package size={24} color={lowStockItems.length > 0 ? Colors.danger : Colors.textMuted} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Products</Text>
            <Text style={[styles.kpiValue, lowStockItems.length > 0 && { color: Colors.danger }]}>
              {totalProducts.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Products Revenue</Text>
          {hasChartData ? (
            <LineChart
              data={{
                labels: chartLabels,
                datasets: [{ data: chartData }],
              }}
              width={screenWidth - 48}
              height={220}
              yAxisLabel="₹"
              chartConfig={{
                backgroundColor: Colors.bg1,
                backgroundGradientFrom: Colors.bg1,
                backgroundGradientTo: Colors.bg1,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: '4', strokeWidth: '2', stroke: Colors.primary },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          ) : (
            <View style={styles.emptyChart}>
              <TrendingUp size={32} color={Colors.textMuted} style={{ opacity: 0.5, marginBottom: 8 }} />
              <Text style={styles.emptyText}>No sales data yet</Text>
            </View>
          )}
        </View>

        {/* Top Products List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          {hasChartData ? (
            <View style={styles.listCard}>
              {report!.top_products.slice(0, 5).map((p, i) => (
                <View key={i} style={[styles.listItem, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={styles.listRank}>
                    <Text style={styles.rankText}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.itemSub}>{p.quantity} sold</Text>
                  </View>
                  <Text style={styles.itemValue}>₹{p.revenue.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>Create your first bill to see top products</Text>
            </View>
          )}
        </View>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>Low Stock Alert</Text>
            <View style={[styles.listCard, { borderColor: Colors.danger + '40' }]}>
              {lowStockItems.slice(0, 5).map((item, i) => (
                <View key={item.id} style={[styles.listItem, i === 0 && { borderTopWidth: 0 }, { borderColor: Colors.danger + '20' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemSub}>{item.category || 'Uncategorized'}</Text>
                  </View>
                  <View style={styles.dangerBadge}>
                    <Text style={styles.dangerBadgeText}>{item.quantity} left</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  refreshBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bg2, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 24, paddingBottom: 40 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.danger + '20', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: Colors.danger + '40' },
  errorText: { color: Colors.danger, marginLeft: 8, fontSize: 14, flex: 1 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  kpiCard: { width: '48%', backgroundColor: Colors.bg1, padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  kpiIcon: { marginBottom: 12 },
  kpiLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyChart: { height: 220, backgroundColor: Colors.bg1, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyList: { backgroundColor: Colors.bg1, padding: 24, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  listCard: { backgroundColor: Colors.bg1, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderColor: Colors.border },
  listRank: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  rankText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  itemName: { color: Colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  itemSub: { color: Colors.textMuted, fontSize: 12 },
  itemValue: { color: Colors.success, fontSize: 14, fontWeight: 'bold' },
  dangerBadge: { backgroundColor: Colors.danger + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dangerBadgeText: { color: Colors.danger, fontSize: 12, fontWeight: 'bold' },
});