import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { billService } from '../services/billService';
import { Bill } from '../types';
import BillCard from '../components/BillCard';
import { Colors, Spacing, FontSize } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateBillHTML } from '../utils/pdfTemplate';
import { useWebSocket } from '../store/WebSocketContext';

export default function BillsScreen() {
  const { business_id } = useAuth();
  const { lastEvent } = useWebSocket();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    if (!business_id) return;
    try {
      setLoading(true);
      const data = await billService.getBills(business_id);
      // Sort newest first
      setBills(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [business_id]);

  // Real-time listener
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'BILL_CREATED') {
      const newBill = lastEvent.payload as Bill;
      // Prepend avoiding duplicates
      setBills((prev) => {
        if (prev.find((b) => b.id === newBill.id)) return prev;
        return [newBill, ...prev];
      });
    }

    if (lastEvent.type === 'BILL_UPDATED') {
      const updatedBill = lastEvent.payload as Bill;
      setBills((prev) => prev.map((b) => (b.id === updatedBill.id ? updatedBill : b)));
    }
  }, [lastEvent]);

  const handlePrint = async (bill: Bill) => {
    try {
      const html = generateBillHTML(bill);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Bills</Text>
        <Text style={styles.subtitle}>Synced across your team</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchBills}
          renderItem={({ item }) => (
            <BillCard data={item} onPress={() => handlePrint(item)} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No bills found. Create one from the dashboard!</Text>
          }
        />
      )}
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
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 4,
  },
  list: {
    padding: Spacing.xl,
  },
  empty: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    fontSize: FontSize.md,
  },
});
