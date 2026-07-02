import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useAuth } from '../store/AuthContext';
import API from '../services/api';
import { Colors } from '../theme/colors';
import { Building2, Mail, Lock, User } from 'lucide-react-native';

export default function WorkspaceAuthScreen() {
  const { loginBusiness } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  const handleAuth = async () => {
    try {
      setLoading(true);
      
      if (isLogin) {
        if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
        const res = await API.post('/auth/business/login', { email, password });
        await loginBusiness(res.data.business_token, res.data.business, res.data.users);
      } else {
        if (!businessName || !ownerName || !ownerEmail || !ownerPassword) {
          return Alert.alert('Error', 'Please fill all fields');
        }
        const payload = {
          business: { name: businessName, email: email, password: password },
          owner_name: ownerName,
          owner_email: ownerEmail,
          owner_password: ownerPassword,
        };
        const res = await API.post('/auth/business/register', payload);
        await loginBusiness(res.data.business_token, res.data.business, []); // Need to fetch users next or handle appropriately
      }
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
            <Building2 color={Colors.primary} size={40} />
          </View>
          <Text style={styles.title}>{isLogin ? 'Login Workspace' : 'Create Workspace'}</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Access your business dashboard' : 'Register your business and owner account'}
          </Text>
        </View>

        <View style={styles.form}>
          {isLogin ? (
            <>
              <View style={styles.inputContainer}>
                <Mail color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
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
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>BUSINESS DETAILS</Text>
              <View style={styles.inputContainer}>
                <Building2 color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  placeholderTextColor={Colors.textMuted}
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Mail color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Lock color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Business Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Text style={styles.sectionTitle}>OWNER DETAILS</Text>
              <View style={styles.inputContainer}>
                <User color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Owner Name"
                  placeholderTextColor={Colors.textMuted}
                  value={ownerName}
                  onChangeText={setOwnerName}
                />
              </View>
              <View style={styles.inputContainer}>
                <Mail color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Owner Email"
                  placeholderTextColor={Colors.textMuted}
                  value={ownerEmail}
                  onChangeText={setOwnerEmail}
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputContainer}>
                <Lock color={Colors.textMuted} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Owner Password"
                  placeholderTextColor={Colors.textMuted}
                  value={ownerPassword}
                  onChangeText={setOwnerPassword}
                  secureTextEntry
                />
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Login to Workspace' : 'Register Business'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have a workspace? Register" : "Already have a workspace? Login"}
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    padding: 24,
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
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  form: {
    width: '100%',
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
    marginTop: 24,
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
});
