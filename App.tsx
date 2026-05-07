import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/AuthContext';
import { WebSocketProvider } from './src/store/WebSocketContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WebSocketProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </WebSocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
