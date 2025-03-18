import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import SearchBar from '../../components/SearchBar';
import ProductCard from '../../components/ProductCard';
import VendorCard from '../../components/VendorCard';
import Colors from '../../constants/Colors';

export default function HomeScreen({ navigation }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState(null); // null, 'low_to_high', 'high_to_low'
  
  const fetchData = useCallback(async () => {
    try {
      // Fetch products
      const productsResponse = await api.get('/api/products', token);
      if (productsResponse.success) {
        setProducts(productsResponse.products);
      }
      
      // Fetch some vendors
      const vendorsQuery = new URLSearchParams();
      vendorsQuery.append('limit', '5');
      const vendorsResponse = await api.get(`/api/vendors?${vendorsQuery.toString()}`, token);
      if (vendorsResponse.success) {
        setVendors(vendorsResponse.vendors);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      fetchData();
      return;
    }
    
    setLoading(true);
    try {
      const searchQuery = new URLSearchParams();
      searchQuery.append('search', query);
      const response = await api.get(`/api/products?${searchQuery.toString()}`, token);
      if (response.success) {
        setProducts(response.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchData();
  };

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
    
    if (category === 'all') {
      fetchData();
      return;
    }
    
    // In a real app, we would filter by category
    // For now, we'll just simulate it
    setLoading(true);
    setTimeout(() => {
      // Filter products (in a real app, this would be a server request)
      const filtered = products.filter((_, index) => index % 2 === 0);
      setProducts(filtered);
      setLoading(false);
    }, 500);
  };

  const handlePriceFilter = (filter) => {
    setPriceFilter(filter);
    
    if (!filter) {
      fetchData();
      return;
    }
    
    // Sort products by price
    const sorted = [...products].sort((a, b) => {
      const priceA = parseFloat(a.price);
      const priceB = parseFloat(b.price);
      
      if (filter === 'low_to_high') {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
    
    setProducts(sorted);
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const handleVendorPress = (vendor) => {
    // Navigate to vendor products
    navigation.navigate('VendorProducts', { vendorId: vendor.id });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        activeCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text 
        style={[
          styles.categoryButtonText,
          activeCategory === item.id && styles.categoryButtonTextActive
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={handleProductPress}
      style={styles.productCard}
    />
  );

  // Mock categories (in a real app, these would come from the API)
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'sports', name: 'Sports' },
    { id: 'toys', name: 'Toys' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.customer} />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={() => handleSearch(searchQuery)}
          onClear={handleClearSearch}
        />
      </View>
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersLabel}>Sort by:</Text>
        <View style={styles.filtersButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              priceFilter === null && styles.filterButtonActive
            ]}
            onPress={() => handlePriceFilter(null)}
          >
            <Text 
              style={[
                styles.filterButtonText,
                priceFilter === null && styles.filterButtonTextActive
              ]}
            >
              Featured
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              priceFilter === 'low_to_high' && styles.filterButtonActive
            ]}
            onPress={() => handlePriceFilter('low_to_high')}
          >
            <Text 
              style={[
                styles.filterButtonText,
                priceFilter === 'low_to_high' && styles.filterButtonTextActive
              ]}
            >
              Price: Low to High
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              priceFilter === 'high_to_low' && styles.filterButtonActive
            ]}
            onPress={() => handlePriceFilter('high_to_low')}
          >
            <Text 
              style={[
                styles.filterButtonText,
                priceFilter === 'high_to_low' && styles.filterButtonTextActive
              ]}
            >
              Price: High to Low
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {vendors.length > 0 && !searchQuery && activeCategory === 'all' && (
        <View style={styles.vendorsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Vendors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Vendors')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vendorsList}
          >
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={handleVendorPress}
                style={styles.vendorCard}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.productsRow}
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
            <Feather name="search" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No products found matching your search' : 'No products available'}
            </Text>
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
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.customer,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textDark,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  filtersLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  filtersButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.customer,
  },
  filterButtonText: {
    fontSize: 12,
    color: Colors.textDark,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  vendorsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textDark,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.customer,
    fontWeight: '500',
  },
  vendorsList: {
    paddingHorizontal: 16,
  },
  vendorCard: {
    width: 280,
    marginRight: 16,
  },
  productsList: {
    padding: 8,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
