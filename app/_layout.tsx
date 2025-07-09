// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  useFonts
} from '@expo-google-fonts/poppins';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

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

function RootLayoutNav() {
  const { user, loading: authLoading, session } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic
  });

  // Determine if we should apply bottom safe area
  // Only apply bottom safe area if there's significant bottom inset (3-button nav)
  const shouldApplyBottomSafeArea = insets.bottom > 30; // Adjust threshold as needed
  const safeAreaEdges = shouldApplyBottomSafeArea ? ['top', 'bottom'] : ['top'];

  useEffect(() => {
    if (!authLoading && fontsLoaded) {
      SplashScreen.hideAsync();
      if (user && session) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, authLoading, session, fontsLoaded]);

  if (authLoading || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#154689" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={safeAreaEdges}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="(content)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
}

export default function AppLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});