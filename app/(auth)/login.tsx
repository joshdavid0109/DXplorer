// 1. Imports: Always at the top
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Correct import for Expo Router
import React, { useState } from 'react';
import {
  ActivityIndicator, // For loading state feedback,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
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

// 2. Constants for responsive sizing
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

// 3. Component Definition: Your main functional component
export default function LoginScreen() {
  // 4. State Variables: Use useState for managing component state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('LOGIN');
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator

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
  const handleRegisterTab = () => {
    // Navigates to the register screen when the register tab is pressed
    router.push('/(auth)/register');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Login Error', 'Please enter both email/username and password.');
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Simulate an asynchronous login operation (e.g., API call)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

      // In a real app, you'd send credentials to your backend here
      console.log('Attempting login with:', email, password);

      // Example: If login is successful, navigate to the main app screen
      router.replace('/home'); // Or whatever your main authenticated route is
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Error', 'Invalid credentials or an error occurred. Please try again.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // 7. Render Method (JSX): What your component displays
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/dx_logo_white.png')} // Update this path to your logo
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

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
                placeholder="Email/Username"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
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
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={uniformScale(20)}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin} // Use the new handleLogin function
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
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
          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.googleText}>G</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
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
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: uniformScale(30),
    paddingTop: uniformScale(40),
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