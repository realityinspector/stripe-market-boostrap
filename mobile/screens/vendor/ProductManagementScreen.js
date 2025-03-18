import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function ProductManagementScreen({ navigation, route }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if a product was updated or added from the add/edit screen
  useEffect(() => {
    if (route.params?.productUpdated) {
      // Refresh the product list
      fetchProducts();
      // Clear the parameter to avoid endless refreshes
      navigation.setParams({ productUpdated: undefined });
    }
  }, [route.params?.productUpdated, fetchProducts, navigation]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/api/products/my-products', token);
      if (response.success) {
        setProducts(response.products);
        setFilteredProducts(response.products);
      } else {
        Alert.alert('Error', response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  const handleEditProduct = (product) => {
    navigation.navigate('EditProduct', { product });
  };

  const toggleProductActive = async (product) => {
    try {
      const updatedProduct = { ...product, active: !product.active };
      const response = await api.put(`/api/products/${product.id}`, updatedProduct, token);
      
      if (response.success) {
        // Update local state to reflect the change
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === product.id ? response.product : p)
        );
        
        Alert.alert(
          'Success', 
          `Product ${updatedProduct.active ? 'activated' : 'deactivated'} successfully`
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error toggling product status:', error);
      Alert.alert('Error', 'Failed to update product status');
    }
  };

  const handleDeleteProduct = (product) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${product.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.del(`/api/products/${product.id}`, token);
              
              if (response.success) {
                // Remove the deleted product from local state
                setProducts(prevProducts => 
                  prevProducts.filter(p => p.id !== product.id)
                );
                
                Alert.alert('Success', 'Product deleted successfully');
              } else {
                Alert.alert('Error', response.message || 'Failed to delete product');
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.active ? Colors.success : Colors.textLight }
        ]}>
          <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
      
      {item.description ? (
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      
      <View style={styles.productActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]} 
          onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
        >
          <Feather name="eye" size={16} color={Colors.vendor} />
          <Text style={styles.actionButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => handleEditProduct(item)}
        >
          <Feather name="edit-2" size={16} color={Colors.info} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, item.active ? styles.deactivateButton : styles.activateButton]} 
          onPress={() => toggleProductActive(item)}
        >
          <Feather name={item.active ? "eye-off" : "eye"} size={16} color={item.active ? Colors.warning : Colors.success} />
          <Text style={styles.actionButtonText}>{item.active ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteProduct(item)}
        >
          <Feather name="trash-2" size={16} color={Colors.danger} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.vendor} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          onClear={handleClearSearch}
          style={styles.searchBar}
        />
        <Button
          title="Add Product"
          onPress={handleAddProduct}
          color="primary"
          icon={<Feather name="plus" size={18} color="#FFFFFF" />}
          style={styles.addButton}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="shopping-bag" size={48} color={Colors.lightGray} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No products matching your search' : 'No products yet'}
            </Text>
            {!searchQuery && (
              <Button
                title="Add Your First Product"
                onPress={handleAddProduct}
                color="primary"
                icon={<Feather name="plus" size={18} color="#FFFFFF" />}
                style={styles.emptyStateButton}
              />
            )}
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
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    height: 48,
    paddingHorizontal: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.vendor,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#E6F2FF',
  },
  editButton: {
    backgroundColor: '#EBF8FF',
  },
  activateButton: {
    backgroundColor: '#ECFDF5',
  },
  deactivateButton: {
    backgroundColor: '#FFF7ED',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
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
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    width: '80%',
  },
});
