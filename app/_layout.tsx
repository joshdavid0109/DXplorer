import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      {/* This hides the header for the 'index' route (e.g., app/index.js) */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* This hides the header for all routes within the '(auth)' group
          (e.g., app/(auth)/index.js, app/(auth)/login.js, etc.) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* This hides the header for all routes within the '(auth)' group
          (e.g., app/(auth)/index.js, app/(auth)/login.js, etc.) */}
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}