import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { InventoryItem } from '../types';
import { Colors, Radius, Spacing, FontSize } from '../theme/colors';

import { useWebSocket } from '../store/WebSocketContext';

export default function InventoryScreen() {
  const { business_id } = useAuth();
  const { lastEvent } = useWebSocket();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async (silent = false) => {
    if (!business_id) return;
    try {
      if (!silent) setLoading(true);
      const data = await inventoryService.getLowStock(business_id);
      setItems(data);
    } catch (e) {
      console.log(e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [business_id]);

  // Real-time refresh
  useEffect(() => {
    if (lastEvent?.type === 'INVENTORY_UPDATED') {
      fetchInventory(true); // Silent refresh
    }
  }, [lastEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Low Stock Alerts</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchInventory}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.qty}>{item.quantity} left</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>All stock levels are healthy! 🎉</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg1 },
  header: {
    paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg0, borderBottomWidth: 1, borderColor: Colors.border,
  },
  title: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.warning, fontSize: FontSize.sm, marginTop: 4 },
  list: { padding: Spacing.xl },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bg2, padding: Spacing.lg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  name: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '600' },
  price: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  badge: { backgroundColor: 'rgba(255,90,95,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  qty: { color: Colors.danger, fontSize: FontSize.xs, fontWeight: '700' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: FontSize.md },
});
