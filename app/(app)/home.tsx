import { Link } from 'expo-router'; // To link to booking page
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // In a real app, fetch data like popular destinations, recent bookings etc.

  const handleLogout = () => {
    // Implement logout logic here (e.g., clear AuthContext, clear storage)
    console.log('Logging out...');
    // Update AuthContext to isLoggedIn = false, which will redirect to (auth) group via _layout.tsx
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Destinations</Text>
      <Text style={styles.description}>
        Find amazing trips and plan your next adventure!
      </Text>

      <Link href="/booking" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start New Booking</Text>
        </TouchableOpacity>
      </Link>

      {/* Dummy Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f0f7',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2980b9',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});