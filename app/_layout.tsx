// app/_layout.tsx
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { router, SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react'; // Ensure React and useEffect are imported
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Import all Poppins fonts here since they are used globally
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  useFonts // <-- Import useFonts here
} from '@expo-google-fonts/poppins';


// Optional: Prevent native splash screen from auto-hiding
// Add this line at the very top of your file, before any imports
SplashScreen.preventAutoHideAsync();


// Create a separate component for the navigation logic
function RootLayoutNav() {
  const { user, loading: authLoading, session } = useAuth(); // Renamed 'loading' to 'authLoading' for clarity

  // Load fonts at the top level of this root component
  const [fontsLoaded, fontError] = useFonts({ // <-- useFonts hook here
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic
  });

  // Effect to hide splash screen and handle navigation once both auth and fonts are loaded
  useEffect(() => {
    // Both authentication and fonts must be loaded
    if (!authLoading && fontsLoaded) {
      SplashScreen.hideAsync(); // Hide splash screen
      if (user && session) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }
  }, [user, authLoading, session, fontsLoaded]); // Add fontsLoaded to dependencies

  // Show loading screen while checking authentication status OR loading fonts
  if (authLoading || !fontsLoaded) { // <-- Check both loading states
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154689" />
      </View>
    );
  }

  // Once both are loaded, render the main Stack
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="(content)" options={{ headerShown: false }} />
      <Stack.Screen name="(favorites)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Main layout component that wraps everything with AuthProvider
export default function AppLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

// Styles for the loading screen
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});