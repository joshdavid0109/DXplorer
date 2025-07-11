import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


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
import SharedLayout from '@/components/BottomNavigationBar';
import { ScrollableLogo } from '@/components/ScrollableLogo';
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
  const minScale = 0.8;  // Minimum 80% of original size
  const maxScale = 1.3;  // Maximum 130% of original size
  
  // Clamp the scale between min and max values
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
  
  return size * clampedScale;
};

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  android: {
    elevation: 8,
  },
});

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

interface DestinationCardProps {
  destination?: string;
  price?: string;
  duration?: string;
  rating?: number;
  imageUri?: string;
  onPress?: () => void;
}

// Destination Card Component
const DestinationCard: React.FC<DestinationCardProps & { packageId?: string; onFavoritePress?: (id: string) => void; isLiked?: boolean }> = ({
  destination = "DESTINATION",
  price = "PHP 0/PAX",
  duration = "0 DAYS 0 NIGHTS",
  rating = 0,
  imageUri = "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop",
  onPress,
  packageId,
  onFavoritePress,
  isLiked = false
}) => {
  return (
    <TouchableOpacity style={styles.destinationCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.destinationCardImage} />
        <View style={styles.gradientOverlay} />
        
        {/* Updated Heart/Favorite Icon */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => packageId && onFavoritePress && onFavoritePress(packageId)}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={uniformScale(20)} 
            color={isLiked ? "#FF4444" : "#fff"} 
          />
        </TouchableOpacity>
        
        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.destinationTitle}>{destination}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceValue}>{price}</Text>
        </View>
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={uniformScale(14)} color="#666" />
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Modern Welcome Section Component
const ModernWelcomeSection = () => (
  <View style={styles.modernWelcomeContainer}>
    <View style={styles.welcomeBackgroundPattern} />
    <View style={styles.welcomeContent}>
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Let's Explore Your Best</Text>
        <Text style={styles.welcomeSubtitle}>Travel Destination</Text>
      </View>
      <View style={styles.welcomeDecorative}>
        <View style={styles.floatingElement} />
        <View style={styles.floatingElement2} />
      </View>
    </View>
  </View>
);

// Enhanced Search Component
const EnhancedSearchBar = ({ searchText, onSearchChange }) => (
  <View style={styles.enhancedSearchContainer}>
    <View style={styles.searchWrapper}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search-outline" size={uniformScale(20)} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Where do you want to go?"
          value={searchText}
          onChangeText={onSearchChange}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  </View>
);

// Modern Tab Selector
const ModernTabSelector = ({ activeTab, onTabChange }) => (
  <View style={styles.modernTabContainer}>
    <View style={styles.tabSelector}>
      <TouchableOpacity
        style={[styles.modernTabButton, activeTab === 'Top Destinations' && styles.activeModernTab]}
        onPress={() => onTabChange('Top Destinations')}
      >
        <Text style={[styles.modernTabText, activeTab === 'Top Destinations' && styles.activeModernTabText]}>
          Top Destinations
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.modernTabButton, activeTab === 'Flash Sale' && styles.activeModernTab]}
        onPress={() => onTabChange('Flash Sale')}
      >
        <Text style={[styles.modernTabText, activeTab === 'Flash Sale' && styles.activeModernTabText]}>
          Flash Sale
        </Text>
        {activeTab === 'Flash Sale' && <View style={styles.flashSaleIndicator} />}
      </TouchableOpacity>
    </View>
  </View>
);

