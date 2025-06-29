import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // Import expo-location
import { router } from 'expo-router'; // Correct import for Expo Router
import React, { useEffect, useState } from 'react'; // Import useEffect
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Import Google Fonts
import BottomNavigationBar from '@/components/BottomNavigationBar';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
  useFonts
} from '@expo-google-fonts/poppins';

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

// Destination Card Component
const DestinationCard = ({
  destination = "OSAKA, JAPAN",
  price = "PHP 49,999/PAX",
  duration = "5 DAYS 4 NIGHTS",
  rating = 4.8,
  imageUri = "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop",
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.destinationCard} onPress={onPress}>
      {/* Background Image */}
      <Image source={{ uri: imageUri }} style={styles.destinationCardImage} />

      {/* Rating Badge */}
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>

      {/* Content Overlay */}
      <View style={styles.destinationCardOverlay}>
        <View style={styles.destinationCardContent}>
          {/* Angled cut overlay */}
          <View style={styles.angleShape} />

          {/* Destination Name */}
          <Text style={styles.destinationCardTitle}>{destination}</Text>

          {/* Price */}
          <Text style={styles.destinationCardPrice}>{price}</Text>

          {/* Duration */}
          <Text style={styles.destinationCardDuration}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Top Destinations');
  const [location, setLocation] = useState<string | null>(null); // State to store location

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic
  });

  // Function to get current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Permission to access location was denied. Please enable it in settings to see your current location.',
        [{ text: 'OK' }]
      );
      setLocation('Location access denied'); // Fallback text
      return;
    }

    try {
      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      // Reverse geocode to get human-readable address
      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const { city, region, country } = geocode[0];
        // Display city, region, and country if available, otherwise just coordinates
        const formattedLocation = [city, region, country].filter(Boolean).join(', ') || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        setLocation(formattedLocation);
      } else {
        setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not retrieve current location. Please try again or check your device settings.',
        [{ text: 'OK' }]
      );
      setLocation('Failed to get location'); // Fallback text
    }
  };

  // Call getLocation when the component mounts
  useEffect(() => {
    getLocation();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const topDestinations = [
    {
      id: 1,
      destination: "OSAKA, JAPAN",
      price: "PHP 49,999/PAX",
      duration: "5 DAYS 4 NIGHTS",
      rating: 4.8,
      imageUri: "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      destination: "TOKYO, JAPAN",
      price: "PHP 55,999/PAX",
      duration: "6 DAYS 5 NIGHTS",
      rating: 4.9,
      imageUri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      destination: "EL NIDO, PHILIPPINES",
      price: "PHP 25,999/PAX",
      duration: "4 DAYS 3 NIGHTS",
      rating: 4.7,
      imageUri: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop"
    }
  ];

  const localTours = [
    {
      id: 1,
      title: 'BORACAY',
      subtitle: 'White Beach',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=120&fit=crop',
    },
    {
      id: 2,
      title: 'BOHOL',
      subtitle: 'Chocolate Hills',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=120&fit=crop',
    }
  ];

  const internationalTours = [
    {
      id: 1,
      title: 'DA NANG',
      subtitle: 'Vietnam',
      image: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=200&h=120&fit=crop',
    },
    {
      id: 2,
      title: 'SINGAPORE',
      subtitle: 'Marina Bay',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=200&h=120&fit=crop',
    }
  ];

  const handleDestinationCardPress = () => {
    // Navigate to login screen using Expo Router
    router.push('/(content)/package');
  };

  const handleNavChanges = () => {
    router.push('/(app)/favorite_tours');
  }

  return (
    <BottomNavigationBar>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo - Centered */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/dx_logo_lg.png')} // Update this path to your logo
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Location and Profile Section */}
        <View style={styles.locationProfileSection}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={uniformScale(18)} color="#666" />
            <Text style={styles.locationLabel}>LOCATION</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-outline" size={uniformScale(24)} color="#154689" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationRow} onPress={getLocation}>
          {/* Display fetched location or a default/loading message */}
          <Text style={styles.locationText}>
            {location ? location : 'Fetching location...'}
          </Text>
          <Ionicons name="chevron-down" size={uniformScale(20)} color="#666" />
        </TouchableOpacity>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Let's Explore Your Best</Text>
          <Text style={styles.welcomeSubtitle}>Travel Destination</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={uniformScale(20)} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Top Destinations' && styles.activeTabButton]}
            onPress={() => setActiveTab('Top Destinations')}
          >
            <Text style={[styles.tabText, activeTab === 'Top Destinations' && styles.activeTabText]}>
              Top Destinations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Flash Sale' && styles.activeTabButton]}
            onPress={() => setActiveTab('Flash Sale')}
          >
            <Text style={[styles.tabText, activeTab === 'Flash Sale' && styles.activeTabText]}>
              Flash Sale
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Destinations Section with Destination Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Destinations</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {topDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination.destination}
              price={destination.price}
              duration={destination.duration}
              rating={destination.rating}
              imageUri={destination.imageUri}
              onPress={() => handleDestinationCardPress()}
            />
          ))}
        </ScrollView>

        {/* Local Tours Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Domestic Tours</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {localTours.map((tour) => (
            <TouchableOpacity key={tour.id} style={styles.tourCard}>
              <Image source={{ uri: tour.image }} style={styles.tourImage} />
              <View style={styles.tourInfo}>
                <Text style={styles.tourTitle}>{tour.title}</Text>
                <Text style={styles.tourSubtitle}>{tour.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* International Tours Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>International Tours</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {internationalTours.map((tour) => (
            <TouchableOpacity key={tour.id} style={styles.tourCard}>
              <Image source={{ uri: tour.image }} style={styles.tourImage} />
              <View style={styles.tourInfo}>
                <Text style={styles.tourTitle}>{tour.title}</Text>
                <Text style={styles.tourSubtitle}>{tour.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>

    </BottomNavigationBar>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: uniformScale(35),
    paddingBottom: uniformScale(10),
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: uniformScale(200),
    height: uniformScale(60),
    maxWidth: screenWidth * 0.8, // Ensure logo doesn't exceed screen width
  },
  locationProfileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(-20),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(6),
  },
  locationLabel: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    letterSpacing: uniformScale(0.5),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(5),
    marginBottom: uniformScale(5),
    gap: uniformScale(8),
  },
  locationText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  profileButton: {
    width: uniformScale(45),
    height: uniformScale(45),
    borderRadius: uniformScale(22.5),
    borderWidth: uniformScale(2),
    borderColor: '#154689',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wings: {
    width: uniformScale(20),
    height: uniformScale(20),
  },
  welcomeSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(25),
  },
  welcomeTitle: {
    fontSize: fontScale(28),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    lineHeight: fontScale(34),
    marginLeft: uniformScale(15)
  },
  welcomeSubtitle: {
    fontSize: fontScale(28),
    fontFamily: 'Poppins_800ExtraBold_Italic',
    color: '#FAAD2B',
    lineHeight: fontScale(34),
    marginLeft: uniformScale(15),
    marginBottom: uniformScale(-10)
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: uniformScale(20),
    paddingHorizontal: uniformScale(15),
    paddingVertical: uniformScale(1),
    borderRadius: uniformScale(12),
    borderWidth: 0.5,
    borderColor: 'rgba(145, 145, 145, 0.83)',
    marginBottom: uniformScale(15),
  },
  searchIcon: {
    marginRight: uniformScale(10),
  },
  searchInput: {
    flex: 1,
    fontSize: fontScale(16),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
    gap: uniformScale(10),
  },
  tabButton: {
    paddingHorizontal: uniformScale(20),
    paddingVertical: uniformScale(10),
    borderRadius: uniformScale(15),
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#154689',
  },
  tabText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
  },
  sectionTitle: {
    fontSize: fontScale(25),
    fontFamily: 'Poppins_800ExtraBold_Italic',
    color: '#154689',
  },
  seeAllButton: {
    paddingVertical: uniformScale(5),
  },
  seeAllText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#999',
  },
  horizontalScroll: {
    marginBottom: uniformScale(30),
  },
  horizontalScrollContent: {
    paddingLeft: uniformScale(20),
    paddingRight: uniformScale(10),
  },
  // Destination card styles - fixed for proper angled shape
  destinationCard: {
    width: screenWidth * 0.75,
    height: uniformScale(220),
    borderRadius: uniformScale(15),
    overflow: 'hidden',
    marginRight: uniformScale(15),
    marginBottom: uniformScale(15),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.3,
    shadowRadius: uniformScale(8),
  },
  destinationCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  ratingBadge: {
    position: 'absolute',
    top: uniformScale(15),
    right: uniformScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: uniformScale(10),
    paddingVertical: uniformScale(6),
    borderRadius: uniformScale(15),
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(4),
    zIndex: 2,
  },
  ratingText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  destinationCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  destinationCardContent: {
    padding: uniformScale(5),
    backgroundColor: 'rgba(145, 145, 145, 0.83)',
    position: 'relative',
  },
  destinationCardTitle: {
    fontSize: fontScale(15),
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
    marginBottom: uniformScale(3),
    marginLeft: uniformScale(10),
    letterSpacing: uniformScale(0.3),
  },
  destinationCardPrice: {
    fontSize: fontScale(15),
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFD700',
    marginBottom: uniformScale(1),
    marginLeft: uniformScale(10),
  },
  destinationCardDuration: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_500Medium',
    color: '#ffffff',
    opacity: 0.9,
    marginLeft: uniformScale(10),

  },
  angleShape: {
    // Add angled shape styling if needed
  },
  // Tour card styles
  tourCard: {
    width: uniformScale(250),
    marginRight: uniformScale(15),
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    marginBottom: uniformScale(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
  },
  tourImage: {
    width: '100%',
    height: uniformScale(100),
    borderTopLeftRadius: uniformScale(12),
    borderTopRightRadius: uniformScale(12),
  },
  tourInfo: {
    padding: uniformScale(12),
  },
  tourTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(2),
    marginTop: uniformScale(-5)
  },
  tourSubtitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  bottomNav: {
    position: 'absolute',
    bottom: uniformScale(15),
    width: screenWidth * 0.5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingVertical: uniformScale(15),
    paddingHorizontal: uniformScale(20),
    borderRadius: uniformScale(30),
    gap: uniformScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: uniformScale(10),
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavBackground: {
    backgroundColor: '#154689',
    width: uniformScale(50),
    height: uniformScale(35),
    borderRadius: uniformScale(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: uniformScale(120),
  },
});