import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator,
  Alert,
  Linking,
  BackHandler
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function VendorOnboardingScreen({ route, navigation }) {
  const { token, refreshUser } = useAuth();
  const { accountLinkUrl, stripeAccountId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (webViewVisible) {
          setWebViewVisible(false);
          return true;
        }
        return false;
      }
    );
    return () => backHandler.remove();
  }, [webViewVisible]);

  const checkStripeStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await api.get('/api/vendors/stripe-status', token);
      if (response.success) {
        if (response.onboardingComplete) {
          Alert.alert(
            'Success!',
            'Your Stripe account setup is complete. You can now accept payments.',
            [
              {
                text: 'OK',
                onPress: () => {
                  refreshUser();
                  navigation.navigate('VendorDashboard');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Onboarding Incomplete',
            'Your Stripe account setup is not yet complete. Would you like to continue setup?',
            [
              {
                text: 'Later',
                style: 'cancel',
                onPress: () => navigation.navigate('VendorDashboard')
              },
              {
                text: 'Continue',
                onPress: handleStartOnboarding
              }
            ]
          );
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to check Stripe account status');
      }
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      Alert.alert('Error', 'Failed to check Stripe account status');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleStartOnboarding = async () => {
    setLoading(true);
    try {
      // If we already have an account link URL from route params, use it
      if (accountLinkUrl) {
        setWebViewVisible(true);
        setLoading(false);
        return;
      }

      // Otherwise, request a new one
      const response = await api.post('/api/vendors/onboarding', {}, token);
      if (response.success) {
        setWebViewVisible(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to start onboarding process');
      }
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      Alert.alert('Error', 'Failed to start Stripe Connect onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (newNavState) => {
    // Check if the URL includes the return URL to detect completion
    const { url } = newNavState;
    if (url.includes('/vendor/onboarding/complete')) {
      setWebViewVisible(false);
      checkStripeStatus();
    } else if (url.includes('/vendor/onboarding/refresh')) {
      // The session expired, need to refresh the link
      setWebViewVisible(false);
      handleStartOnboarding();
    }
  };

  if (webViewVisible) {
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: accountLinkUrl }}
          style={styles.webView}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={Colors.vendor} />
            </View>
          )}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Feather name="credit-card" size={60} color={Colors.vendor} style={styles.icon} />
        
        <Text style={styles.title}>Stripe Connect Onboarding</Text>
        
        <Text style={styles.description}>
          To receive payments from customers, you need to connect your Stripe account.
          This process is secure and managed by Stripe.
        </Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What will happen next:</Text>
          <View style={styles.infoItem}>
            <Feather name="check" size={16} color={Colors.success} style={styles.infoIcon} />
            <Text style={styles.infoText}>You'll be redirected to Stripe's secure website</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="check" size={16} color={Colors.success} style={styles.infoIcon} />
            <Text style={styles.infoText}>Provide your business and banking information</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="check" size={16} color={Colors.success} style={styles.infoIcon} />
            <Text style={styles.infoText}>Once complete, you'll be returned to the app</Text>
          </View>
        </View>
        
        <Button
          title="Start Stripe Onboarding"
          onPress={handleStartOnboarding}
          loading={loading}
          color="primary"
          style={styles.button}
          icon={<Feather name="external-link" size={18} color="#FFFFFF" />}
        />
        
        {stripeAccountId ? (
          <Button
            title="Check Account Status"
            onPress={checkStripeStatus}
            loading={checkingStatus}
            color="light"
            outline
            style={styles.checkButton}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  checkButton: {
    width: '100%',
  },
  webView: {
    flex: 1,
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
