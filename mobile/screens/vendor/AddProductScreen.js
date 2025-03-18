import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import * as api from '../../services/api';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function AddProductScreen({ navigation, route }) {
  const { token } = useAuth();
  const editingProduct = route.params?.product;
  const isEditing = !!editingProduct;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // If editing, populate form with existing product data
  useEffect(() => {
    if (isEditing && editingProduct) {
      setName(editingProduct.name);
      setDescription(editingProduct.description || '');
      setPrice(editingProduct.price.toString());
      setImageUrl(editingProduct.image_url || '');
      setActive(editingProduct.active);
    }
  }, [isEditing, editingProduct]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = 'Price must be a positive number';
      }
    }
    
    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      active
    };
    
    try {
      let response;
      
      if (isEditing) {
        response = await api.put(`/api/products/${editingProduct.id}`, productData, token);
      } else {
        response = await api.post('/api/products', productData, token);
      }
      
      setLoading(false);
      
      if (response.success) {
        Alert.alert(
          'Success',
          `Product ${isEditing ? 'updated' : 'created'} successfully`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to product list with a flag to refresh
                navigation.navigate('ProductManagement', { productUpdated: true });
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save product');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Enter product name"
            maxLength={100}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Price ($) *</Text>
          <TextInput
            style={[styles.input, errors.price && styles.inputError]}
            value={price}
            onChangeText={setPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={[styles.input, errors.imageUrl && styles.inputError]}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            keyboardType="url"
            autoCapitalize="none"
          />
          {errors.imageUrl ? <Text style={styles.errorText}>{errors.imageUrl}</Text> : null}
          <Text style={styles.helperText}>
            Enter a URL for your product image. Leave blank to use a default placeholder.
          </Text>
        </View>
        
        <View style={styles.formGroup}>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Active Status</Text>
            <Switch
              value={active}
              onValueChange={setActive}
              trackColor={{ false: Colors.lightGray, true: Colors.vendor }}
              thumbColor={active ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor={Colors.lightGray}
            />
          </View>
          <Text style={styles.helperText}>
            {active 
              ? 'Product is visible to customers' 
              : 'Product is hidden from customers'}
          </Text>
        </View>
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            color="light"
            outline
            style={styles.cancelButton}
          />
          <Button
            title={isEditing ? "Update Product" : "Add Product"}
            onPress={handleSaveProduct}
            loading={loading}
            color="primary"
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  textArea: {
    minHeight: 120,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: Colors.textLight,
    fontSize: 14,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
    marginLeft: 8,
  },
});
