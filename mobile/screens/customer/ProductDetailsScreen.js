import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

const DEFAULT_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const { user, token, isAuthenticated, isCustomer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProductDetails = useCallback(async () => {
    try {
      const response = await api.get(`/api/products/${productId}`, token);
      if (response.success) {
        setProduct(response.product);
      } else {
        Alert.alert('Error', response.message || 'Failed to load product details');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [productId, token, navigation]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'You need to login as a customer to make a purchase.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (!isCustomer) {
      Alert.alert(
        'Customer Account Required',
        'Only customers can make purchases. Please login with a customer account.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('Checkout', {
      product,
      quantity
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.customer} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={64} color={Colors.danger} />
        <Text style={styles.errorText}>Product not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          color="light"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url || DEFAULT_IMAGE }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</Text>
        
        <View style={styles.vendorContainer}>
          <Feather name="shopping-bag" size={16} color={Colors.textLight} />
          <Text style={styles.vendorName}>Sold by: {product.vendor_name}</Text>
        </View>
        
        {product.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        ) : null}
        
        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Feather 
                name="minus" 
                size={20} 
                color={quantity <= 1 ? Colors.textLight : Colors.textDark} 
              />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Feather name="plus" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${(parseFloat(product.price) * quantity).toFixed(2)}</Text>
        </View>
        
        <Button
          title="Buy Now"
          onPress={handleBuyNow}
          color="primary"
          style={styles.buyButton}
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
    paddingBottom: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 200,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.lightGray,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.customer,
    marginBottom: 12,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  vendorName: {
    fontSize: 14,
    color: Colors.textDark,
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  quantityContainer: {
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    width: 120,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.customer,
  },
  buyButton: {
    marginTop: 8,
  },
});
