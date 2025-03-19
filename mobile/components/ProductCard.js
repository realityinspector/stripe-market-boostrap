import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

// Currency symbols for supported currencies
const CURRENCY_SYMBOLS = {
  usd: '$',
  eur: '€',
  gbp: '£',
  cad: 'C$',
  aud: 'A$',
  jpy: '¥'
};

/**
 * ProductCard Component
 * 
 * Displays a product card with image, name, vendor, and price
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onPress - Function to call when card is pressed
 * @param {Object} style - Optional custom styles
 * @param {String} currency - Optional currency code (defaults to "usd")
 * @param {String} testID - Optional testID for testing (defaults to "product-card")
 */
export default function ProductCard({ product, onPress, style, currency = "usd", testID = "product-card" }) {
  // Format price according to currency
  const formatPrice = (price, currencyCode) => {
    const symbol = CURRENCY_SYMBOLS[currencyCode.toLowerCase()] || '$';
    
    // Japanese Yen doesn't use decimal places
    if (currencyCode.toLowerCase() === 'jpy') {
      return `${symbol}${Math.round(parseFloat(price))}`;
    }
    
    return `${symbol}${parseFloat(price).toFixed(2)}`;
  };
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(product)}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.imageContainer} testID={`${testID}-image-container`}>
        <Image 
          source={{ uri: product.image_url || DEFAULT_IMAGE }} 
          style={styles.image}
          resizeMode="cover"
          testID={`${testID}-image`}
        />
      </View>
      <View style={styles.contentContainer} testID={`${testID}-content`}>
        <Text style={styles.name} numberOfLines={2} testID={`${testID}-name`}>
          {product.name}
        </Text>
        <View style={styles.vendorContainer} testID={`${testID}-vendor-container`}>
          <Feather name="shopping-bag" size={14} color={Colors.textLight} />
          <Text style={styles.vendorName} numberOfLines={1} testID={`${testID}-vendor-name`}>
            {product.vendor_name}
          </Text>
        </View>
        <View style={styles.footer} testID={`${testID}-footer`}>
          <Text style={styles.price} testID={`${testID}-price`}>
            {formatPrice(product.price, currency)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.lightGray,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  vendorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
