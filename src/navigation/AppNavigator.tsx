import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../store/AuthContext';
import { Colors } from '../theme/colors';
import { Home, FileText, Clock, Settings as SettingsIcon, Users, BarChart2, Package } from 'lucide-react-native';

// Screens
import WorkspaceAuthScreen from '../screens/WorkspaceAuthScreen';
import UserAuthScreen from '../screens/UserAuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BillsScreen from '../screens/BillsScreen';
import DraftsScreen from '../screens/DraftsScreen';
import CreateBillScreen from '../screens/CreateBillScreen';
import InventoryScreen from '../screens/InventoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomerLookupScreen from '../screens/CustomerLookupScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CustomersScreen from '../screens/CustomersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  const role = user?.role || 'worker';
  
  const isManagerOrOwner = role === 'manager' || role === 'owner';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg0,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      
      {isManagerOrOwner && (
        <Tab.Screen
          name="ReportsTab"
          component={ReportsScreen}
          options={{
            tabBarLabel: 'Reports',
            tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} />,
          }}
        />
      )}
      
      <Tab.Screen
        name="BillsTab"
        component={BillsScreen}
        options={{
          tabBarLabel: 'Bills',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      
      {isManagerOrOwner && (
        <Tab.Screen
          name="EmployeesTab"
          component={EmployeesScreen}
          options={{
            tabBarLabel: 'Team',
            tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
          }}
        />
      )}
      
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, businessToken, userToken } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!businessToken ? (
          <Stack.Screen name="WorkspaceAuth" component={WorkspaceAuthScreen} />
        ) : !userToken ? (
          <Stack.Screen name="UserAuth" component={UserAuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CreateBill" component={CreateBillScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="CustomerLookup" component={CustomerLookupScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
  },
});