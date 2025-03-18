import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Colors from '../../constants/Colors';

export default function TransactionReportScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    totalVendors: 0,
    totalProducts: 0,
    recentOrders: []
  });
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month

  const fetchReports = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/admin/reports', token);
      if (response.success) {
        setReports(response.reports);
      } else {
        Alert.alert('Error', response.message || 'Failed to load reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Alert.alert('Error', 'Failed to load transaction reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, [fetchReports]);

  const filterOrdersByTime = useCallback(() => {
    if (!reports.recentOrders || timeFilter === 'all') {
      return reports.recentOrders || [];
    }

    const now = new Date();
    const filtered = reports.recentOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      if (timeFilter === 'week') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (timeFilter === 'month') {
        // Last 30 days
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return orderDate >= monthAgo;
      }
      return true;
    });

    return filtered;
  }, [reports.recentOrders, timeFilter]);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
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
              item.status === 'cancelled' ? Colors.danger : Colors.textLight 
          }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Customer: </Text>
          {item.customer_name}
        </Text>
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Vendor: </Text>
          {item.vendor_name}
        </Text>
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Amount: </Text>
          ${parseFloat(item.total_amount).toFixed(2)}
        </Text>
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Commission: </Text>
          ${parseFloat(item.commission_amount).toFixed(2)}
        </Text>
        <Text style={styles.orderDetailText}>
          <Text style={styles.orderDetailLabel}>Date: </Text>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color={Colors.admin} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  const filteredOrders = filterOrdersByTime();

  // Calculate summary stats for the filtered orders
  const filteredStats = {
    totalAmount: filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
    totalCommission: filteredOrders.reduce((sum, order) => sum + parseFloat(order.commission_amount), 0),
    count: filteredOrders.length
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[Colors.admin]}
          tintColor={Colors.admin}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Reports</Text>
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <View style={styles.filtersButtonGroup}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              timeFilter === 'all' && styles.filterButtonActive
            ]}
            onPress={() => setTimeFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              timeFilter === 'all' && styles.filterButtonTextActive
            ]}>All Time</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              timeFilter === 'week' && styles.filterButtonActive
            ]}
            onPress={() => setTimeFilter('week')}
          >
            <Text style={[
              styles.filterButtonText,
              timeFilter === 'week' && styles.filterButtonTextActive
            ]}>Last 7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              timeFilter === 'month' && styles.filterButtonActive
            ]}
            onPress={() => setTimeFilter('month')}
          >
            <Text style={[
              styles.filterButtonText,
              timeFilter === 'month' && styles.filterButtonTextActive
            ]}>Last 30 Days</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Orders</Text>
          <Text style={styles.summaryValue}>{filteredStats.count}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Sales Volume</Text>
          <Text style={styles.summaryValue}>${filteredStats.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Platform Revenue</Text>
          <Text style={styles.summaryValue}>${filteredStats.totalCommission.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
        </View>
        
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.ordersList}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={24} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No transactions found for this period</Text>
            </View>
          }
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
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  filtersContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  filtersButtonGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.admin,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textDark,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
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
  summaryTitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  ordersList: {
    marginTop: 8,
  },
  orderItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingTop: 12,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.textLight,
  },
});
