// 1. Imports: Always at the top
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Correct import for Expo Router
import React, { useState } from 'react';
import {
  ActivityIndicator // For loading state feedback
  ,








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

// 2. Constants (if any, typically outside component but related to layout)
const screenWidth = Dimensions.get('window').width; // Although not directly used in styling here, kept for context


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
        <Text style={{ marginTop: 10 }}>Loading Fonts...</Text>
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
      Alert.alert('Login Success', 'You have been logged in!');
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
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
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
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
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
                  size={20}
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
    paddingHorizontal: 30,
    paddingTop: 40,
    // Add justifyContent and alignItems to content if you want to center the whole block
    // For this specific layout, it looks like it's meant to fill top-down,
    // so centralizing the content view itself might not be the desired effect.
    // However, if the entire form needs to be centered vertically within the screen:
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40
  },
  logoImage: {
    width: 300,
    height: 120,
    marginTop: 20
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 30,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    marginBottom: 8,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#154689',
  },
  tabText: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: '#ffffff',
  },
  inputSection: { // Renamed from inputContainer for better clarity as it holds multiple inputs
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingVertical: 5,
    marginBottom: 10,
    position: 'relative',
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#154689',
  },
  loginButton: {
    backgroundColor: '#154689',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  dividerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#999',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  googleText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#4285f4',
  },
  facebookText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#1877f2',
  },
  registerMessage: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  }
});
