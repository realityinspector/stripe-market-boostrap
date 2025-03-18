import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

/**
 * VendorCard Component
 * 
 * Displays a vendor card with icon, name, description, and metadata
 * 
 * @param {Object} vendor - The vendor data to display
 * @param {Function} onPress - Function to call when card is pressed
 * @param {Object} style - Optional custom styles
 * @param {string} testID - Optional testID for testing (defaults to "vendor-card")
 */
export default function VendorCard({ vendor, onPress, style, testID = "vendor-card" }) {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onPress(vendor)}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.iconContainer} testID={`${testID}-image`}>
        <Feather 
          name="shopping-bag" 
          size={24} 
          color={Colors.primary} 
          testID={`${testID}-icon`}
        />
      </View>
      <View style={styles.contentContainer} testID={`${testID}-content`}>
        <Text style={styles.name} testID={`${testID}-name`}>
          {vendor.business_name}
        </Text>
        <Text 
          style={styles.description} 
          numberOfLines={2}
          testID={`${testID}-description`}
        >
          {vendor.business_description || 'No description available'}
        </Text>
        <View style={styles.metadata} testID={`${testID}-metadata`}>
          <View style={styles.metaItem} testID={`${testID}-product-count`}>
            <Feather name="package" size={14} color={Colors.textLight} />
            <Text style={styles.metaText}>
              {vendor.product_count || 0} products
            </Text>
          </View>
          {vendor.stripe_onboarding_complete ? (
            <View style={styles.badgeSuccess} testID={`${testID}-verified`}>
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.badgePending} testID={`${testID}-pending`}>
              <Text style={styles.badgeText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
      <Feather 
        name="chevron-right" 
        size={20} 
        color={Colors.textLight} 
        testID={`${testID}-chevron`}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Colors.lightGray,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  badgeSuccess: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePending: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});
