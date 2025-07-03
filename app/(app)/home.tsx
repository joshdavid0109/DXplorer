import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

// Import your Supabase client
import { supabase } from '@/lib/supabase'; // Adjust the path to your Supabase client

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
  return Math.max(size * scale, size * 0.85);
};

// Types for your data
interface Package {
  package_id: string;
  price: number;
  total_slots: number;
  status: string;
  created_at: string;
  package_label: string;
  tour_type: string;
  // Add other fields as needed
  destination?: string;
  duration?: number;
  nights?: number;
  rating?: number;
  image_url?: string;
}

// Destination Card Component
const DestinationCard = ({
  destination = "DESTINATION",
  price = "PHP 0/PAX",
  duration = "0 DAYS 0 NIGHTS",
  rating = 0,
  imageUri = "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop",
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.destinationCard} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.destinationCardImage} />

      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>

      <View style={styles.destinationCardOverlay}>
        <View style={styles.destinationCardContent}>
          <View style={styles.angleShape} />
          <Text style={styles.destinationCardTitle}>{destination}</Text>
          <Text style={styles.destinationCardPrice}>{price}</Text>
          <Text style={styles.destinationCardDuration}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Top Destinations');
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for fetched data
  const [topDestinations, setTopDestinations] = useState<Package[]>([]);
  const [localTours, setLocalTours] = useState<Package[]>([]);
  const [internationalTours, setInternationalTours] = useState<Package[]>([]);
  const [flashSalePackages, setFlashSalePackages] = useState<Package[]>([]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic
  });

  // Function to fetch packages from Supabase
  const fetchPackages = async () => {
    try {
      setLoading(true);
      
      // Fetch all active packages
      const { data: packages, error } = await supabase
        .from('packages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching packages:', error);
        Alert.alert('Error', 'Failed to load packages. Please try again.');
        return;
      }

      if (packages) {
        // Filter packages by type and label
        const standard = packages.filter(pkg => pkg.package_label === 'Standard');
        const flashSale = packages.filter(pkg => pkg.package_label === 'Flash Sale');
        const domestic = packages.filter(pkg => pkg.tour_type === 'Domestic');
        const international = packages.filter(pkg => pkg.tour_type === 'International');

        // Set top destinations (you can customize this logic)
        setTopDestinations(standard.slice(0, 5)); // Top 5 standard packages
        setFlashSalePackages(flashSale);
        setLocalTours(domestic);
        setInternationalTours(international);
      }
    } catch (error) {
      console.error('Error in fetchPackages:', error);
      Alert.alert('Error', 'Something went wrong while loading packages.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get current location
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Permission to access location was denied. Please enable it in settings to see your current location.',
        [{ text: 'OK' }]
      );
      setLocation('Location access denied');
      return;
    }

    try {
      let locationData = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = locationData.coords;

      let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocode && geocode.length > 0) {
        const { city, region, country } = geocode[0];
        const formattedLocation = [city, region, country].filter(Boolean).join(', ') || 
          `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
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
      setLocation('Failed to get location');
    }
  };

  // Helper function to format package data for display
  const formatPackageForDisplay = (pkg: Package) => ({
    id: pkg.package_id,
    destination: pkg.destination || extractDestinationFromId(pkg.package_id),
    price: `PHP ${pkg.price.toLocaleString()}/PAX`,
    duration: `${pkg.duration} DAYS ${pkg.nights} NIGHTS` || "CONTACT FOR DETAILS",
    rating: pkg.rating || 4.5,
    imageUri: pkg.image_url || getDefaultImageForPackage(pkg.package_id),
  });

  // Helper function to extract destination from package_id
  const extractDestinationFromId = (packageId: string) => {
    const destinations = {
      'BORPHI': 'BORACAY, PHILIPPINES',
      'DANVN': 'DA NANG, VIETNAM',
      'ELNPHI': 'EL NIDO, PHILIPPINES',
      'TOKJPN': 'TOKYO, JAPAN',
      'OSAJPN': 'OSAKA, JAPAN',
    };
    
    const key = packageId.substring(0, 6);
    return destinations[key] || packageId.toUpperCase();
  };

  // Helper function to get default images
  const getDefaultImageForPackage = (packageId: string) => {
    const images = {
      'BORPHI': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      'DANVN': 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=400&h=300&fit=crop',
      'ELNPHI': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop',
      'TOKJPN': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
      'OSAJPN': 'https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop',
    };
    
    const key = packageId.substring(0, 6);
    return images[key] || 'https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop';
  };

  // Call functions when component mounts
  useEffect(() => {
    getLocation();
    fetchPackages();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleDestinationCardPress = (packageId?: string) => {
    // You can pass the package ID to the next screen if needed
    router.push('/(content)/package');
  };

  const handleNavChanges = () => {
    router.push('/(app)/favorite_tours');
  };

  const handlePersonalInfo = () => {
    router.replace('/');
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'Flash Sale') {
      return flashSalePackages.map(formatPackageForDisplay);
    }
    return topDestinations.map(formatPackageForDisplay);
  };

  return (
    <BottomNavigationBar>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/dx_logo_lg.png')}
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
          <TouchableOpacity style={styles.profileButton} onPress={() => router.replace('/')}>
            <Ionicons name="person-outline" size={uniformScale(24)} color="#154689" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.locationRow} onPress={getLocation}>
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

        {/* Loading Indicator */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#154689" />
            <Text style={styles.loadingText}>Loading packages...</Text>
          </View>
        ) : (
          <>
            {/* Dynamic Destinations Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'Flash Sale' ? 'Flash Sale' : 'Top Destinations'}
              </Text>
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
              {getCurrentData().map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination.destination}
                  price={destination.price}
                  duration={destination.duration}
                  rating={destination.rating}
                  imageUri={destination.imageUri}
                  onPress={() => handleDestinationCardPress(destination.id)}
                />
              ))}
            </ScrollView>

            {/* Domestic Tours Section */}
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
              {localTours.map((tour) => {
                const formatted = formatPackageForDisplay(tour);
                return (
                  <TouchableOpacity key={tour.package_id} style={styles.tourCard}>
                    <Image source={{ uri: formatted.imageUri }} style={styles.tourImage} />
                    <View style={styles.tourInfo}>
                      <Text style={styles.tourTitle}>{formatted.destination}</Text>
                      <Text style={styles.tourSubtitle}>{formatted.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
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
              {internationalTours.map((tour) => {
                const formatted = formatPackageForDisplay(tour);
                return (
                  <TouchableOpacity key={tour.package_id} style={styles.tourCard}>
                    <Image source={{ uri: formatted.imageUri }} style={styles.tourImage} />
                    <View style={styles.tourInfo}>
                      <Text style={styles.tourTitle}>{formatted.destination}</Text>
                      <Text style={styles.tourSubtitle}>{formatted.price}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

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
    maxWidth: screenWidth * 0.8,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: uniformScale(50),
  },
  loadingText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginTop: uniformScale(10),
  },
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
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#ffffff',
    opacity: 0.9,
    marginLeft: uniformScale(10),
  },
  angleShape: {
    // Add angled shape styling if needed
  },
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