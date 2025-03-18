import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function VendorDashboardScreen({ navigation }) {
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stripeStatus, setStripeStatus] = useState({
    onboardingComplete: false,
    detailsSubmitted: false,
    payoutsEnabled: false,
    stripeAccountId: null
  });
  const [stats, setStats] = useState({
    totalSales: 0,
    orderCount: 0,
    totalCommission: 0,
    recentOrders: []
  });

  const fetchVendorData = useCallback(async () => {
    try {
      // Get Stripe account status
      const stripeResponse = await api.get('/api/vendors/stripe-status', token);
      if (stripeResponse.success) {
        setStripeStatus(stripeResponse);
      }
      
      // Get vendor stats
      const statsResponse = await api.get('/api/vendors/stats/sales', token);
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      Alert.alert('Error', 'Failed to load vendor dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshUser();
    fetchVendorData();
  }, [fetchVendorData, refreshUser]);

  const handleStripeOnboarding = async () => {
    try {
      const response = await api.post('/api/vendors/onboarding', {}, token);
      if (response.success) {
        navigation.navigate('VendorOnboarding', { 
          accountLinkUrl: response.accountLinkUrl,
          stripeAccountId: response.stripeAccountId
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to start onboarding process');
      }
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      Alert.alert('Error', 'Failed to start Stripe Connect onboarding');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color={Colors.vendor} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[Colors.vendor]}
          tintColor={Colors.vendor}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.vendorName}>{user?.name}</Text>
      </View>
      
      {/* Stripe Onboarding Status */}
      <View style={styles.stripeStatusContainer}>
        {!stripeStatus.onboardingComplete ? (
          <View style={styles.stripeIncompleteCard}>
            <View style={styles.stripeStatusHeader}>
              <Feather name="alert-circle" size={24} color={Colors.warning} />
              <Text style={styles.stripeStatusTitle}>Stripe Connect Setup Required</Text>
            </View>
            <Text style={styles.stripeStatusDescription}>
              You need to complete your Stripe Connect setup to receive payments from customers.
            </Text>
            <Button 
              title={stripeStatus.stripeAccountId ? "Continue Setup" : "Start Setup"}
              onPress={handleStripeOnboarding}
              color="primary"
              style={styles.stripeButton}
            />
          </View>
        ) : (
          <View style={styles.stripeCompleteCard}>
            <View style={styles.stripeStatusHeader}>
              <Feather name="check-circle" size={24} color={Colors.success} />
              <Text style={styles.stripeStatusTitle}>Stripe Account Connected</Text>
            </View>
            <Text style={styles.stripeStatusDescription}>
              Your Stripe account is connected and ready to receive payments.
            </Text>
          </View>
        )}
      </View>
      
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsTitle}>Sales Overview</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${parseFloat(stats.totalSales).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Sales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.orderCount}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${parseFloat(stats.totalCommission).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Platform Fees</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${(parseFloat(stats.totalSales) - parseFloat(stats.totalCommission)).toFixed(2)}</Text>
            <Text style={styles.statLabel}>Net Earnings</Text>
          </View>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.actionsTitle}>Quick Actions</Text>
        
        <View style={styles.actionButtonsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E6F2FF' }]}>
              <Feather name="shopping-bag" size={20} color={Colors.vendor} />
            </View>
            <Text style={styles.actionText}>Manage Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E6F9F1' }]}>
              <Feather name="plus" size={20} color={Colors.success} />
            </View>
            <Text style={styles.actionText}>Add Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Transactions')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F2EBFF' }]}>
              <Feather name="credit-card" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.actionText}>View Transactions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              if (stripeStatus.onboardingComplete) {
                // Open Stripe dashboard or account page
                Alert.alert('Stripe Account', 'Navigate to Stripe dashboard.');
              } else {
                handleStripeOnboarding();
              }
            }}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#FFF4E5' }]}>
              <Feather name="settings" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.actionText}>Account Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Recent Orders */}
      <View style={styles.recentOrdersContainer}>
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.recentOrdersTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {stats.recentOrders && stats.recentOrders.length > 0 ? (
          stats.recentOrders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{order.id}</Text>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: 
                      order.status === 'paid' ? Colors.success : 
                      order.status === 'pending' ? Colors.warning :
                      order.status === 'cancelled' ? Colors.danger : Colors.textLight 
                  }
                ]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Customer: </Text>
                  {order.customer_name}
                </Text>
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Amount: </Text>
                  ${parseFloat(order.total_amount).toFixed(2)}
                </Text>
                <Text style={styles.orderDetailText}>
                  <Text style={styles.orderDetailLabel}>Date: </Text>
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyOrders}>
            <Feather name="shopping-cart" size={40} color={Colors.lightGray} />
            <Text style={styles.emptyOrdersText}>No orders yet</Text>
          </View>
        )}
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
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textLight,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  stripeStatusContainer: {
    marginBottom: 24,
  },
  stripeIncompleteCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  stripeCompleteCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  stripeStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stripeStatusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginLeft: 8,
  },
  stripeStatusDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  stripeButton: {
    marginTop: 8,
  },
  statsContainer: {
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
  statsHeader: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.vendor,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 16,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  recentOrdersContainer: {
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
  recentOrdersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentOrdersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.vendor,
    fontWeight: '500',
  },
  emptyOrders: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyOrdersText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  orderItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 8,
  },
  orderDetailText: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 4,
  },
  orderDetailLabel: {
    fontWeight: '500',
    color: Colors.textLight,
  },
});
