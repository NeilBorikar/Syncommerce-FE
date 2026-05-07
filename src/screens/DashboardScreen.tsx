import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../store/AuthContext';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import GradientButton from '../components/GradientButton';
import { Colors, Radius, Spacing, FontSize } from '../theme/colors';
import { useWebSocket } from '../store/WebSocketContext';
import { DollarSign, ShoppingBag } from 'lucide-react-native';

export default function DashboardScreen({ navigation }: any) {
  const { user, business_id } = useAuth();
  const { lastEvent, isConnected } = useWebSocket();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (silent = false) => {
    if (!business_id) return;
    try {
      if (!silent) setLoading(true);
      const data = await reportService.generateReport(business_id);
      setReport(data);
    } catch (e) {
      console.log('Failed to fetch report');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [business_id]);

  // Real-time refresh
  useEffect(() => {
    if (lastEvent?.type === 'BILL_CREATED') {
      fetchReport(true); // Silent refresh
    }
  }, [lastEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name} 👋</Text>
            <Text style={styles.subtitle}>Here is your overview for today</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }]}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF9800' }]} />
            <Text style={[styles.statusText, { color: isConnected ? '#4CAF50' : '#FF9800' }]}>
              {isConnected ? 'Live' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchReport} tintColor={Colors.accent} />
        }
      >
        <View style={styles.metricsGrid}>
          <LinearGradient colors={Colors.gradientPrimary as [string, string]} style={styles.metricCard}>
            <DollarSign color="#fff" size={24} />
            <Text style={styles.metricLabel}>Today's Sales</Text>
            <Text style={styles.metricValue}>
              ₹{report?.total_sales.toLocaleString('en-IN') ?? '0'}
            </Text>
          </LinearGradient>

          <LinearGradient colors={Colors.gradientAccent as [string, string]} style={styles.metricCard}>
            <ShoppingBag color="#fff" size={24} />
            <Text style={styles.metricLabel}>Total Orders</Text>
            <Text style={styles.metricValue}>{report?.total_orders ?? '0'}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <GradientButton
          label="🧾 Create New Bill"
          onPress={() => navigation.navigate('CreateBill')}
          style={styles.actionBtn}
        />
        
        <View style={styles.row}>
          <GradientButton
            variant="ghost"
            label="📄 View Drafts"
            onPress={() => navigation.navigate('Drafts')}
            style={styles.halfBtn}
          />
          <GradientButton
            variant="ghost"
            label="📦 Inventory"
            onPress={() => navigation.navigate('Inventory')}
            style={styles.halfBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg0,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  greeting: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: 4,
  },
  scroll: {
    padding: Spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  metricCard: {
    width: '47%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  metricLabel: {
    color: '#rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  metricValue: {
    color: '#fff',
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  actionBtn: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});