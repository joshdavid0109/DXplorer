// 1. Imports: Always at the top
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Correct import for Expo Router
import React, { useState } from 'react';
import {
  ActivityIndicator, // For loading state feedback,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Import Google Fonts
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts
} from '@expo-google-fonts/poppins';

// Import Supabase auth context
import { useAuth } from '@/contexts/AuthContext'; // Adjust path as needed

// 2. Constants for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for consistent scaling (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Consistent scaling function that maintains proportions
const uniformScale = (size: number): number => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

// Font scaling for better text readability
const fontScale = (size: number): number => {
  const scale = screenWidth / BASE_WIDTH;
  return Math.max(size * scale, size * 0.85); // Minimum scale to ensure readability
};

// 3. Component Definition: Your main functional component
export default function LoginScreen() {
  // 4. State Variables: Use useState for managing component state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for auth operations

  // Get auth functions from Supabase context
  const { signIn, signInWithGoogle, signInWithFacebook, resetPassword } = useAuth();

  // 5. Font Loading: Ensure fonts are loaded before rendering UI
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    // Optionally return a loading indicator or splash screen here
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154689" />
        <Text style={{ marginTop: uniformScale(10), fontSize: fontScale(14) }}>Loading Fonts...</Text>
      </View>
    );
  }

  // 6. Helper Functions / Event Handlers: Logic specific to this component
  const handleRegisterTab = (): void => {
    // Navigates to the register screen when the register tab is pressed
    router.push('/(auth)/register');
  };

  const handleLogin = async (): Promise<void> => {
    // Validate input fields
    if (!email || !password) {
      Alert.alert('Login Error', 'Please enter both email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Login Error', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Use Supabase signIn function
      const result = await signIn(email.trim().toLowerCase(), password);
      
      if (result?.error) {
        // Handle specific Supabase auth errors
        let errorMessage = 'Login failed. Please try again.';
        
        switch (result.error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Invalid email or password. Please check your credentials.';
            break;
          case 'Email not confirmed':
            errorMessage = 'Please check your email and click the confirmation link.';
            break;
          case 'Too many requests':
            errorMessage = 'Too many login attempts. Please wait a moment and try again.';
            break;
          default:
            errorMessage = result.error.message || 'An error occurred during login.';
        }
        
        Alert.alert('Login Error', errorMessage);
      } else if (result?.data?.user) {
        // Login successful
        console.log('Login successful:', result.data.user.email);
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // The AuthContext will handle navigation automatically
        // No need to manually navigate here
      }
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    if (!email) {
      Alert.alert('Reset Password', 'Please enter your email address first.');
      return;
    }

    try {
      const result = await resetPassword(email.trim().toLowerCase());
      
      if (result?.error) {
        Alert.alert('Reset Password Error', result.error.message);
      } else {
        Alert.alert(
          'Reset Password', 
          'Check your email for a password reset link.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      Alert.alert('Reset Password Error', 'An error occurred. Please try again.');
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    if (!signInWithGoogle) {
      Alert.alert('Google Sign In Error', 'Google sign in is not available.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      
      if (result?.error) {
        Alert.alert('Google Sign In Error', result.error.message || 'An error occurred with Google sign in.');
      }
      // Success will be handled by the auth context
    } catch (error) {
      console.error('Google sign in failed:', error);
      Alert.alert('Google Sign In Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async (): Promise<void> => {
    if (!signInWithFacebook) {
      Alert.alert('Facebook Sign In Error', 'Facebook sign in is not available.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await signInWithFacebook();
      
      if (result?.error) {
        Alert.alert('Facebook Sign In Error', result.error.message || 'An error occurred with Facebook sign in.');
      }
      // Success will be handled by the auth context
    } catch (error) {
      console.error('Facebook sign in failed:', error);
      Alert.alert('Facebook Sign In Error', 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Render Method (JSX): What your component displays
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <View style={styles.content}>

        {/* Welcome Text Section */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>WELCOME BACK!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue using the app</Text>
        </View>

        {/* Tab Buttons for Login/Register */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'LOGIN' && styles.activeTab]}
            onPress={() => setActiveTab('LOGIN')}
          >
            <Text style={[styles.tabText, activeTab === 'LOGIN' && styles.activeTabText]}>
              LOGIN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'REGISTER' && styles.activeTab]}
            onPress={() => {
              setActiveTab('REGISTER');
              handleRegisterTab(); // Call your additional function here
            }}
          >
            <Text style={[styles.tabText, activeTab === 'REGISTER' && styles.activeTabText]}>
              REGISTER
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields Section (Login or Register based on activeTab) */}
        {activeTab === 'LOGIN' ? (
          <View style={styles.inputSection}>
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={uniformScale(20)} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
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
                autoComplete="password"
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

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          // Placeholder for the Register form/content
          <View style={styles.inputSection}>
            <Text style={styles.registerMessage}>
              Please proceed to the Register screen for account creation.
            </Text>
          </View>
        )}

        {/* Or continue with Divider */}
        <View style={styles.dividerContainer}>
          <Text style={styles.dividerText}>or continue with</Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.disabledButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, isLoading && styles.disabledButton]}
            onPress={handleFacebookSignIn}
            disabled={isLoading}
          >
            <Text style={styles.facebookText}>f</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 8. Stylesheet: Defined using StyleSheet.create for optimized styling
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
  content: {
    flex: 1,
    paddingHorizontal: uniformScale(30),
    paddingTop: uniformScale(40),
    paddingBottom: Platform.OS === 'android' ? 0 : 0, // iOS handles this automatically

  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: uniformScale(20),
    marginTop: uniformScale(40)
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
  inputSection: {
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: uniformScale(10),
  },
  forgotPasswordText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#154689',
  },
  loginButton: {
    backgroundColor: '#154689',
    paddingVertical: uniformScale(15),
    borderRadius: uniformScale(25),
    alignItems: 'center',
    marginBottom: uniformScale(30),
    marginTop: uniformScale(20),
  },
  loginButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    letterSpacing: uniformScale(1),
  },
  disabledButton: {
    opacity: 0.6,
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
  registerMessage: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: uniformScale(20),
    color: '#666',
    paddingHorizontal: uniformScale(20),
  }
});