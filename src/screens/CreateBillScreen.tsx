import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../store/AuthContext';
import { billService } from '../services/billService';
import { draftService } from '../services/draftService';
import StyledInput from '../components/StyledInput';
import GradientButton from '../components/GradientButton';
import { BillItem, Draft } from '../types';
import { Colors, Radius, Spacing, FontSize } from '../theme/colors';
import { PlusCircle, Trash2, Printer } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateBillHTML } from '../utils/pdfTemplate';

export default function CreateBillScreen({ route, navigation }: any) {
  const { user, business_id } = useAuth();
  
  // Optional draft data passed from DraftsScreen
  const draftData: Draft | undefined = route.params?.draftData;

  const [customerName, setCustomerName] = useState(draftData?.customer_name || '');
  const [customerPhone, setCustomerPhone] = useState(draftData?.customer_phone || '');
  const [items, setItems] = useState<BillItem[]>(draftData?.items || []);
  
  // Temporary item inputs
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
    setItemName('');
    setItemQty('1');
    setItemPrice('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((acc, i) => acc + i.quantity * i.price, 0);
  const subtotal = calculateSubtotal();
  const total = subtotal - (parseFloat(discount) || 0) + (parseFloat(tax) || 0);

  const getPayload = () => ({
    business_id: business_id!,
    created_by: user!.name,
    customer_name: customerName,
    customer_phone: customerPhone,
    items,
    discount: parseFloat(discount) || 0,
    tax: parseFloat(tax) || 0,
    notes,
  });

  const handleSaveDraft = async () => {
    if (!business_id) return;
    try {
      setLoading(true);
      if (draftData?.id) {
        await draftService.updateDraft(draftData.id, { ...getPayload(), user_id: user?.id });
      } else {
        await draftService.createDraft(getPayload());
      }
      Alert.alert('Success', 'Draft saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the bill');
      return;
    }
    if (!business_id) return;

    try {
      setLoading(true);
      const newBill = await billService.createBill(getPayload());
      
      // If we resumed from a draft, it's good practice to delete it or mark it done.
      // Assuming draft isn't deleted automatically, we just proceed.
      
      Alert.alert(
        'Bill Created! 🎉',
        'Would you like to Print or Save it as a PDF now?',
        [
          { text: 'No, Thanks', style: 'cancel', onPress: () => navigation.goBack() },
          { 
            text: 'Print / Save PDF', 
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Text style={styles.title}>{draftData ? 'Resume Draft' : 'New Bill'}</Text>
        <Text style={styles.subtitle}>Fill in details to generate invoice</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <StyledInput label="Name" value={customerName} onChangeText={setCustomerName} placeholder="Walk-in Customer" />
          <StyledInput label="Phone" value={customerPhone} onChangeText={setCustomerPhone} placeholder="Optional" keyboardType="phone-pad" />
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{item.quantity} x ₹{item.price}</Text>
              </View>
              <Text style={styles.itemTotal}>₹{(item.quantity * item.price).toLocaleString('en-IN')}</Text>
              <TouchableOpacity onPress={() => removeItem(index)} style={styles.deleteBtn}>
                <Trash2 color={Colors.danger} size={20} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Item Form */}
          <View style={styles.addItemForm}>
            <StyledInput style={{ flex: 2, marginRight: Spacing.sm, marginBottom: 0 }} placeholder="Item Name" value={itemName} onChangeText={setItemName} />
            <StyledInput style={{ flex: 1, marginRight: Spacing.sm, marginBottom: 0 }} placeholder="Qty" value={itemQty} onChangeText={setItemQty} keyboardType="numeric" />
            <StyledInput style={{ flex: 1.5, marginBottom: 0 }} placeholder="Price" value={itemPrice} onChangeText={setItemPrice} keyboardType="numeric" />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <PlusCircle color={Colors.accent} size={20} style={{ marginRight: 8 }} />
            <Text style={styles.addBtnText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Totals & Discounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StyledInput style={{ flex: 1, marginRight: Spacing.sm }} label="Discount (₹)" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
            <StyledInput style={{ flex: 1 }} label="Tax (₹)" value={tax} onChangeText={setTax} keyboardType="numeric" />
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.totalRowMain}>
            <Text style={styles.mainTotalLabel}>Grand Total</Text>
            <Text style={styles.mainTotalValue}>₹{Math.max(total, 0).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <StyledInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Add a note or remark..." multiline />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <GradientButton variant="ghost" label="Save as Draft" onPress={handleSaveDraft} loading={loading} style={{ flex: 1, marginRight: Spacing.md }} />
          <GradientButton variant="primary" label="Create Bill" onPress={handleCreateBill} loading={loading} style={{ flex: 1.5 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg1 },
  header: {
    paddingTop: 60, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg,
    backgroundColor: Colors.bg0, borderBottomWidth: 1, borderColor: Colors.border,
  },
  title: { color: Colors.textPrimary, fontSize: FontSize.xxl, fontWeight: '800' },
  subtitle: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4 },
  scroll: { padding: Spacing.xl, paddingBottom: 100 },
  section: {
    backgroundColor: Colors.bg2, padding: Spacing.lg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl,
  },
  sectionTitle: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.md, letterSpacing: 0.5 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg3,
    padding: Spacing.md, borderRadius: Radius.md, marginBottom: Spacing.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  itemMeta: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  itemTotal: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '700', marginRight: Spacing.md },
  deleteBtn: { padding: 8, backgroundColor: 'rgba(255,90,95,0.1)', borderRadius: Radius.sm },
  addItemForm: { flexDirection: 'row', marginTop: Spacing.sm },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, marginTop: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.accent, borderStyle: 'dashed',
  },
  addBtnText: { color: Colors.accent, fontSize: FontSize.md, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  totalLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  totalValue: { color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: '600' },
  totalRowMain: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.sm,
    paddingTop: Spacing.md, borderTopWidth: 1, borderColor: Colors.border,
  },
  mainTotalLabel: { color: Colors.textPrimary, fontSize: FontSize.lg, fontWeight: '800' },
  mainTotalValue: { color: Colors.primary, fontSize: FontSize.xl, fontWeight: '900' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
});
