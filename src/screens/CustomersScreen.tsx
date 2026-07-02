import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { customerService } from '../services/customerService';
import { Customer } from '../types';
import { Colors } from '../theme/colors';
import { Users, Search, Phone, Mail, Award, MapPin, X, ChevronRight, TrendingUp, ShoppingBag } from 'lucide-react-native';

export default function CustomersScreen() {
  const { business } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      const data = await customerService.listCustomers(business.id);
      setCustomers(data);
    } catch (e) {
      console.log('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => b.total_spend - a.total_spend);
  const topCustomers = [...customers].sort((a, b) => b.total_spend - a.total_spend).slice(0, 3);
  
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spend, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers Directory</Text>
        <Text style={styles.subtitle}>View your customer base and their purchasing habits</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or email..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCustomers} tintColor={Colors.primary} />}
      >
        {/* Analytics Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Users size={20} color={Colors.primary} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Total Customers</Text>
            <Text style={styles.kpiValue}>{totalCustomers}</Text>
          </View>
          <View style={styles.kpiCard}>
            <TrendingUp size={20} color={Colors.success} style={styles.kpiIcon} />
            <Text style={styles.kpiLabel}>Lifetime Value</Text>
            <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString()}</Text>
          </View>
        </View>

        {/* Top Customers (only show if no search) */}
        {!search && topCustomers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Top Customers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topCustomersScroll}>
              {topCustomers.map((customer, index) => (
                <TouchableOpacity key={customer.id} style={styles.topCustomerCard} onPress={() => setSelectedCustomer(customer)}>
                  <View style={styles.topCustomerRank}>
                    <Award size={16} color={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'} />
                    <Text style={[styles.rankNumber, { color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309' }]}>#{index + 1}</Text>
                  </View>
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>{customer.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.topCustomerName} numberOfLines={1}>{customer.name}</Text>
                  <Text style={styles.topCustomerSpend}>₹{customer.total_spend.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>All Customers</Text>
        {sortedCustomers.map(customer => (
          <TouchableOpacity key={customer.id} style={styles.card} onPress={() => setSelectedCustomer(customer)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.customerName}>{customer.name}</Text>
              <Text style={styles.customerPhone}>{customer.phone}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
              <Text style={styles.customerSpend}>₹{customer.total_spend.toLocaleString()}</Text>
              <Text style={styles.customerBills}>{customer.bill_count} bills</Text>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {sortedCustomers.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No customers found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Customer Detail Modal */}
      <Modal visible={!!selectedCustomer} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {selectedCustomer && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Customer Profile</Text>
                <TouchableOpacity onPress={() => setSelectedCustomer(null)}><X size={24} color={Colors.text} /></TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                <View style={styles.profileHeader}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>{selectedCustomer.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.profileName}>{selectedCustomer.name}</Text>
                  <Text style={styles.profileJoined}>Customer since {new Date(selectedCustomer.created_at).toLocaleDateString()}</Text>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.infoRow}>
                    <Phone size={18} color={Colors.textMuted} />
                    <Text style={styles.infoText}>{selectedCustomer.phone}</Text>
                  </View>
                  {selectedCustomer.email ? (
                    <View style={styles.infoRow}>
                      <Mail size={18} color={Colors.textMuted} />
                      <Text style={styles.infoText}>{selectedCustomer.email}</Text>
                    </View>
                  ) : null}
                  {selectedCustomer.billing_address ? (
                    <View style={styles.infoRow}>
                      <MapPin size={18} color={Colors.textMuted} />
                      <Text style={styles.infoText}>{selectedCustomer.billing_address}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Lifetime Value</Text>
                    <Text style={styles.statValue}>₹{selectedCustomer.total_spend.toLocaleString()}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Bills</Text>
                    <Text style={styles.statValue}>{selectedCustomer.bill_count}</Text>
                  </View>
                </View>

                {selectedCustomer.favorite_items && selectedCustomer.favorite_items.length > 0 && (
                  <View style={styles.favoritesSection}>
                    <Text style={styles.favoritesTitle}>Frequently Bought</Text>
                    {selectedCustomer.favorite_items.slice(0, 5).map((item, i) => (
                      <View key={i} style={styles.favoriteItem}>
                        <View style={styles.favoriteIconBox}>
                          <ShoppingBag size={16} color={Colors.primary} />
                        </View>
                        <Text style={styles.favoriteItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.favoriteItemCount}>{item.count}x</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: Colors.text, fontSize: 16 },
  scroll: { padding: 24, paddingBottom: 40 },
  kpiGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  kpiCard: { width: '48%', backgroundColor: Colors.bg1, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  kpiIcon: { marginBottom: 8 },
  kpiLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  kpiValue: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  topCustomersScroll: { paddingBottom: 8 },
  topCustomerCard: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, marginRight: 12, width: 140, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  topCustomerRank: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  rankNumber: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarTextLarge: { color: Colors.primary, fontSize: 24, fontWeight: 'bold' },
  topCustomerName: { color: Colors.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  topCustomerSpend: { color: Colors.success, fontSize: 14, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.primary, fontSize: 18, fontWeight: 'bold' },
  customerName: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  customerPhone: { color: Colors.textMuted, fontSize: 13 },
  customerSpend: { color: Colors.success, fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  customerBills: { color: Colors.textMuted, fontSize: 12 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  
  modalContainer: { flex: 1, backgroundColor: Colors.bg0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  modalScroll: { padding: 24 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  profileAvatarText: { color: Colors.primary, fontSize: 32, fontWeight: 'bold' },
  profileName: { color: Colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  profileJoined: { color: Colors.textMuted, fontSize: 14 },
  infoBox: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  infoText: { color: Colors.text, fontSize: 15, marginLeft: 12 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { width: '48%', backgroundColor: Colors.bg1, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 },
  statValue: { color: Colors.success, fontSize: 24, fontWeight: 'bold' },
  favoritesSection: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 40 },
  favoritesTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  favoriteItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: Colors.border },
  favoriteIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  favoriteItemName: { flex: 1, color: Colors.text, fontSize: 14 },
  favoriteItemCount: { color: Colors.textMuted, fontSize: 14, fontWeight: 'bold' },
});
