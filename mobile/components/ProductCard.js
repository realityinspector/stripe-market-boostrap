import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

export default function ProductCard({ product, onPress, style }) {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image_url || DEFAULT_IMAGE }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.vendorContainer}>
          <Feather name="shopping-bag" size={14} color={Colors.textLight} />
          <Text style={styles.vendorName} numberOfLines={1}>
            {product.vendor_name}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>${parseFloat(product.price).toFixed(2)}</Text>
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
