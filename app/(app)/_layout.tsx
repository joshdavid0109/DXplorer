import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
        screenOptions={{
            headerShown: false,
            // Reduce transition animation
            animation: 'fade', // Options: 'default', 'fade', 'slide_from_right', 'slide_from_left', 'slide_from_bottom', 'none'
            animationDuration: 150, // Reduce from default ~300ms
            
            // Alternative: Completely disable animations
            // animation: 'none',
            
            // Or use a more subtle slide
            // animation: 'slide_from_right',
            // animationDuration: 200,
      }}
      >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="favorite_tours" options={{ headerShown: false }} />
      <Stack.Screen name="all_tab" options={{ headerShown: false}} />
      {/* Add other auth screens here if you have them */}
    </Stack>
  );
}