import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Vendor Screens
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import VendorOnboardingScreen from '../screens/vendor/VendorOnboardingScreen';
import ProductManagementScreen from '../screens/vendor/ProductManagementScreen';
import AddProductScreen from '../screens/vendor/AddProductScreen';
import VendorTransactionsScreen from '../screens/vendor/VendorTransactionsScreen';

// Common Screens
import ProductDetailsScreen from '../screens/customer/ProductDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.vendor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="VendorDashboard" 
        component={VendorDashboardScreen} 
        options={{ title: 'Vendor Dashboard' }}
      />
      <Stack.Screen 
        name="VendorOnboarding" 
        component={VendorOnboardingScreen} 
        options={{ title: 'Stripe Connect Onboarding' }}
      />
    </Stack.Navigator>
  );
}

function ProductsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.vendor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="ProductManagement" 
        component={ProductManagementScreen} 
        options={{ title: 'My Products' }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ title: 'Add Product' }}
      />
      <Stack.Screen 
        name="EditProduct" 
        component={AddProductScreen} 
        options={{ title: 'Edit Product' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen} 
        options={{ title: 'Product Details' }}
      />
    </Stack.Navigator>
  );
}

function TransactionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.vendor,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="VendorTransactions" 
        component={VendorTransactionsScreen} 
        options={{ title: 'My Transactions' }}
      />
    </Stack.Navigator>
  );
}

export default function VendorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.vendor,
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
        name="Products" 
        component={ProductsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsStack} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="credit-card" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
