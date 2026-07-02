import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { billService } from '../services/billService';
import { draftService } from '../services/draftService';
import { BillItem, Draft } from '../types';
import { Colors } from '../theme/colors';
import { Plus, Trash2, Save, CheckCircle, User, Phone, Package, Tag, Percent, Hash, FileText } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateBillHTML } from '../utils/pdfTemplate';

export default function CreateBillScreen({ route, navigation }: any) {
  const { user, business } = useAuth();
  const draftData: Draft | undefined = route.params?.draftData;

  const [customerName, setCustomerName] = useState(draftData?.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(draftData?.customer_phone || '');
  const [items, setItems] = useState<BillItem[]>(draftData?.items || []);
  
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemPrice, setItemPrice] = useState('');

  const [discount, setDiscount] = useState(draftData?.discount?.toString() || '');
  const [tax, setTax] = useState(draftData?.tax?.toString() || '');
  const [notes, setNotes] = useState(draftData?.notes || '');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (!itemName || !itemPrice || !itemQty) {
      Alert.alert('Incomplete', 'Please fill all item fields');
      return;
    }
    const qty = parseInt(itemQty);
    const price = parseFloat(itemPrice);
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price < 0) {
      Alert.alert('Invalid', 'Quantity and price must be valid numbers');
      return;
    }

    setItems([...items, { name: itemName, quantity: qty, price }]);
    setItemName(''); setItemQty('1'); setItemPrice('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((acc, i) => acc + i.quantity * i.price, 0);
  const subtotal = calculateSubtotal();
  const total = subtotal - (parseFloat(discount) || 0) + (parseFloat(tax) || 0);

  const getPayload = () => ({
    business_id: business!.id,
    created_by: user!.name,
    customer_name: customerName,
    customer_phone: customerPhone,
    items,
    discount: parseFloat(discount) || 0,
    tax: parseFloat(tax) || 0,
    notes,
  });

  const handleSaveDraft = async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      if (draftData?.id) {
        await draftService.updateDraft(draftData.id, { ...getPayload(), user_id: user?.id });
      } else {
        await draftService.createDraft({ ...getPayload(), user_id: user?.id });
      }
      Alert.alert('Success', 'Draft saved successfully!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (items.length === 0) return Alert.alert('Error', 'Please add at least one item');
    if (!business?.id) return;

    try {
      setLoading(true);
      const newBill = await billService.createBill(getPayload());
      
      Alert.alert(
        'Bill Created! 🎉',
        'Would you like to print or share the invoice?',
        [
          { text: 'No, Thanks', style: 'cancel', onPress: () => navigation.goBack() },
          { 
            text: 'Share / Print', 
            onPress: async () => {
              const html = generateBillHTML(newBill);
              const { uri } = await Print.printToFileAsync({ html });
              await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
              navigation.goBack();
            }
          }
        ]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.title}>{draftData ? 'Resume Draft' : 'New Invoice'}</Text>
        <Text style={styles.subtitle}>Fill details to generate a bill</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Info</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Customer Name (Optional)" placeholderTextColor={Colors.textMuted} value={customerName} onChangeText={setCustomerName} />
          </View>
          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Phone Number (Optional)" placeholderTextColor={Colors.textMuted} value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.quantity} x ₹{item.price.toLocaleString()}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toLocaleString()}</Text>
              <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteBtn}>
                <Trash2 color={Colors.danger} size={18} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Item Form */}
          <View style={styles.addItemForm}>
            <View style={styles.addItemRow}>
              <View style={[styles.inputContainer, { flex: 2, marginRight: 8, marginBottom: 8 }]}>
                <Package size={16} color={Colors.textMuted} style={styles.inputIconSmall} />
                <TextInput style={styles.inputSmall} placeholder="Item Name" placeholderTextColor={Colors.textMuted} value={itemName} onChangeText={setItemName} />
              </View>
              <View style={[styles.inputContainer, { flex: 1, marginBottom: 8 }]}>
                <Tag size={16} color={Colors.textMuted} style={styles.inputIconSmall} />
                <TextInput style={styles.inputSmall} placeholder="Qty" placeholderTextColor={Colors.textMuted} value={itemQty} onChangeText={setItemQty} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.addItemRow}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 8, marginBottom: 0 }]}>
                <Text style={[styles.inputIconSmall, { color: Colors.textMuted }]}>₹</Text>
                <TextInput style={styles.inputSmall} placeholder="Price per unit" placeholderTextColor={Colors.textMuted} value={itemPrice} onChangeText={setItemPrice} keyboardType="numeric" />
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                <Plus color={Colors.primary} size={18} style={{ marginRight: 6 }} />
                <Text style={styles.addBtnText}>Add to Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Totals & Discounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary & Taxes</Text>
          <View style={styles.addItemRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Percent size={16} color={Colors.textMuted} style={styles.inputIconSmall} />
              <TextInput style={styles.inputSmall} placeholder="Discount (₹)" placeholderTextColor={Colors.textMuted} value={discount} onChangeText={setDiscount} keyboardType="numeric" />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Hash size={16} color={Colors.textMuted} style={styles.inputIconSmall} />
              <TextInput style={styles.inputSmall} placeholder="GST Tax (₹)" placeholderTextColor={Colors.textMuted} value={tax} onChangeText={setTax} keyboardType="numeric" />
            </View>
          </View>
          
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRowMain}>
              <Text style={styles.mainTotalLabel}>Grand Total</Text>
              <Text style={styles.mainTotalValue}>₹{Math.max(total, 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <FileText size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Notes or remarks..." placeholderTextColor={Colors.textMuted} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.draftBtn, loading && { opacity: 0.7 }]} onPress={handleSaveDraft} disabled={loading}>
            <Save size={20} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.draftBtnText}>Save Draft</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.createBtn, loading && { opacity: 0.7 }]} onPress={handleCreateBill} disabled={loading}>
            <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.createBtnText}>Generate Bill</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 100 },
  section: { backgroundColor: Colors.bg1, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  inputIcon: { padding: 16, paddingRight: 8 },
  inputIconSmall: { padding: 12, paddingRight: 4 },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 16, paddingRight: 16 },
  inputSmall: { flex: 1, color: Colors.text, fontSize: 14, paddingVertical: 12, paddingRight: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg2, padding: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.text, fontSize: 15, fontWeight: 'bold' },
  itemMeta: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  itemTotal: { color: Colors.text, fontSize: 15, fontWeight: 'bold', marginRight: 16 },
  deleteBtn: { padding: 8, backgroundColor: Colors.danger + '15', borderRadius: 8 },
  addItemForm: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: Colors.border },
  addItemRow: { flexDirection: 'row' },
  addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary + '15', borderRadius: 12, borderWidth: 1, borderColor: Colors.primary + '30', borderStyle: 'dashed' },
  addBtnText: { color: Colors.primary, fontSize: 14, fontWeight: 'bold' },
  totalsBox: { backgroundColor: Colors.bg2, padding: 16, borderRadius: 12, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { color: Colors.textMuted, fontSize: 14 },
  totalValue: { color: Colors.text, fontSize: 14, fontWeight: 'bold' },
  totalRowMain: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderColor: Colors.border },
  mainTotalLabel: { color: Colors.text, fontSize: 18, fontWeight: 'bold' },
  mainTotalValue: { color: Colors.success, fontSize: 20, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  draftBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg1, paddingVertical: 16, borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: Colors.primary },
  draftBtnText: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
  createBtn: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12 },
  createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
