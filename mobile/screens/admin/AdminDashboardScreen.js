import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Colors from '../../constants/Colors';

export default function AdminDashboardScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalOrders: 0,
    totalVendors: 0,
    totalProducts: 0,
    recentOrders: []
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/api/payments/admin/reports', token);
      if (response.success) {
        setStats(response.reports);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.id}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'paid' ? Colors.success : Colors.warning }
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
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color={Colors.admin} />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        {renderStatCard(
          'Total Revenue', 
          `$${parseFloat(stats.totalRevenue).toFixed(2)}`,
          'dollar-sign',
          Colors.success
        )}
        {renderStatCard(
          'Total Sales', 
          `$${parseFloat(stats.totalSales).toFixed(2)}`,
          'shopping-cart',
          Colors.primary
        )}
        {renderStatCard(
          'Orders', 
          stats.totalOrders,
          'package',
          Colors.info
        )}
        {renderStatCard(
          'Vendors', 
          stats.totalVendors,
          'users',
          Colors.secondary
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={stats.recentOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.ordersList}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="inbox" size={24} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No orders yet</Text>
            </View>
          }
        />
      </View>
      
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.admin }]}
          onPress={() => navigation.navigate('Vendors')}
        >
          <Feather name="users" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Manage Vendors</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors.info }]}
          onPress={() => navigation.navigate('Reports')}
        >
          <Feather name="bar-chart-2" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>View Reports</Text>
        </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
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
  statIconContainer: {
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
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
  seeAllText: {
    fontSize: 14,
    color: Colors.admin,
    fontWeight: '500',
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.admin,
    borderRadius: 8,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});
