import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function PaymentConfirmationScreen({ route, navigation }) {
  const { success = true, orderId, amount } = route.params || {};
  const { user } = useAuth();
  
  const handleContinueShopping = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTab' }],
    });
  };
  
  const handleViewOrder = () => {
    navigation.navigate('OrdersTab', {
      screen: 'OrderHistory',
      params: { highlightOrderId: orderId }
    });
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {success ? (
        <>
          <View style={styles.iconContainer}>
            <Feather name="check-circle" size={80} color={Colors.success} />
          </View>
          
          <Text style={styles.title}>Payment Successful!</Text>
          
          <Text style={styles.message}>
            Thank you for your purchase. Your order has been successfully processed.
          </Text>
          
          <View style={styles.orderDetailsCard}>
            <Text style={styles.orderDetailsTitle}>Order Details</Text>
            
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Order Number:</Text>
              <Text style={styles.orderDetailValue}>#{orderId}</Text>
            </View>
            
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Amount Paid:</Text>
              <Text style={styles.orderDetailValue}>${parseFloat(amount).toFixed(2)}</Text>
            </View>
            
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Date:</Text>
              <Text style={styles.orderDetailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.orderDetail}>
              <Text style={styles.orderDetailLabel}>Customer:</Text>
              <Text style={styles.orderDetailValue}>{user?.name}</Text>
            </View>
          </View>
          
          <Text style={styles.confirmationMessage}>
            A confirmation email has been sent to your email address. You can view your order details and status in the "My Orders" section.
          </Text>
          
          <View style={styles.buttonsContainer}>
            <Button
              title="View Order"
              onPress={handleViewOrder}
              color="light"
              outline
              style={styles.viewOrderButton}
            />
            
            <Button
              title="Continue Shopping"
              onPress={handleContinueShopping}
              color="primary"
              style={styles.continueButton}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.iconContainer}>
            <Feather name="x-circle" size={80} color={Colors.danger} />
          </View>
          
          <Text style={styles.title}>Payment Failed</Text>
          
          <Text style={styles.message}>
            Unfortunately, your payment could not be processed. Please try again or use a different payment method.
          </Text>
          
          <View style={styles.errorCard}>
            <Feather name="alert-triangle" size={20} color={Colors.danger} />
            <Text style={styles.errorText}>
              If you were charged but did not receive confirmation, please contact customer support.
            </Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <Button
              title="Try Again"
              onPress={() => navigation.goBack()}
              color="primary"
              style={styles.tryAgainButton}
            />
            
            <Button
              title="Continue Shopping"
              onPress={handleContinueShopping}
              color="light"
              outline
              style={styles.continueButton}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  orderDetailsCard: {
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
  orderDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  orderDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  orderDetailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  orderDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  confirmationMessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  viewOrderButton: {
    marginBottom: 12,
  },
  continueButton: {
    marginBottom: 24,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  tryAgainButton: {
    marginBottom: 12,
  },
});
