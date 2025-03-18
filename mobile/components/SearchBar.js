import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

/**
 * SearchBar Component
 * 
 * A search input with search icon and optional clear button
 * 
 * @param {string} placeholder - Placeholder text for the search input
 * @param {string} value - Current search input value
 * @param {Function} onChangeText - Function called when text changes
 * @param {Function} onSubmit - Function called when search is submitted
 * @param {Function} onClear - Function called when clear button is pressed
 * @param {Object} style - Custom styles for the container
 * @param {string} testID - Optional testID for testing (defaults to "search-bar")
 */
export default function SearchBar({ 
  placeholder = 'Search products...', 
  value,
  onChangeText,
  onSubmit,
  onClear,
  style,
  testID = "search-bar"
}) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Feather 
        name="search" 
        size={20} 
        color={Colors.textLight} 
        style={styles.searchIcon} 
        testID={`${testID}-icon`}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        clearButtonMode="while-editing"
        testID={`${testID}-input`}
      />
      {value ? (
        <TouchableOpacity 
          onPress={onClear} 
          style={styles.clearButton}
          testID={`${testID}-clear-button`}
        >
          <Feather 
            name="x" 
            size={20} 
            color={Colors.textLight}
            testID={`${testID}-clear-icon`}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.textDark,
  },
  clearButton: {
    padding: 4,
  }
});
