import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function CustomerLookupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customer Lookup</Text>
      <Text style={styles.text}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  text: { fontSize: 16, color: Colors.textMuted },
});
