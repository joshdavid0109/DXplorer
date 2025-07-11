import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed
import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Constants for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for consistent scaling (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Consistent scaling function that maintains proportions
const uniformScale = (size: number) => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

// Font scaling for better text readability
const fontScale = (size: number) => {
  const scale = screenWidth / BASE_WIDTH;
  return Math.max(size * scale, size * 0.85); // Minimum scale to ensure readability
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('REGISTER');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const handleLoginTab = () => {
    router.push('/(auth)/login');
  };

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    // Check if all fields are filled
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return false;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter a password');
      return false;
    }

    if (!confirmPassword) {
      Alert.alert('Validation Error', 'Please confirm your password');
      return false;
    }

    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    // Validate password strength
    if (!validatePassword(password)) {
      Alert.alert(
        'Validation Error', 
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
      );
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return false;
    }

    // Check if user agreed to terms
    if (!agreedToTerms) {
      Alert.alert('Validation Error', 'Please agree to the Terms & Privacy Policy');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Attempt to sign up
      const { data, error } = await signUp(email.trim().toLowerCase(), password);

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          Alert.alert(
            'Registration Error',
            'An account with this email already exists. Please try logging in instead.'
          );
        } else if (error.message.includes('invalid email')) {
          Alert.alert('Registration Error', 'Please enter a valid email address');
        } else if (error.message.includes('weak password')) {
          Alert.alert('Registration Error', 'Password is too weak. Please choose a stronger password.');
        } else {
          Alert.alert('Registration Error', error.message || 'Failed to create account. Please try again.');
        }
      } else {
        // Registration successful
        console.log('Registration successful:', data);
        
        // Show success message
        Alert.alert(
          'Registration Successful!',
          'A confirmation email has been sent to your email address. Please check your inbox and click the verification link to activate your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to login screen or verification screen
                router.push('/(auth)/login');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      Alert.alert(
        'Registration Error',
        'An unexpected error occurred. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signInWithGoogle) {
          Alert.alert('Google Sign In Error', 'Google sign in is not available.');
          return;
        }
    
        try {
          setIsLoading(true);
          const result = await signInWithGoogle();
          
          if (result?.error) {
            Alert.alert('Google Sign In Error', result.error.message || 'An error occurred with Google sign in.');
          } else if (result?.data) {
            // Success - navigate to home
            router.replace('/(app)/home');
          }
          // Success will be handled by the auth context
        } catch (error) {
          console.error('Google sign in failed:', error);
          Alert.alert('Google Sign In Error', 'An error occurred. Please try again.');
        } finally {
          setIsLoading(false);
        }
  };

  const handleFacebookSignUp = async () => {
    const { signInWithFacebook } = useAuth();
    
    if (!signInWithFacebook) {
      Alert.alert('Error', 'Facebook sign up is not available');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signInWithFacebook();
      
      if (error && error.name !== 'OAuthCancelled') {
        Alert.alert('Facebook Sign Up Error', error.message || 'Failed to sign up with Facebook');
      }
    } catch (error) {
      console.error('Facebook sign up error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154689" />
        <Text style={{ marginTop: uniformScale(10), fontSize: fontScale(14) }}>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
         {/* Logo Section */}
          <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/dx_nobg.png')} // Adjust the path to your logo
                style={styles.logoImage} // Define style for your logo size/dimensions
                resizeMode="contain" // Or "cover", "stretch", etc.
              />
            </View>
          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>CREATE ACCOUNT</Text>
            <Text style={styles.welcomeSubtitle}>Sign up to get started with the app</Text>
          </View>

          {/* Tab Buttons */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'LOGIN' && styles.activeTab]}
              onPress={() => {
                setActiveTab('LOGIN');
                handleLoginTab();
              }}
            >
              <Text style={[styles.tabText, activeTab === 'LOGIN' && styles.activeTabText]}>
                LOGIN
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'REGISTER' && styles.activeTab]}
              onPress={() => setActiveTab('REGISTER')}
            >
              <Text style={[styles.tabText, activeTab === 'REGISTER' && styles.activeTabText]}>
                REGISTER
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={uniformScale(20)} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={uniformScale(20)} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={uniformScale(20)} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={uniformScale(20)} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={uniformScale(20)} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={uniformScale(20)} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              disabled={isLoading}
            >
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={uniformScale(16)} color="#ffffff" />
                  )}
                </View>
                <Text style={styles.termsText}>By signing up, you agree to our Terms & Privacy Policy</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.registerButtonText}>REGISTER</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>or continue with</Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleGoogleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.googleText}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={handleFacebookSignUp}
              disabled={isLoading}
            >
              <Text style={styles.facebookText}>f</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: uniformScale(30),
    paddingTop: uniformScale(40),
    paddingBottom: Platform.OS === 'android' ? 0 : 0, // iOS handles this automatically
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: uniformScale(20),
    marginTop: uniformScale(5)
  },
  logoImage: {
    width: uniformScale(300),
    height: uniformScale(120),
    marginTop: uniformScale(20),
    maxWidth: screenWidth * 0.8, // Ensure logo doesn't exceed screen width
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: uniformScale(40),
  },
  welcomeTitle: {
    fontSize: fontScale(30),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    marginBottom: uniformScale(8),
    letterSpacing: uniformScale(1),
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: fontScale(15),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: uniformScale(20),
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: uniformScale(30),
    backgroundColor: '#f8f9fa',
    borderRadius: uniformScale(8),
    padding: uniformScale(4),
  },
  tabButton: {
    flex: 1,
    paddingVertical: uniformScale(12),
    alignItems: 'center',
    borderRadius: uniformScale(6),
  },
  activeTab: {
    backgroundColor: '#154689',
  },
  tabText: {
    fontSize: fontScale(17),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    letterSpacing: uniformScale(0.5),
  },
  activeTabText: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: uniformScale(30),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingVertical: uniformScale(5),
    marginBottom: uniformScale(10),
    position: 'relative',
  },
  inputIcon: {
    marginRight: uniformScale(15),
  },
  textInput: {
    flex: 1,
    fontSize: fontScale(16),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    paddingVertical: uniformScale(8),
  },
  eyeIcon: {
    padding: uniformScale(5),
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: uniformScale(15),
    paddingHorizontal: uniformScale(10),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: uniformScale(20),
    height: uniformScale(20),
    borderWidth: 2,
    borderColor: '#154689',
    borderRadius: uniformScale(4),
    marginRight: uniformScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#154689',
  },
  termsText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#154689',
    textAlign: 'center',
    lineHeight: fontScale(20),
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#154689',
    paddingVertical: uniformScale(15),
    borderRadius: uniformScale(25),
    alignItems: 'center',
    marginBottom: uniformScale(30),
    marginTop: uniformScale(10),
  },
  registerButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  registerButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    letterSpacing: uniformScale(1),
  },
  dividerContainer: {
    alignItems: 'center',
    marginBottom: uniformScale(20),
  },
  dividerText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  socialButton: {
    width: uniformScale(40),
    height: uniformScale(40),
    borderRadius: uniformScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  googleText: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_700Bold',
    color: '#4285f4',
  },
  facebookText: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_700Bold',
    color: '#1877f2',
  },
});