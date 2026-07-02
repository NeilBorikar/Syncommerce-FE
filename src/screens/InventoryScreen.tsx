import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { InventoryItem } from '../types';
import { Colors } from '../theme/colors';
import { Package, Plus, Search, AlertTriangle, X, Tag, DollarSign, Layers } from 'lucide-react-native';

export default function InventoryScreen() {
  const { business } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      const data = await inventoryService.getInventory(business.id);
      setInventory(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleAddItem = async () => {
    if (!name || !price || !quantity) return Alert.alert('Error', 'Name, Price, and Quantity are required');
    try {
      setSaving(true);
      await inventoryService.addItem({
        business_id: business?.id,
        name,
        sku,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        low_stock_threshold: threshold ? parseInt(threshold, 10) : 10,
      });
      setModalVisible(false);
      setName(''); setSku(''); setCategory(''); setPrice(''); setQuantity(''); setThreshold('');
      loadInventory();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category || 'Uncategorized')))];
  
  const filteredInventory = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || (i.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (i.category || 'Uncategorized') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <Text style={styles.subtitle}>{inventory.length} total items in stock</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or SKU..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryPill, categoryFilter === cat && styles.categoryPillActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.categoryText, categoryFilter === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadInventory} tintColor={Colors.primary} />}
      >
        {filteredInventory.map(item => {
          const isLowStock = item.quantity <= (item.low_stock_threshold ?? 10);
          return (
            <View key={item.id} style={[styles.card, isLowStock && styles.cardLowStock]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, isLowStock && styles.iconBoxDanger]}>
                  <Package size={24} color={isLowStock ? Colors.danger : Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSku}>SKU: {item.sku || 'N/A'} • {item.category || 'Uncategorized'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                  <Text style={[styles.itemQty, isLowStock && styles.itemQtyDanger]}>{item.quantity} in stock</Text>
                </View>
              </View>
              
              {isLowStock && (
                <View style={styles.alertBox}>
                  <AlertTriangle size={16} color={Colors.danger} />
                  <Text style={styles.alertText}>Low stock alert! Restock recommended.</Text>
                </View>
              )}
            </View>
          );
        })}
        {filteredInventory.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items found.</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <View style={styles.inputContainer}>
              <Package size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Product Name *" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputContainer}>
              <Tag size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="SKU (Optional)" placeholderTextColor={Colors.textMuted} value={sku} onChangeText={setSku} autoCapitalize="characters" />
            </View>
            <View style={styles.inputContainer}>
              <Layers size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Category" placeholderTextColor={Colors.textMuted} value={category} onChangeText={setCategory} />
            </View>
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                <DollarSign size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Price *" placeholderTextColor={Colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputIcon, { color: Colors.textMuted, fontSize: 16 }]}>#</Text>
                <TextInput style={styles.input} placeholder="Quantity *" placeholderTextColor={Colors.textMuted} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <AlertTriangle size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Low Stock Alert Threshold (Default: 10)" placeholderTextColor={Colors.textMuted} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleAddItem} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, color: Colors.text, fontSize: 16 },
  categoryScroll: { flexDirection: 'row', paddingBottom: 8 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bg2, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  categoryPillActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  categoryText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  categoryTextActive: { color: Colors.primary },
  scroll: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardLowStock: { borderColor: Colors.danger + '40' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxDanger: { backgroundColor: Colors.danger + '20' },
  itemName: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  itemSku: { color: Colors.textMuted, fontSize: 12 },
  itemPrice: { color: Colors.success, fontSize: 16, fontWeight: 'bold' },
  itemQty: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  itemQtyDanger: { color: Colors.danger, fontWeight: 'bold' },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.danger + '10', padding: 8, borderRadius: 8, marginTop: 12 },
  alertText: { color: Colors.danger, fontSize: 12, marginLeft: 8 },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  
  modalContainer: { flex: 1, backgroundColor: Colors.bg0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  modalScroll: { padding: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg1, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  inputIcon: { padding: 16 },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 16, paddingRight: 16 },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
