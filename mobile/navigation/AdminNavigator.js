import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import VendorManagementScreen from '../screens/admin/VendorManagementScreen';
import TransactionReportScreen from '../screens/admin/TransactionReportScreen';

// Common Screens
import ProductDetailsScreen from '../screens/customer/ProductDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.admin,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Dashboard' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen} 
        options={{ title: 'Product Details' }}
      />
    </Stack.Navigator>
  );
}

function VendorsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.admin,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="VendorManagement" 
        component={VendorManagementScreen} 
        options={{ title: 'Vendor Management' }}
      />
    </Stack.Navigator>
  );
}

function ReportsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.admin,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="TransactionReport" 
        component={TransactionReportScreen} 
        options={{ title: 'Transaction Reports' }}
      />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.admin,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Vendors" 
        component={VendorsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
