import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../store/AuthContext';
import API from '../services/api';
import { Colors } from '../theme/colors';
import { Users, Lock, LogOut } from 'lucide-react-native';

export default function UserAuthScreen() {
  const { loginUser, logoutBusiness, business, usersInBusiness } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    if (!selectedUserEmail || !password) return Alert.alert('Error', 'Select a user and enter password');
    try {
      setLoading(true);
      const res = await API.post(`/auth/user/login?email=${selectedUserEmail}&password=${password}`);
      await loginUser(res.data.access_token, res.data.user);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Users color={Colors.primary} size={40} />
          </View>
          <Text style={styles.title}>Who's working?</Text>
          <Text style={styles.subtitle}>
            Select your profile for {business?.name || 'this workspace'}
          </Text>
        </View>

        {!selectedUserEmail ? (
          <View style={styles.userList}>
            {usersInBusiness.map(u => (
              <TouchableOpacity key={u.id} style={styles.userCard} onPress={() => setSelectedUserEmail(u.email)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userRole}>{u.role}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.selectedEmail}>{selectedUserEmail}</Text>
            <View style={styles.inputContainer}>
              <Lock color={Colors.textMuted} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setSelectedUserEmail(''); setPassword(''); }} style={styles.switchButton}>
              <Text style={styles.switchText}>Back to users</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={logoutBusiness} style={styles.logoutButton}>
          <LogOut color={Colors.danger} size={16} />
          <Text style={styles.logoutText}>Switch Workspace</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg0,
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  userList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
  },
  selectedEmail: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    padding: 16,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
    paddingTop: 40,
    paddingBottom: 20,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
