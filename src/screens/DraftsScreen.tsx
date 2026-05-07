import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { draftService } from '../services/draftService';
import BillCard from '../components/BillCard';
import { useWebSocket } from '../store/WebSocketContext';
import { Colors, Spacing, FontSize } from '../theme/colors';

export default function DraftsScreen({ navigation }: any) {
  const { business_id } = useAuth();
  const { lastEvent } = useWebSocket();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!business_id) return;
    try {
      setLoading(true);
      const data = await draftService.getDrafts(business_id);
      setDrafts(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDrafts();
    });
    return unsubscribe;
  }, [navigation, business_id]);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'DRAFT_CREATED' || lastEvent.type === 'DRAFT_UPDATED') {
      const draft = lastEvent.payload as Draft;
      setDrafts((prev) => {
        const exists = prev.find((d) => d.id === draft.id);
        if (exists) {
          // update existing
          return prev.map((d) => (d.id === draft.id ? draft : d));
        }
        // add new
        return [draft, ...prev];
      });
    }

    if (lastEvent.type === 'BILL_CREATED') {
      // If a draft is finalized into a bill, we should probably just re-fetch drafts or wait for next focus.
      // But we can do a lazy refresh here:
      fetchDrafts();
    }
  }, [lastEvent]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Drafts</Text>
        <Text style={styles.subtitle}>Pick up where you or your team left off</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.warning} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchDrafts}
          renderItem={({ item }) => (
            <BillCard
              data={item}
              isDraft
              onPress={() => navigation.navigate('CreateBill', { draftData: item })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No drafts found. All clear!</Text>
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
    color: Colors.warning,
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
