import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  View,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type AuthMode = 'login' | 'signup';

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  passwordConfirmation: string;
}

// Field-specific error types
interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { login, register } = useAuth();

  // Clear specific field error when user starts typing
  const clearFieldError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Parse API error message to determine which field it belongs to
  const parseApiError = (message: string): FieldErrors => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('email')) {
      return { email: message };
    }
    if (lowerMessage.includes('password') && lowerMessage.includes('confirm')) {
      return { passwordConfirmation: message };
    }
    if (lowerMessage.includes('password')) {
      return { password: message };
    }
    if (lowerMessage.includes('phone')) {
      return { phone: message };
    }
    if (lowerMessage.includes('first name')) {
      return { firstName: message };
    }
    if (lowerMessage.includes('last name')) {
      return { lastName: message };
    }
    
    // For login errors or general errors, show under password field
    if (mode === 'login') {
      return { general: message };
    }
    
    return { general: message };
  };

  const handleSubmit = async () => {
    setErrors({});
    
    if (mode === 'login') {
      // Client-side validation
      const newErrors: FieldErrors = {};
      
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        await login(email.trim(), password);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        setErrors(parseApiError(message));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Signup validation
      const newErrors: FieldErrors = {};
      
      if (!firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!email.trim()) {
        newErrors.email = 'Email is required';
      }
      if (!phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (phone.trim().length !== 10) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (!passwordConfirmation.trim()) {
        newErrors.passwordConfirmation = 'Please confirm your password';
      } else if (password !== passwordConfirmation) {
        newErrors.passwordConfirmation = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        await register({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          countryCode: countryCode.trim() || '+91',
          password,
          passwordConfirmation,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        setErrors(parseApiError(message));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setErrors({});
    // Reset all fields
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setCountryCode('+91');
    setPasswordConfirmation('');
    setShowPassword(false);
    setShowPasswordConfirmation(false);
  };

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    }
  };

  // Error message component
  const ErrorMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={14} color="#dc3545" />
        <ThemedText style={styles.errorText}>{message}</ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header section with dark background and subtle grid */}
      <View style={styles.header}>
        {/* Subtle grid pattern overlay */}
        <View style={styles.gridOverlay}>
          {[...Array(6)].map((_, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {[...Array(4)].map((_, colIndex) => (
                <View 
                  key={colIndex} 
                  style={[
                    styles.gridBox,
                    { opacity: 0.03 + (Math.random() * 0.04) }
                  ]} 
                />
              ))}
            </View>
          ))}
        </View>

        {/* Header content */}
        <View style={styles.headerContent}>
          {canGoBack && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          
          <ThemedText style={styles.headerTitle}>
            Go ahead and set up{'\n'}your account
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Sign in-up to enjoy the best managing experience
          </ThemedText>
        </View>
      </View>

      {/* Form section with white background */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Tab switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, mode === 'login' && styles.activeTab]}
              onPress={() => toggleMode('login')}
            >
              <ThemedText style={[styles.tabText, mode === 'login' && styles.activeTabText]}>
                Login
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, mode === 'signup' && styles.activeTab]}
              onPress={() => toggleMode('signup')}
            >
              <ThemedText style={[styles.tabText, mode === 'signup' && styles.activeTabText]}>
                Register
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form fields */}
          <View style={styles.formFields}>
            {mode === 'signup' && (
              <>
                {/* First Name */}
                <View>
                  <View style={[styles.inputContainer, errors.firstName && styles.inputError]}>
                    <Ionicons name="person-outline" size={20} color={errors.firstName ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                    <View style={styles.inputWrapper}>
                      <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your first name"
                        placeholderTextColor="#999"
                        value={firstName}
                        onChangeText={(text) => {
                          setFirstName(text);
                          clearFieldError('firstName');
                        }}
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isSubmitting}
                      />
                    </View>
                  </View>
                  <ErrorMessage message={errors.firstName} />
                </View>

                {/* Last Name */}
                <View>
                  <View style={[styles.inputContainer, errors.lastName && styles.inputError]}>
                    <Ionicons name="person-outline" size={20} color={errors.lastName ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                    <View style={styles.inputWrapper}>
                      <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your last name"
                        placeholderTextColor="#999"
                        value={lastName}
                        onChangeText={(text) => {
                          setLastName(text);
                          clearFieldError('lastName');
                        }}
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!isSubmitting}
                      />
                    </View>
                  </View>
                  <ErrorMessage message={errors.lastName} />
                </View>
              </>
            )}

            {/* Email */}
            <View>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={errors.email ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                <View style={styles.inputWrapper}>
                  <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      clearFieldError('email');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    editable={!isSubmitting}
                  />
                </View>
              </View>
              <ErrorMessage message={errors.email} />
            </View>

            {mode === 'signup' && (
              /* Phone */
              <View>
                <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color={errors.phone ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
                    <View style={styles.phoneRow}>
                      <TextInput
                        style={styles.countryCodeInput}
                        placeholder="+91"
                        placeholderTextColor="#999"
                        value={countryCode}
                        onChangeText={setCountryCode}
                        keyboardType="phone-pad"
                        editable={!isSubmitting}
                      />
                      <View style={styles.phoneDivider} />
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter phone number"
                        placeholderTextColor="#999"
                        value={phone}
                        onChangeText={(text) => {
                          setPhone(text.replace(/[^0-9]/g, ''));
                          clearFieldError('phone');
                        }}
                        keyboardType="phone-pad"
                        maxLength={10}
                        editable={!isSubmitting}
                      />
                    </View>
                  </View>
                </View>
                <ErrorMessage message={errors.phone} />
              </View>
            )}

            {/* Password */}
            <View>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                <View style={styles.inputWrapper}>
                  <ThemedText style={styles.inputLabel}>Password</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      clearFieldError('password');
                    }}
                    secureTextEntry={!showPassword}
                    textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                    editable={!isSubmitting}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
              <ErrorMessage message={errors.password} />
              {/* Show general/login errors below password */}
              {mode === 'login' && <ErrorMessage message={errors.general} />}
            </View>

            {mode === 'signup' && (
              /* Confirm Password */
              <View>
                <View style={[styles.inputContainer, errors.passwordConfirmation && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={errors.passwordConfirmation ? '#dc3545' : '#4a7c59'} style={styles.inputIcon} />
                  <View style={styles.inputWrapper}>
                    <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm your password"
                      placeholderTextColor="#999"
                      value={passwordConfirmation}
                      onChangeText={(text) => {
                        setPasswordConfirmation(text);
                        clearFieldError('passwordConfirmation');
                      }}
                      secureTextEntry={!showPasswordConfirmation}
                      textContentType="newPassword"
                      editable={!isSubmitting}
                    />
                  </View>
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  >
                    <Ionicons 
                      name={showPasswordConfirmation ? 'eye-outline' : 'eye-off-outline'} 
                      size={20} 
                      color="#999" 
                    />
                  </TouchableOpacity>
                </View>
                <ErrorMessage message={errors.passwordConfirmation} />
                {/* Show general errors below last field in signup */}
                <ErrorMessage message={errors.general} />
              </View>
            )}
          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                {mode === 'login' ? 'Login' : 'Register'}
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridRow: {
    flexDirection: 'row',
    flex: 1,
  },
  gridBox: {
    flex: 1,
    margin: 2,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  headerContent: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  formFields: {
    gap: 12,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: 14,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  input: {
    fontSize: 16,
    color: '#000',
    padding: 0,
    fontWeight: '500',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeInput: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    width: 45,
    padding: 0,
  },
  phoneDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    padding: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#dc3545',
  },
  submitButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
