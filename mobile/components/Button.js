import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import Colors from '../constants/Colors';

/**
 * Button Component
 * 
 * A customizable button with support for loading state, icons, and different styles
 * 
 * @param {string} title - The button text
 * @param {Function} onPress - Function to call when button is pressed
 * @param {Object} style - Custom styles for the button container
 * @param {Object} textStyle - Custom styles for the button text
 * @param {boolean} loading - Whether to show a loading indicator
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} color - Button color theme ('primary', 'secondary', 'success', 'danger', 'light')
 * @param {boolean} outline - Whether to use outline style
 * @param {React.ReactNode} icon - Optional icon to show before text
 * @param {string} testID - Optional testID for testing (defaults to "button")
 */
export default function Button({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  loading = false,
  disabled = false,
  color = 'primary',
  outline = false,
  icon = null,
  testID = "button"
}) {
  // Determine button colors based on props
  const buttonColors = {
    primary: {
      background: Colors.primary,
      text: '#FFFFFF',
      border: Colors.primary
    },
    secondary: {
      background: Colors.secondary,
      text: '#FFFFFF',
      border: Colors.secondary
    },
    success: {
      background: Colors.success,
      text: '#FFFFFF',
      border: Colors.success
    },
    danger: {
      background: Colors.danger,
      text: '#FFFFFF',
      border: Colors.danger
    },
    light: {
      background: Colors.lightGray,
      text: Colors.textDark,
      border: Colors.lightGray
    }
  };

  const buttonColor = buttonColors[color] || buttonColors.primary;
  
  // Apply styles for outline button
  const backgroundColor = outline ? 'transparent' : buttonColor.background;
  const borderColor = buttonColor.border;
  const textColor = outline ? buttonColor.background : buttonColor.text;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator 
          color={textColor} 
          size="small"
          testID={`${testID}-loading-indicator`}
        />
      ) : (
        <View style={styles.contentContainer} testID={`${testID}-content`}>
          {icon && (
            <View style={styles.iconContainer} testID={`${testID}-icon-container`}>
              {React.cloneElement(icon, { testID: `${testID}-icon` })}
            </View>
          )}
          <Text 
            style={[styles.text, { color: textColor }, textStyle]}
            testID={`${testID}-text`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48
  },
  buttonDisabled: {
    opacity: 0.6
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    marginRight: 8
  }
});
