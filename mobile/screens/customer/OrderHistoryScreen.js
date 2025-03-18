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

export default function OrderHistoryScreen({ navigation, route }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const highlightOrderId = route.params?.highlightOrderId;
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, recent, completed

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/orders', token);
      if (response.success) {
        setOrders(response.orders);
        
        // If we have a highlighted order ID, scroll to it
        if (highlightOrderId && response.orders.length > 0) {
          // This is just for highlighting, the actual scrolling would require a ref
          // that we don't implement in this simplified version
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load your order history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, highlightOrderId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const getFilteredOrders = useCallback(() => {
    if (selectedFilter === 'all') {
      return orders;
    }
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    
    if (selectedFilter === 'recent') {
      return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= thirtyDaysAgo;
      });
    }
    
    if (selectedFilter === 'completed') {
      return orders.filter(order => order.status === 'paid' || order.status === 'completed');
    }
    
    return orders;
  }, [orders, selectedFilter]);

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order.id });
  };

  const renderOrderItem = ({ item }) => {
    const isHighlighted = item.id === parseInt(highlightOrderId);
    
    return (
      <TouchableOpacity
        style={[
          styles.orderCard,
          isHighlighted && styles.highlightedOrder
        ]}
        onPress={() => handleOrderPress(item)}
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
        
        <View style={styles.orderInfo}>
          <Text style={styles.vendorName}>Vendor: {item.vendor_name}</Text>
          <Text style={styles.orderDate}>
            Date: {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.orderAmount}>
            Total: ${parseFloat(item.total_amount).toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.orderFooter}>
          <Feather name="chevron-right" size={20} color={Colors.textLight} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.activeFilterButton
        ]}
        onPress={() => setSelectedFilter('all')}
      >
        <Text
          style={[
            styles.filterButtonText,
            selectedFilter === 'all' && styles.activeFilterText
          ]}
        >
          All Orders
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'recent' && styles.activeFilterButton
        ]}
        onPress={() => setSelectedFilter('recent')}
      >
        <Text
          style={[
            styles.filterButtonText,
            selectedFilter === 'recent' && styles.activeFilterText
          ]}
        >
          Last 30 Days
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'completed' && styles.activeFilterButton
        ]}
        onPress={() => setSelectedFilter('completed')}
      >
        <Text
          style={[
            styles.filterButtonText,
            selectedFilter === 'completed' && styles.activeFilterText
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color={Colors.customer} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <View style={styles.container}>
      {renderFilterButtons()}
      
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.customer]}
            tintColor={Colors.customer}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="shopping-bag" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptyMessage}>
              {selectedFilter !== 'all' 
                ? `You don't have any ${selectedFilter === 'recent' ? 'recent' : 'completed'} orders.` 
                : "You haven't placed any orders yet."}
            </Text>
            <TouchableOpacity
              style={styles.shopNowButton}
              onPress={() => navigation.navigate('HomeTab')}
            >
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: Colors.customer,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
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
  highlightedOrder: {
    borderWidth: 2,
    borderColor: Colors.customer,
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
  orderInfo: {
    padding: 16,
  },
  vendorName: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.customer,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    padding: 12,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  shopNowButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.customer,
    borderRadius: 8,
  },
  shopNowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
