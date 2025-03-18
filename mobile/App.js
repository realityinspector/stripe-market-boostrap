import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './contexts/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';

// Load Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.VITE_STRIPE_PUBLIC_KEY || '';

// Check if we have the publishable key
if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Warning: VITE_STRIPE_PUBLIC_KEY is not set. Stripe payments will not work.');
}

// Log which mode we're in (test or live)
const isTestMode = STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_');
console.log(`Stripe initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode in mobile app`);

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.com.marketplace"
        >
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <AppNavigator />
          </NavigationContainer>
        </StripeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
