import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { employeeService } from '../services/employeeService';
import { Employee } from '../types';
import { Colors } from '../theme/colors';
import { Users, Plus, Mail, Lock, User as UserIcon, Trash2, Search, X } from 'lucide-react-native';

export default function EmployeesScreen() {
  const { user, business } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'worker'>('worker');
  const [saving, setSaving] = useState(false);

  const loadEmployees = useCallback(async () => {
    if (!business?.id) return;
    try {
      setLoading(true);
      const data = await employeeService.listEmployees(business.id);
      setEmployees(data);
    } catch (e) {
      Alert.alert('Error', 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleAddEmployee = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill all fields');
    try {
      setSaving(true);
      await employeeService.addEmployee({
        business_id: business?.id,
        name,
        email,
        password,
        role,
        salary: 0,
        status: 'active',
      });
      setModalVisible(false);
      setName(''); setEmail(''); setPassword(''); setRole('worker');
      loadEmployees();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Employee', 'Are you sure you want to remove this employee?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await employeeService.deleteEmployee(id, true);
            loadEmployees();
          } catch (e: any) {
            Alert.alert('Error', 'Failed to delete employee');
          }
        }
      }
    ]);
  };

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Members</Text>
        <Text style={styles.subtitle}>Manage your staff and their roles</Text>
        
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEmployees} tintColor={Colors.primary} />}
      >
        {filteredEmployees.map(emp => (
          <View key={emp.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{emp.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.empName}>{emp.name}</Text>
                <Text style={styles.empEmail}>{emp.email}</Text>
              </View>
              <View style={[styles.roleBadge, emp.role === 'owner' ? styles.badgeOwner : emp.role === 'manager' ? styles.badgeManager : styles.badgeWorker]}>
                <Text style={[styles.roleText, emp.role === 'owner' ? styles.textOwner : emp.role === 'manager' ? styles.textManager : styles.textWorker]}>
                  {emp.role}
                </Text>
              </View>
            </View>
            
            {isOwner && emp.id !== user?.id && (
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleDelete(emp.id)} style={styles.deleteBtn}>
                  <Trash2 size={16} color={Colors.danger} />
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {(isOwner || isManager) && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add Employee Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Employee</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={Colors.text} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll}>
            <View style={styles.inputContainer}>
              <UserIcon size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
            </View>
            
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            </View>
            
            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Temporary Password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleSelector}>
              {isOwner && (
                <TouchableOpacity 
                  style={[styles.roleOption, role === 'manager' && styles.roleOptionActive]} 
                  onPress={() => setRole('manager')}
                >
                  <Text style={[styles.roleOptionText, role === 'manager' && styles.roleOptionTextActive]}>Manager</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={[styles.roleOption, role === 'worker' && styles.roleOptionActive]} 
                onPress={() => setRole('worker')}
              >
                <Text style={[styles.roleOptionText, role === 'worker' && styles.roleOptionTextActive]}>Worker</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleAddEmployee} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Adding...' : 'Add Employee'}</Text>
            </TouchableOpacity>
          </ScrollView>
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
  scroll: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: Colors.bg1, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: Colors.primary, fontSize: 20, fontWeight: 'bold' },
  empName: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  empEmail: { color: Colors.textMuted, fontSize: 13 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeOwner: { backgroundColor: '#eab30820' },
  textOwner: { color: '#eab308', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeManager: { backgroundColor: Colors.primary + '20' },
  textManager: { color: Colors.primary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  badgeWorker: { backgroundColor: Colors.success + '20' },
  textWorker: { color: Colors.success, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: Colors.border },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: Colors.danger + '10' },
  deleteText: { color: Colors.danger, fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  
  modalContainer: { flex: 1, backgroundColor: Colors.bg0 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: Colors.border },
  modalTitle: { color: Colors.text, fontSize: 20, fontWeight: 'bold' },
  modalScroll: { padding: 24 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg1, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  inputIcon: { padding: 16 },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 16, paddingRight: 16 },
  roleLabel: { color: Colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  roleOption: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: Colors.bg1, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  roleOptionActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary },
  roleOptionText: { color: Colors.textMuted, fontSize: 14, fontWeight: '600' },
  roleOptionTextActive: { color: Colors.primary },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
