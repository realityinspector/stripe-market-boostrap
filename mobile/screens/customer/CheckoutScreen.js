import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function CheckoutScreen({ route, navigation }) {
  const { product, quantity = 1 } = route.params;
  const { token } = useAuth();
  const { confirmPayment, createPaymentMethod } = useStripe();
  
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  
  // Calculate amounts
  const subtotal = parseFloat(product.price) * quantity;
  const tax = subtotal * 0.08; // 8% tax (example)
  const total = subtotal + tax;

  useEffect(() => {
    const createIntent = async () => {
      setLoading(true);
      try {
        const response = await api.post('/api/payments/create-payment-intent', {
          productId: product.id,
          quantity
        }, token);
        
        if (response.success) {
          setPaymentIntent(response.clientSecret);
          setOrderId(response.orderId);
        } else {
          Alert.alert('Error', response.message || 'Failed to initialize payment');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error creating payment intent:', error);
        Alert.alert('Error', 'Failed to initialize payment');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    
    createIntent();
  }, [product.id, quantity, token, navigation]);

  const handlePayPress = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please complete your card details');
      return;
    }
    
    if (!paymentIntent) {
      Alert.alert('Error', 'Payment not initialized');
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      const { error, paymentIntent: confirmedPaymentIntent } = await confirmPayment(paymentIntent, {
        type: 'Card'
      });
      
      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (confirmedPaymentIntent) {
        navigation.navigate('PaymentConfirmation', {
          success: true,
          orderId,
          amount: total
        });
      }
    } catch (e) {
      console.error('Payment confirmation error:', e);
      Alert.alert('Error', 'An error occurred while processing your payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.customer} />
        <Text style={styles.loadingText}>Initializing payment...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItem}>
            <View style={styles.orderItemDetails}>
              <Text style={styles.orderItemName}>{product.name}</Text>
              <Text style={styles.orderItemVendor}>
                Sold by: {product.vendor_name}
              </Text>
              <Text style={styles.orderItemQuantity}>Quantity: {quantity}</Text>
            </View>
            <Text style={styles.orderItemPrice}>${parseFloat(product.price).toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <CardField
            postalCodeEnabled={true}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.cardStyle}
            style={styles.cardField}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
          />
          
          <Text style={styles.cardHelpText}>
            <Feather name="info" size={14} color={Colors.textLight} />
            {' '}Test Card: 4242 4242 4242 4242, any future date, any CVC
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price ({quantity} item{quantity > 1 ? 's' : ''})</Text>
            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.secureCheckoutContainer}>
          <Feather name="lock" size={16} color={Colors.textLight} />
          <Text style={styles.secureCheckoutText}>
            Your payment information is secure
          </Text>
        </View>
        
        <Button
          title={processingPayment ? "Processing..." : "Pay Now"}
          onPress={handlePayPress}
          loading={processingPayment}
          disabled={!cardComplete || processingPayment}
          color="primary"
          style={styles.payButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 8,
  },
  orderItemDetails: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textDark,
    marginBottom: 4,
  },
  orderItemVendor: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: Colors.textLight,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    textColor: Colors.textDark,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    fontSize: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  cardHelpText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  priceValue: {
    fontSize: 14,
    color: Colors.textDark,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.customer,
  },
  secureCheckoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  secureCheckoutText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  payButton: {
    marginBottom: 20,
  },
});
