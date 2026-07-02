import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { billService } from '../services/billService';
import { Bill } from '../types';
import { Colors } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateBillHTML } from '../utils/pdfTemplate';
import { useWebSocket } from '../store/WebSocketContext';
import { FileText, Plus, Printer, Download, Clock } from 'lucide-react-native';

export default function BillsScreen({ navigation }: any) {
  const { business } = useAuth();
  const { lastEvent } = useWebSocket();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      const data = await billService.getBills(business.id);
      setBills(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Real-time listener
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'BILL_CREATED') {
      const newBill = lastEvent.payload as Bill;
      setBills((prev) => {
        if (prev.find((b) => b.id === newBill.id)) return prev;
        return [newBill, ...prev];
      });
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>All Bills</Text>
            <Text style={styles.subtitle}>{bills.length} total invoices</Text>
          </View>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('CreateBill')}>
            <Plus color="#fff" size={20} />
            <Text style={styles.newBtnText}>New Bill</Text>
          </TouchableOpacity>
        </View>
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
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <FileText size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerName}>{item.customer_name || 'Walk-in Customer'}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={Colors.textMuted} />
                    <Text style={styles.timeText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.billTotal}>₹{item.total.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, item.status === 'final' ? styles.badgeFinal : styles.badgeDraft]}>
                    <Text style={[styles.statusText, item.status === 'final' ? styles.textFinal : styles.textDraft]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.itemCount}>{item.items.length} items</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handlePrint(item)}>
                  <Download size={16} color={Colors.accent} />
                  <Text style={styles.actionText}>PDF / Print</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FileText size={48} color={Colors.textMuted} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>No bills yet</Text>
              <Text style={styles.emptyText}>Create your first bill to see it here.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  newBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  newBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  list: { padding: 24, paddingBottom: 40 },
  card: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  customerName: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { color: Colors.textMuted, fontSize: 12, marginLeft: 4 },
  billTotal: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeFinal: { backgroundColor: Colors.success + '20' },
  badgeDraft: { backgroundColor: Colors.warning + '20' },
  textFinal: { color: Colors.success, fontSize: 10, fontWeight: 'bold' },
  textDraft: { color: Colors.warning, fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderColor: Colors.border },
  itemCount: { color: Colors.textMuted, fontSize: 13 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionText: { color: Colors.accent, fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
