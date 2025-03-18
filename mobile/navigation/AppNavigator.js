import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminNavigator from './AdminNavigator';
import VendorNavigator from './VendorNavigator';
import CustomerNavigator from './CustomerNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading screen while checking authentication state
  if (loading) {
    return null; // Could replace with a loading screen component
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        // User is authenticated, show role-specific navigator
        user.role === 'admin' ? (
          <Stack.Screen name="AdminRoot" component={AdminNavigator} />
        ) : user.role === 'vendor' ? (
          <Stack.Screen name="VendorRoot" component={VendorNavigator} />
        ) : (
          <Stack.Screen name="CustomerRoot" component={CustomerNavigator} />
        )
      ) : (
        // User is not authenticated, show auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
