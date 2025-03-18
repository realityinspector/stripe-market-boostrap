import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import ProductDetailsScreen from '../screens/customer/ProductDetailsScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import PaymentConfirmationScreen from '../screens/customer/PaymentConfirmationScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.customer,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Marketplace' }}
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen} 
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen 
        name="PaymentConfirmation" 
        component={PaymentConfirmationScreen} 
        options={{ title: 'Payment Confirmation', headerLeft: null }}
      />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.customer,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
      }}
    >
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen} 
        options={{ title: 'My Orders' }}
      />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.customer,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="OrdersTab" 
        component={OrdersStack} 
        options={{
          tabBarLabel: 'My Orders',
          tabBarIcon: ({ color, size }) => (
            <Feather name="list" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
