import { Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, useFonts } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const handleLoginTab = () => {
    router.push('/(auth)/login');
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/dx_logo_lg.png')} // Update this path to your logo
              style={styles.logoImage}
              resizeMode="contain"
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
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={uniformScale(20)} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity style={styles.termsContainer}>
              <Text style={styles.termsText}>By signing up, you agree to our Terms & Privacy Policy</Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>REGISTER</Text>
          </TouchableOpacity>

          {/* Or continue with */}
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
  termsText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#154689',
    textAlign: 'center',
    lineHeight: fontScale(20),
  },
  registerButton: {
    backgroundColor: '#154689',
    paddingVertical: uniformScale(15),
    borderRadius: uniformScale(25),
    alignItems: 'center',
    marginBottom: uniformScale(30),
    marginTop: uniformScale(10),
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