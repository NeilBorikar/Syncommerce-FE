import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../store/AuthContext';
import GradientButton from '../components/GradientButton';
import { Colors, Radius, Spacing, FontSize } from '../theme/colors';
import { UserCircle } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <UserCircle size={60} color={Colors.primary} style={{ marginBottom: Spacing.md }} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <GradientButton
          variant="danger"
          label="Log Out"
          onPress={logout}
          style={{ marginTop: 'auto' }}
        />
      </View>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  profileCard: {
    backgroundColor: Colors.bg2,
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  name: {
    color: Colors.textPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  email: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    marginTop: 4,
  },
  roleBadge: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  roleText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