// Enhanced Section Header
const EnhancedSectionHeader = ({ title, onSeeAll, showBadge = false }) => (
  <View style={styles.enhancedSectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showBadge && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
    </View>
    <TouchableOpacity style={styles.modernSeeAllButton} onPress={onSeeAll}>
      <Text style={styles.seeAllText}>SEE ALL</Text>
      <Ionicons name="chevron-forward" size={uniformScale(14)} color="#999" />
    </TouchableOpacity>
  </View>
);

export default function HomeScreen() {  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Top Destinations');
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State for fetched data
  const [topDestinations, setTopDestinations] = useState<Package[]>([]);
  const [localTours, setLocalTours] = useState<Package[]>([]);
  const [internationalTours, setInternationalTours] = useState<Package[]>([]);
  const [flashSalePackages, setFlashSalePackages] = useState<Package[]>([]);
  const [packageInclusions, setPackageInclusions] = useState<{ [key: string]: string }>({});

  const [likedPackages, setLikedPackages] = useState<Set<string>>(new Set());
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([]);

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

        // Fetch inclusions for all packages
        const allPackageIds = packages.map(pkg => pkg.package_id);
        await fetchPackageInclusions(allPackageIds);
      }
    } catch (error) {
      console.error('Error in fetchPackages:', error);
      Alert.alert('Error', 'Something went wrong while loading packages.');
    } finally {
      setLoading(false);
    }
  };


  const toggleFavorite = async (packageId: string) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to add favorites');
      return;
    }

    // Check current favorite status from database (not local state)
    const { data: existingFavorite, error: checkError } = await supabase
      .from('liked_packages')
      .select('*')
      .eq('package_id', packageId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking favorite status:', checkError);
      Alert.alert('Error', 'Failed to check favorite status');
      return;
    }

    const isCurrentlyLiked = !!existingFavorite;
    
    if (isCurrentlyLiked) {
      // Remove from favorites
      const { error } = await supabase
        .from('liked_packages')
        .delete()
        .eq('package_id', packageId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing from favorites:', error);
        Alert.alert('Error', 'Failed to remove from favorites');
        return;
      }

      // Update local state
      setLikedPackages(false);
      const newLikedPackages = new Set(likedPackages);
      newLikedPackages.delete(packageId);
      setLikedPackages(newLikedPackages);
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('liked_packages')
        .insert([{ 
          package_id: packageId,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error adding to favorites:', error);
        Alert.alert('Error', 'Failed to add to favorites');
        return;
      }

      // Update local state
      setIsFavorite(true);
      const newLikedPackages = new Set(likedPackages);
      newLikedPackages.add(packageId);
      setLikedPackages(newLikedPackages);
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    Alert.alert('Error', 'Something went wrong');
  }
};

// Also update fetchLikedPackages function
const fetchLikedPackages = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User not authenticated, clear liked packages
      setLikedPackages(new Set());
      return;
    }

    const { data: likedData, error } = await supabase
      .from('liked_packages')
      .select('package_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching liked packages:', error);
      // Don't clear existing liked packages on error, just log it
      return;
    }

    if (likedData) {
      const likedIds = new Set(likedData.map(item => item.package_id));
      setLikedPackages(likedIds);
    } else {
      // No liked packages found, clear the set
      setLikedPackages(new Set());
    }
  } catch (error) {
    console.error('Error in fetchLikedPackages:', error);
  }
};

  // Update the search functionality - add this function
