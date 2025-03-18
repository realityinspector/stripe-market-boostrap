import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Colors from '../../constants/Colors';
import VendorCard from '../../components/VendorCard';

export default function VendorManagementScreen({ navigation }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  const fetchVendors = useCallback(async () => {
    try {
      const response = await api.get('/api/vendors', token);
      if (response.success) {
        setVendors(response.vendors);
        setFilteredVendors(response.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      Alert.alert('Error', 'Failed to load vendors');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(vendor => 
        vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
  }, [searchQuery, vendors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVendors();
  }, [fetchVendors]);

  const handleVendorPress = (vendor) => {
    // Navigate to vendor details or edit screen
    Alert.alert(
      'Vendor Options',
      `${vendor.business_name}`,
      [
        {
          text: 'View Products',
          onPress: () => navigation.navigate('ProductList', { vendorId: vendor.id }),
        },
        {
          text: 'Edit Commission Rate',
          onPress: () => showCommissionModal(vendor),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const showCommissionModal = (vendor) => {
    let newRate = vendor.commission_rate.toString();
    
    Alert.prompt(
      'Edit Commission Rate',
      'Enter new commission rate (0-100%)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (input) => {
            if (input) {
              const rate = parseFloat(input);
              if (isNaN(rate) || rate < 0 || rate > 100) {
                Alert.alert('Invalid Rate', 'Commission rate must be between 0 and 100');
                return;
              }
              
              try {
                const response = await api.patch(
                  `/api/vendors/${vendor.id}/commission`,
                  { commissionRate: rate },
                  token
                );
                
                if (response.success) {
                  Alert.alert('Success', 'Commission rate updated successfully');
                  fetchVendors(); // Refresh the list
                } else {
                  Alert.alert('Error', response.message || 'Failed to update commission rate');
                }
              } catch (error) {
                console.error('Error updating commission:', error);
                Alert.alert('Error', 'Failed to update commission rate');
              }
            }
          },
        },
      ],
      'plain-text',
      newRate
    );
  };

  const renderVendor = ({ item }) => (
    <VendorCard 
      vendor={item} 
      onPress={handleVendorPress}
      style={styles.vendorCard}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Feather name="loader" size={24} color={Colors.admin} />
        <Text style={styles.loadingText}>Loading vendors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={filteredVendors}
        renderItem={renderVendor}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[Colors.admin]}
            tintColor={Colors.admin}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No vendors found</Text>
            {searchQuery ? (
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            ) : null}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.textDark,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  vendorCard: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textLight,
  },
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
