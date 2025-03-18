import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default function SearchBar({ 
  placeholder = 'Search products...', 
  value,
  onChangeText,
  onSubmit,
  onClear,
  style
}) {
  return (
    <View style={[styles.container, style]}>
      <Feather name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Feather name="x" size={20} color={Colors.textLight} />
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
