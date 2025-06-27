import { Stack } from 'expo-router';

export default function TourLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Only works with native-stack
      }}
    >
      <Stack.Screen name="package" />
      <Stack.Screen name="booking"/>
      {/* other screens */}
    </Stack>
  );
}