const handleSearch = (text: string) => {
  setSearchText(text);
  
  if (text.trim() === '') {
    setFilteredDestinations([]);
    return;
  }

  const allPackages = [...topDestinations, ...flashSalePackages, ...localTours, ...internationalTours];
  const searchTerm = text.toLowerCase();
  
  const filtered = allPackages.filter(pkg => {
    const destination = extractDestinationFromId(pkg.package_id).toLowerCase();
    const tourType = pkg.tour_type?.toLowerCase() || '';
    const packageLabel = pkg.package_label?.toLowerCase() || '';
    
    return destination.includes(searchTerm) || 
           tourType.includes(searchTerm) || 
           packageLabel.includes(searchTerm);
  });

  // Update this line to include packageId:
  setFilteredDestinations(filtered.map(pkg => ({
    ...formatPackageForDisplay(pkg),
    packageId: pkg.package_id // Add this line
  })));
};

  // Update your useEffect to include fetching liked packages
  useFocusEffect(
    useCallback(() => {
      getLocation();
      fetchPackages();
      fetchLikedPackages(); // This will now run every time screen comes into focus
    }, [])
  );

  const fetchPackageInclusions = async (packageIds: string[]) => {
  try {
    const { data: inclusions, error } = await supabase
      .from('package_details')
      .select('package_id, inclusions')
      .in('package_id', packageIds);

    if (error) {
      console.error('Error fetching inclusions:', error);
      return;
    }

    const inclusionsMap: { [key: string]: string } = {};
    inclusions?.forEach((item) => {
      if (item.inclusions && Array.isArray(item.inclusions) && item.inclusions.length > 0) {
        // Get the first inclusion as the "top" inclusion
        inclusionsMap[item.package_id] = item.inclusions[0];
      }
    });

    setPackageInclusions(inclusionsMap);
  } catch (error) {
    console.error('Error in fetchPackageInclusions:', error);
  }
};

  // Function to get continent from country code
  const getContinent = (countryCode: string | null | undefined): string => {
    if (!countryCode) return 'Unknown';
    
    const upperCountryCode = countryCode.toUpperCase();
    const continentMap: { [key: string]: string } = {
      // Asia
      'PH': 'Asia', 'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'VN': 'Asia',
      'KR': 'Asia', 'ID': 'Asia', 'MY': 'Asia', 'SG': 'Asia', 'TW': 'Asia', 'HK': 'Asia',
      'MN': 'Asia', 'KZ': 'Asia', 'UZ': 'Asia', 'AF': 'Asia', 'BD': 'Asia', 'BT': 'Asia',
      'BN': 'Asia', 'KH': 'Asia', 'TL': 'Asia', 'GE': 'Asia', 'IR': 'Asia', 'IQ': 'Asia',
      'IL': 'Asia', 'JO': 'Asia', 'KW': 'Asia', 'KG': 'Asia', 'LA': 'Asia', 'LB': 'Asia',
      'MV': 'Asia', 'MM': 'Asia', 'NP': 'Asia', 'KP': 'Asia', 'OM': 'Asia', 'PK': 'Asia',
      'PS': 'Asia', 'QA': 'Asia', 'SA': 'Asia', 'LK': 'Asia', 'SY': 'Asia', 'TJ': 'Asia',
      'TM': 'Asia', 'AE': 'Asia', 'YE': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'BH': 'Asia',
      'CY': 'Asia', 'TR': 'Asia',
      
      // Europe
      'GB': 'Europe', 'DE': 'Europe', 'FR': 'Europe', 'IT': 'Europe', 'ES': 'Europe',
      'PT': 'Europe', 'NL': 'Europe', 'BE': 'Europe', 'CH': 'Europe', 'AT': 'Europe',
      'DK': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'FI': 'Europe', 'IS': 'Europe',
      'IE': 'Europe', 'LU': 'Europe', 'MC': 'Europe', 'MT': 'Europe', 'SM': 'Europe',
      'VA': 'Europe', 'AD': 'Europe', 'LI': 'Europe', 'PL': 'Europe', 'CZ': 'Europe',
      'SK': 'Europe', 'HU': 'Europe', 'SI': 'Europe', 'HR': 'Europe', 'BA': 'Europe',
      'RS': 'Europe', 'ME': 'Europe', 'MK': 'Europe', 'AL': 'Europe', 'GR': 'Europe',
      'BG': 'Europe', 'RO': 'Europe', 'MD': 'Europe', 'UA': 'Europe', 'BY': 'Europe',
      'LT': 'Europe', 'LV': 'Europe', 'EE': 'Europe', 'RU': 'Europe',
      
      // North America
      'US': 'North America', 'CA': 'North America', 'MX': 'North America', 'GT': 'North America',
      'BZ': 'North America', 'SV': 'North America', 'HN': 'North America', 'NI': 'North America',
      'CR': 'North America', 'PA': 'North America', 'CU': 'North America', 'JM': 'North America',
      'HT': 'North America', 'DO': 'North America', 'PR': 'North America', 'TT': 'North America',
      'BB': 'North America', 'GD': 'North America', 'LC': 'North America', 'VC': 'North America',
      'AG': 'North America', 'KN': 'North America', 'DM': 'North America', 'BS': 'North America',
      
      // South America
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America', 'PE': 'South America',
      'CO': 'South America', 'VE': 'South America', 'EC': 'South America', 'BO': 'South America',
      'PY': 'South America', 'UY': 'South America', 'GY': 'South America', 'SR': 'South America',
      'GF': 'South America',
      
      // Africa
      'ZA': 'Africa', 'EG': 'Africa', 'NG': 'Africa', 'KE': 'Africa', 'MA': 'Africa',
      'ET': 'Africa', 'GH': 'Africa', 'DZ': 'Africa', 'TN': 'Africa', 'LY': 'Africa',
      'SD': 'Africa', 'UG': 'Africa', 'TZ': 'Africa', 'MZ': 'Africa', 'MG': 'Africa',
      'CM': 'Africa', 'CI': 'Africa', 'NE': 'Africa', 'BF': 'Africa', 'ML': 'Africa',
      'MW': 'Africa', 'ZM': 'Africa', 'SN': 'Africa', 'SO': 'Africa', 'TD': 'Africa',
      'GN': 'Africa', 'RW': 'Africa', 'BJ': 'Africa', 'TG': 'Africa', 'SL': 'Africa',
      'LR': 'Africa', 'CF': 'Africa', 'MR': 'Africa', 'ER': 'Africa', 'GM': 'Africa',
      'BW': 'Africa', 'GA': 'Africa', 'LS': 'Africa', 'GW': 'Africa', 'GQ': 'Africa',
      'MU': 'Africa', 'SZ': 'Africa', 'DJ': 'Africa', 'KM': 'Africa', 'CV': 'Africa',
      'ST': 'Africa', 'SC': 'Africa', 'ZW': 'Africa', 'NA': 'Africa', 'AO': 'Africa',
      'CD': 'Africa', 'CG': 'Africa',
      
      // Oceania
      'AU': 'Oceania', 'NZ': 'Oceania', 'PG': 'Oceania', 'FJ': 'Oceania', 'NC': 'Oceania',
      'SB': 'Oceania', 'VU': 'Oceania', 'WS': 'Oceania', 'KI': 'Oceania', 'FM': 'Oceania',
      'TO': 'Oceania', 'MH': 'Oceania', 'PW': 'Oceania', 'CK': 'Oceania', 'NU': 'Oceania',
      'TK': 'Oceania', 'TV': 'Oceania', 'NR': 'Oceania',
      
      // Antarctica
      'AQ': 'Antarctica'
    };
    
    return continentMap[upperCountryCode] || 'Unknown';
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
      const { country, isoCountryCode } = geocode[0];
      
      if (country && isoCountryCode) {
        const continent = getContinent(isoCountryCode);
        const formattedLocation = `${country}, ${continent}`;
        setLocation(formattedLocation);
      } else if (country) {
        // Fallback if isoCountryCode is not available
        setLocation(`${country}, Unknown Continent`);
      } else {
        setLocation('Unknown Location');
      }
    } else {
      setLocation('Unable to determine location');
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
  const extractDestinationFromId = (packageId: string): string => {
    const destinations: { [key: string]: string } = {
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
  const getDefaultImageForPackage = (packageId: string): string => {
    const images: { [key: string]: string } = {
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
    return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#154689" />
    </View>
  );
  }

  const handleDestinationCardPress = (packageId?: string) => {
    // You can pass the package ID to the next screen if needed
    if (packageId){
      router.push(`/(content)/package?packageId=${packageId}`);
    } else {
      router.push('/(content)/package');
    }
  };

  const handleNavChanges = () => {
    router.push('/(app)/favorite_tours');
  };

  const handlePersonalInfo = () => {
    router.replace('/');
  };

  // Get current data based on active tab
  // Replace your getCurrentData function with this updated version:
  const getCurrentData = () => {
    if (searchText.trim() !== '') {
      return filteredDestinations.map(destination => ({
        ...destination,
        packageId: destination.id, // Make sure packageId is included
      }));
    }
    
    if (activeTab === 'Flash Sale') {
      return flashSalePackages.map(pkg => {
        const formatted = formatPackageForDisplay(pkg);
        return {
          ...formatted,
          packageId: pkg.package_id, // Add packageId
        };
      });
    }
    
    return topDestinations.map(pkg => {
      const formatted = formatPackageForDisplay(pkg);
      return {
        ...formatted,
        packageId: pkg.package_id, // Add packageId
      };
    });
  };


  // Update the destination cards rendering in your ScrollView
  {getCurrentData().map((destination) => (
    <DestinationCard
      key={destination.id}
      destination={destination.destination}
      price={destination.price}
      duration={destination.duration}
      rating={destination.rating}
      imageUri={destination.imageUri}
      packageId={destination.id}
      isLiked={likedPackages.has(destination.id)}
      onFavoritePress={toggleFavorite}
      onPress={() => handleDestinationCardPress(destination.id)}
    />
  ))}

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <SharedLayout>
      <StatusBar 
      barStyle="dark-content" 
      backgroundColor={Platform.OS === 'ios' ? undefined : "#f8f9fa"}
      translucent={Platform.OS === 'android'}
      />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ScrollableLogo />

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
          <ModernWelcomeSection />

          {/* Search Bar */}
          <EnhancedSearchBar searchText={searchText} onSearchChange={handleSearch} />

          {/* Tab Buttons */}
          <ModernTabSelector activeTab={activeTab} onTabChange={setActiveTab} />

          {searchText.trim() !== '' && (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                Search Results ({filteredDestinations.length})
              </Text>
              {filteredDestinations.length === 0 ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={uniformScale(48)} color="#ccc" />
                  <Text style={styles.noResultsText}>No destinations found</Text>
                  <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#154689" />
              <Text style={styles.loadingText}>Loading packages...</Text>
            </View>
          ) : (
            <>
              {/* Dynamic Destinations Section */}
              <EnhancedSectionHeader 
                title={activeTab === 'Flash Sale' ? 'Flash Sale' : 'Top Destinations'}
                onSeeAll={() => router.push('/(app)/all_tab?filter=all&sort=newest')}
                showBadge={activeTab === 'Flash Sale'}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {getCurrentData().map((destination) => (
                  <DestinationCard
                    key={destination.packageId || destination.id}
                    destination={destination.destination}
                    price={destination.price}
                    duration={destination.duration}
                    rating={destination.rating}
                    imageUri={destination.imageUri}
                    packageId={destination.packageId || destination.id}
                    isLiked={likedPackages.has(destination.packageId || destination.id)}
                    onFavoritePress={toggleFavorite}
                    onPress={() => handleDestinationCardPress(destination.packageId || destination.id)}
                  />
                ))}
              </ScrollView>

              {/* Domestic Tours Section */}
              <EnhancedSectionHeader 
                title="Domestic Tours"
                onSeeAll={() => router.push('/(app)/all_tab?filter=domestic&sort=newest')}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {localTours.map((tour) => {
                  const formatted = formatPackageForDisplay(tour);
                  return (
                    <TouchableOpacity 
                      key={tour.package_id} 
                      style={styles.modernTourCard} 
                      onPress={() => handleDestinationCardPress(tour.package_id)}
                    >
                      <View style={styles.tourImageContainer}>
                        <Image source={{ uri: formatted.imageUri }} style={styles.tourCardImage} />
                        <View style={styles.tourImageOverlay} />
                        
                        {/* Tour Type Badge */}
                        <View style={styles.tourTypeBadge}>
                          <Text style={styles.tourTypeText}>DOMESTIC</Text>
                        </View>
                        

                        {/* Quick Action Button */}
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => toggleFavorite(tour.package_id)}
                        >
                          <Ionicons 
                            name={likedPackages.has(tour.package_id) ? "heart" : "heart-outline"} 
                            size={uniformScale(20)} 
                            color={likedPackages.has(tour.package_id) ? "#FF4444" : "#fff"} 
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.tourCardContent}>
                        <View style={styles.tourHeaderRow}>
                          <Text style={styles.tourCardTitle} numberOfLines={1}>
                            {formatted.destination}
                          </Text>
                          <View style={styles.tourPriceContainer}>
                            <Text style={styles.tourPrice}>{formatted.price}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.tourDetailsRow}>
                          <View style={styles.tourDetail}>
                            <Ionicons name="time-outline" size={uniformScale(12)} color="#888" />
                            <Text style={styles.tourDetailText}>{formatted.duration}</Text>
                          </View>
                        </View>

                        <View style={styles.tourFooter}>
                          <View style={styles.inclusionContainer}>
                            <Ionicons name="checkmark-circle" size={uniformScale(12)} color="#4CAF50" />
                            <Text style={styles.inclusionText} numberOfLines={1}>Inclusions available
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* International Tours Section */}
              <EnhancedSectionHeader 
                title="International Tours"
                onSeeAll={() => router.push('/(app)/all_tab?filter=international&sort=newest')}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.horizontalScrollContent}
              >
                {internationalTours.map((tour) => {
                  const formatted = formatPackageForDisplay(tour);
                  return (
                    <TouchableOpacity 
                      key={tour.package_id} 
                      style={styles.modernTourCard} 
                      onPress={() => handleDestinationCardPress(tour.package_id)}
                    >
                      <View style={styles.tourImageContainer}>
                        <Image source={{ uri: formatted.imageUri }} style={styles.tourCardImage} />
                        <View style={styles.tourImageOverlay} />
                        
                        {/* Tour Type Badge */}
                        <View style={[styles.tourTypeBadge, styles.internationalBadge]}>
                          <Text style={styles.tourTypeText}>INTERNATIONAL</Text>
                        </View>
                        
                         {/* Quick Action Button */}
                        <TouchableOpacity 
                          style={styles.quickActionButton}
                          onPress={() => toggleFavorite(tour.package_id)}
                        >
                          <Ionicons 
                            name={likedPackages.has(tour.package_id) ? "heart" : "heart-outline"} 
                            size={uniformScale(20)} 
                            color={likedPackages.has(tour.package_id) ? "#FF4444" : "#fff"} 
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.tourCardContent}>
                        <View style={styles.tourHeaderRow}>
                          <Text style={styles.tourCardTitle} numberOfLines={1}>
                            {formatted.destination}
                          </Text>
                          <View style={styles.tourPriceContainer}>
                            <Text style={styles.tourPrice}>{formatted.price}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.tourDetailsRow}>
                          <View style={styles.tourDetail}>
                            <Ionicons name="calendar-outline" size={uniformScale(12)} color="#888" />
                            <Text style={styles.tourDetailText}>{formatted.duration}</Text>
                          </View>
                        </View>

                        <View style={styles.tourFooter}>
                          <View style={styles.inclusionContainer}>
                            <Ionicons name="checkmark-circle" size={uniformScale(12)} color="#4CAF50" />
                            <Text style={styles.inclusionText} numberOfLines={1}>
                              {packageInclusions[tour.package_id] || 'Inclusions available'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SharedLayout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: Platform.OS === 'android' ? 0 : 0
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
 modernWelcomeContainer: {
    position: 'relative',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(10),
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(20),
    overflow: 'hidden',
    ...shadowStyle,
  },
  welcomeBackgroundPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: uniformScale(100),
    height: uniformScale(100),
    backgroundColor: '#154689',
    borderRadius: uniformScale(50),
    opacity: 0.05,
    transform: [{ translateX: uniformScale(30) }, { translateY: uniformScale(-30) }],
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: uniformScale(20),
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeDecorative: {
    position: 'relative',
    width: uniformScale(60),
    height: uniformScale(60),
  },
  floatingElement: {
    position: 'absolute',
    width: uniformScale(20),
    height: uniformScale(20),
    backgroundColor: '#FAAD2B',
    borderRadius: uniformScale(10),
    top: uniformScale(10),
    right: uniformScale(10),
    opacity: 0.3,
  },
  floatingElement2: {
    position: 'absolute',
    width: uniformScale(12),
    height: uniformScale(12),
    backgroundColor: '#154689',
    borderRadius: uniformScale(6),
    bottom: uniformScale(15),
    left: uniformScale(15),
    opacity: 0.4,
  },

  // Enhanced Search Styles
  enhancedSearchContainer: {
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(12),
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: uniformScale(16),
    paddingVertical: uniformScale(6),
    borderRadius: uniformScale(16),
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...shadowStyle,
  },
  searchResultsContainer: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
  },
  searchResultsTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
    marginBottom: uniformScale(10),
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: uniformScale(40),
  },
  noResultsText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginTop: uniformScale(10),
  },
  noResultsSubtext: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#999',
    marginTop: uniformScale(5),
  },
  // Modern Tab Styles
  modernTabContainer: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(25),
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: uniformScale(16),
    padding: uniformScale(4),
    ...shadowStyle,
  },
  modernTabButton: {
    flex: 1,
    paddingVertical: uniformScale(10),
    paddingHorizontal: uniformScale(16),
    borderRadius: uniformScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeModernTab: {
    backgroundColor: '#154689',
    ...shadowStyle,
  },
  modernTabText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
  },
  activeModernTabText: {
    color: '#ffffff',
  },
  flashSaleIndicator: {
    position: 'absolute',
    top: uniformScale(8),
    right: uniformScale(8),
    width: uniformScale(8),
    height: uniformScale(8),
    backgroundColor: '#FF4444',
    borderRadius: uniformScale(4),
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  // Enhanced Section Header Styles
  enhancedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
    marginTop: uniformScale(-10),
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(5),
  },
  newBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: uniformScale(6),
    paddingVertical: uniformScale(2),
    borderRadius: uniformScale(8),
  },
  newBadgeText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    letterSpacing: uniformScale(0.5),
  },
  modernSeeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(4),
    paddingVertical: uniformScale(8),
    paddingHorizontal: uniformScale(12),
    backgroundColor: '#f8f9fa',
    borderRadius: uniformScale(12),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  welcomeTitle: {
    fontSize: fontScale(24),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    lineHeight: fontScale(28),
  },
  welcomeSubtitle: {
    fontSize: fontScale(24),
    fontFamily: 'Poppins_800ExtraBold_Italic',
    color: '#FAAD2B',
    lineHeight: fontScale(28),
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
    ...(Platform.OS === 'ios' && {
      paddingVertical: uniformScale(12),
    })
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
    width: screenWidth * 0.72,
    marginRight: uniformScale(16),
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(20),
    overflow: 'hidden',
    
  },
  imageContainer: {
    position: 'relative',
    height: uniformScale(180),
    overflow: 'hidden',
  },
  destinationCardImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  favoriteButton: {
    position: 'absolute',
    top: uniformScale(12),
    left: uniformScale(12),
    width: uniformScale(36),
    height: uniformScale(36),
    borderRadius: uniformScale(18),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ratingBadge: {
    position: 'absolute',
    top: uniformScale(12),
    right: uniformScale(12),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  cardContent: {
    padding: uniformScale(16),
    paddingTop: uniformScale(14),
  },
  destinationTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    marginBottom: uniformScale(8),
    lineHeight: fontScale(20),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: uniformScale(8),
    gap: uniformScale(4),
  },
  priceLabel: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  priceValue: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#FFA726',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(4),
  },
  durationText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
  },
  angleShape: {
    // Add angled shape styling if needed
  },
 modernTourCard: {
    width: uniformScale(280),
    marginRight: uniformScale(16),
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: uniformScale(8),
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  tourImageContainer: {
    position: 'relative',
    height: uniformScale(120),
    overflow: 'hidden',
  },
  tourCardImage: {
    width: '100%',
    height: '100%',
  },
  tourImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  tourTypeBadge: {
    position: 'absolute',
    top: uniformScale(8),
    left: uniformScale(8),
    backgroundColor: '#154689',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(8),
  },
  internationalBadge: {
    backgroundColor: '#FAAD2B',
  },
  tourTypeText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    letterSpacing: uniformScale(0.5),
  },
  quickActionButton: {
    position: 'absolute',
    top: uniformScale(8),
    right: uniformScale(8),
    width: uniformScale(28),
    height: uniformScale(28),
    borderRadius: uniformScale(14),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourCardContent: {
    padding: uniformScale(14),
    paddingTop: uniformScale(12),
  },
  tourHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: uniformScale(8),
  },
  tourCardTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#1a1a1a',
    flex: 1,
    marginRight: uniformScale(8),
    lineHeight: fontScale(18),
  },
  tourPriceContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(2),
    borderRadius: uniformScale(6),
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tourPrice: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#FAAD2B',
  },
  tourDetailsRow: {
    marginBottom: uniformScale(12),
  },
  tourDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(4),
  },
  tourDetailText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_500Medium',
    color: '#888',
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: uniformScale(8),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inclusionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(4),
    flex: 1,
  },
  inclusionText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_500Medium',
    color: '#4CAF50',
    flex: 1,
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
    height: Platform.OS === 'ios' ? uniformScale(20) : uniformScale(20),
  },
});