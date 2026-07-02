import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { Colors } from '../theme/colors';
import { User, Building2, Shield, LogOut, ChevronRight, RefreshCw, Bell, Lock, Info } from 'lucide-react-native';

export default function SettingsScreen({ navigation }: any) {
  const { user, business, logout, switchWorkspace } = useAuth();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? You will need to log in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleSwitchUser = () => {
    Alert.alert(
      'Switch User',
      'This will take you back to the employee selection screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            // Clear user token but keep business token — handled in AuthContext
            if (switchWorkspace) switchWorkspace('user');
          }
        }
      ]
    );
  };

  const handleSwitchBusiness = () => {
    Alert.alert(
      'Switch Business',
      'This will log you out completely and take you back to the business login screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          style: 'destructive',
          onPress: () => {
            if (switchWorkspace) switchWorkspace('business');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your profile and workspace</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '20' }]}>
              <User size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Full Name</Text>
              <Text style={styles.menuValue}>{user?.name}</Text>
            </View>
          </View>

          <View style={[styles.menuItem, { borderTopWidth: 1, borderColor: Colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Lock size={18} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Email</Text>
              <Text style={styles.menuValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Workspace Section */}
        <Text style={styles.sectionLabel}>WORKSPACE</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Building2 size={18} color={Colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Business Name</Text>
              <Text style={styles.menuValue}>{business?.name || 'N/A'}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.menuItem, { borderTopWidth: 1, borderColor: Colors.border }]} onPress={handleSwitchUser}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '20' }]}>
              <RefreshCw size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Switch User</Text>
              <Text style={styles.menuSubtitle}>Go back to employee selection</Text>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderTopWidth: 1, borderColor: Colors.border }]} onPress={handleSwitchBusiness}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.danger + '20' }]}>
              <Building2 size={18} color={Colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Switch Business</Text>
              <Text style={styles.menuSubtitle}>Log out and use a different workspace</Text>
            </View>
            <ChevronRight size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.success + '20' }]}>
              <Bell size={18} color={Colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Push Notifications</Text>
              <Text style={styles.menuSubtitle}>Receive real-time updates</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={notifications ? '#fff' : Colors.textMuted}
            />
          </View>
        </View>

        {/* App Info */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Info size={18} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>App Version</Text>
              <Text style={styles.menuValue}>Syncommerce v1.0.0</Text>
            </View>
          </View>
          <View style={[styles.menuItem, { borderTopWidth: 1, borderColor: Colors.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Business ID</Text>
              <Text style={styles.menuValue} numberOfLines={1}>{business?.id || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Colors.danger} style={{ marginRight: 12 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: Colors.bg1, borderBottomWidth: 1, borderColor: Colors.border },
  title: { color: Colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 60 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg1, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.border },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileAvatarText: { color: Colors.primary, fontSize: 22, fontWeight: 'bold' },
  profileName: { color: Colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  profileEmail: { color: Colors.textMuted, fontSize: 13 },
  roleBadge: { backgroundColor: Colors.primary + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: Colors.primary, fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 4 },
  menuCard: { backgroundColor: Colors.bg1, borderRadius: 16, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: Colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuTitle: { color: Colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  menuValue: { color: Colors.textMuted, fontSize: 13 },
  menuSubtitle: { color: Colors.textMuted, fontSize: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.danger + '15', borderWidth: 1, borderColor: Colors.danger + '40', paddingVertical: 16, borderRadius: 16, marginTop: 8 },
  logoutText: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' },
});
