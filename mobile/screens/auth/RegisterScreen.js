import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import Colors from '../../constants/Colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  
  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await register({ name, email, password, role });
      
      if (!result.success) {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Feather name="shopping-cart" size={60} color={Colors.primary} />
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>Create a new account</Text>
        </View>
        
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <View style={styles.inputContainer}>
            <Feather name="user" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Feather name="mail" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather 
                name={showPassword ? "eye-off" : "eye"} 
                size={18} 
                color={Colors.textLight} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>
          
          <Text style={styles.roleLabel}>I want to register as:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'customer' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('customer')}
            >
              <Feather 
                name="shopping-bag" 
                size={18} 
                color={role === 'customer' ? '#FFFFFF' : Colors.primary} 
              />
              <Text 
                style={[
                  styles.roleText,
                  role === 'customer' && styles.roleTextActive,
                ]}
              >
                Customer
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'vendor' && styles.roleButtonActive,
              ]}
              onPress={() => setRole('vendor')}
            >
              <Feather 
                name="package" 
                size={18} 
                color={role === 'vendor' ? '#FFFFFF' : Colors.primary} 
              />
              <Text 
                style={[
                  styles.roleText,
                  role === 'vendor' && styles.roleTextActive,
                ]}
              >
                Vendor
              </Text>
            </TouchableOpacity>
          </View>
          
          <Button
            title="Register"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.textDark,
  },
  eyeIcon: {
    padding: 4,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    marginRight: 12,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  registerButton: {
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
