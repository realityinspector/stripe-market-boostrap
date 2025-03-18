import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Colors from '../../constants/Colors';

export default function VendorTransactionsScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending, completed, cancelled

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/vendor/orders', token);
      if (response.success) {
        setOrders(response.orders);
      } else {
        Alert.alert('Error', response.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const filterOrdersByStatus = useCallback(() => {
    if (filterStatus === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === filterStatus);
  }, [orders, filterStatus]);

  // Calculate summary statistics
  const getSummaryStats = useCallback(() => {
    return orders.reduce((stats, order) => {
      const amount = parseFloat(order.total_amount) || 0;
      const commission = parseFloat(order.commission_amount) || 0;
      
      stats.totalSales += amount;
      stats.totalCommission += commission;
      
      if (order.status === 'paid') {
        stats.paidOrdersCount += 1;
        stats.earnedAmount += (amount - commission);
      }
      
      return stats;
    }, {
      totalSales: 0,
      totalCommission: 0,
      paidOrdersCount: 0,
      earnedAmount: 0
    });
  }, [orders]);

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'paid' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('paid')}
        >
          <Text style={[styles.filterText, filterStatus === 'paid' && styles.filterTextActive]}>
            Paid
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('completed')}
        >
          <Text style={[styles.filterText, filterStatus === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterButton, filterStatus === 'cancelled' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('cancelled')}
        >
          <Text style={[styles.filterText, filterStatus === 'cancelled' && styles.filterTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderOrderItem = ({ item }) => {
    const orderAmount = parseFloat(item.total_amount);
    const commissionAmount = parseFloat(item.commission_amount);
    const netAmount = orderAmount - commissionAmount;
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: 
                item.status === 'paid' ? Colors.success : 
                item.status === 'pending' ? Colors.warning :
                item.status === 'completed' ? Colors.info :
                item.status === 'cancelled' ? Colors.danger : Colors.textLight 
            }
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.orderDetails}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Customer:</Text>
            <Text style={styles.orderValue}>{item.customer_name}</Text>
          </View>
          
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Date:</Text>
            <Text style={styles.orderValue}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.amountContainer}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Order Total</Text>
              <Text style={styles.amountValue}>${orderAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>Commission</Text>
              <Text style={styles.amountValue}>-${commissionAmount.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.amountItem, styles.netAmountItem]}>
              <Text style={styles.netAmountLabel}>Net Amount</Text>
              <Text style={styles.netAmountValue}>${netAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="credit-card" size={64} color={Colors.lightGray} />
      <Text style={styles.emptyTitle}>No orders found</Text>
      <Text style={styles.emptyMessage}>
        {filterStatus !== 'all' 
          ? `You don't have any ${filterStatus} orders yet.` 
          : "You haven't received any orders yet."}
      </Text>
    </View>
  );

  // Calculate summary stats
  const stats = getSummaryStats();
  const filteredOrders = filterOrdersByStatus();

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Sales</Text>
            <Text style={styles.summaryValue}>${stats.totalSales.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Paid Orders</Text>
            <Text style={styles.summaryValue}>{stats.paidOrdersCount}</Text>
          </View>
        </View>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Platform Fees</Text>
            <Text style={styles.summaryValue}>${stats.totalCommission.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Earnings</Text>
            <Text style={styles.summaryValue}>${stats.earnedAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
      
      {renderStatusFilter()}
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.vendor]}
            tintColor={Colors.vendor}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryContainer: {
    backgroundColor: Colors.vendor,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.vendor,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
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
    padding: 16,
  },
  orderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.textLight,
    width: 80,
  },
  orderValue: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  amountContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 12,
  },
  amountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  amountValue: {
    fontSize: 14,
    color: Colors.textDark,
  },
  netAmountItem: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 8,
  },
  netAmountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  netAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.vendor,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
