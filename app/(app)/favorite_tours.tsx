import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';


// Import Google Fonts
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts
} from '@expo-google-fonts/poppins';

import SharedLayout from '@/components/BottomNavigationBar';
import { ScrollableLogo } from '@/components/ScrollableLogo';
import { supabase } from '@/lib/supabase'; // Adjust path as needed

// 2. Constants for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for consistent scaling (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Consistent scaling function that maintains proportions
const uniformScale = (size: number): number => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

// Font scaling for better text readability
const fontScale = (size: number): number => {
  const scale = screenWidth / BASE_WIDTH;
  return Math.max(size * scale, size * 0.85); // Minimum scale to ensure readability
};

// 3. Types and Interfaces
interface Tour {
  id: string;
  title: string;
  country: string;
  location: string;
  rating: number;
  duration: string;
  nights: number;
  imageUrl: string;
  price: number;
  isAvailable: boolean;
  isFavorite: boolean;
  status: 'active' | 'inactive';
  package_label: string;
  total_slots: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (sortOption: SortOption) => void;
  currentSort: SortOption;
}

interface FilterOptions {
  countries: string[];
  priceRange: string;
  duration: string;
  availability: string;
  packageLabel: string;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'duration';

// 4. Component Definition
export default function FavoriteToursScreen() {
  // 5. State Variables
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showSortModal, setShowSortModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    countries: [],
    priceRange: 'all',
    duration: 'all',
    availability: 'all',
    packageLabel: 'all',
  });
  const [currentSort, setCurrentSort] = useState<SortOption>('name');

  // 6. Font Loading
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // 7. Get current user from auth
  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        Alert.alert('Error', 'Failed to get user information');
        return null;
      }

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        router.push('/auth/login'); // Redirect to login if not authenticated
        return null;
      }

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to get user information');
      return null;
    }
  };

  // 8. Fetch favorite tours from Supabase
  const fetchFavoriteTours = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const user = await getCurrentUser();
      if (!user) return;

      // Query liked_packages joined with packages table
      const { data, error } = await supabase
        .from('liked_packages')
        .select(`
          package_id,
          packages (
            package_id,
            main_location,
            duration,
            price,
            total_slots,
            status,
            package_label,
            nights
          )
        `)
        .eq('user_id', user.id); // Use user.id (UUID) from auth

      if (error) {
        console.error('Error fetching favorite tours:', error);
        Alert.alert('Error', 'Failed to load favorite tours');
        return;
      }

      // Transform the data to match our Tour interface
      const transformedTours: Tour[] = data?.map((item: any) => ({
        id: item.packages.package_id,
        title: item.packages.packagec_id, // Using package_id as title, you might want to add a title field
        country: getCountryFromPackageId(item.packages.package_id),
        location: item.packages.main_location.split(',')[0].trim(),
        rating: 4.5, // Default rating, you might want to add this to your database
        duration: `${item.packages.duration} DAYS`,
        nights: item.packages.nights,
        imageUrl: getImageUrlFromPackageId(item.packages.package_id),
        price: item.packages.price,
        isAvailable: item.packages.status === 'active',
        isFavorite: true, // Always true since these are favorite tours
        status: item.packages.status,
        package_label: item.packages.package_label,
        total_slots: item.packages.total_slots,
      })) || [];

      setTours(transformedTours);
      setFilteredTours(transformedTours);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load favorite tours');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions to extract information from package_id
  const getCountryFromPackageId = (packageId: string): string => {
    const countryMap: { [key: string]: string } = {
      'BORP': 'Philippines',
      'DANV': 'Vietnam',
      'ELNP': 'Philippines',
      'TOKJ': 'Japan',
    };
    
    const prefix = packageId.substring(0, 4);
    return countryMap[prefix] || 'Unknown';
  };

  const getLocationFromPackageId = (packageId: string): string => {
    const locationMap: { [key: string]: string } = {
      'BORP': 'Boracay',
      'DANV': 'Da Nang',
      'ELNP': 'El Nido',
      'TOKJ': 'Tokyo',
    };
    
    const prefix = packageId.substring(0, 4);
    return locationMap[prefix] || 'Unknown';
  };

  const getImageUrlFromPackageId = (packageId: string): string => {
    const imageMap: { [key: string]: string } = {
      'BORP': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      'DANV': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400',
      'ELNP': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      'TOKJ': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
    };
    
    const prefix = packageId.substring(0, 4);
    return imageMap[prefix] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
  };

  // 9. useEffect to load data on component mount
  useEffect(() => {
    fetchFavoriteTours();
  }, []);

  // 10. Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth/login');
        } else if (event === 'SIGNED_IN') {
          setCurrentUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154689" />
        <Text style={{ marginTop: uniformScale(10), fontSize: fontScale(14) }}>Loading...</Text>
      </View>
    );
  }

  // 11. Helper Functions
  const toggleFavorite = async (tourId: string): Promise<void> => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'Please log in to manage favorites');
        return;
      }

      // Check if tour is currently favorited
      const tour = tours.find(t => t.id === tourId);
      if (!tour) return;

      if (tour.isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('liked_packages')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('package_id', tourId);

        if (error) {
          console.error('Error removing favorite:', error);
          Alert.alert('Error', 'Failed to remove from favorites');
          return;
        }

        // Remove from local state
        setTours(prevTours => prevTours.filter(tour => tour.id !== tourId));
        setFilteredTours(prevTours => prevTours.filter(tour => tour.id !== tourId));
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('liked_packages')
          .insert({
            user_id: currentUser.id,
            package_id: tourId,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error adding favorite:', error);
          Alert.alert('Error', 'Failed to add to favorites');
          return;
        }

        // Update local state
        setTours(prevTours =>
          prevTours.map(tour =>
            tour.id === tourId ? { ...tour, isFavorite: true } : tour
          )
        );
        setFilteredTours(prevTours =>
          prevTours.map(tour =>
            tour.id === tourId ? { ...tour, isFavorite: true } : tour
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const applyFilters = (filters: FilterOptions): void => {
    let filtered = [...tours];

    // Filter by countries
    if (filters.countries.length > 0) {
      filtered = filtered.filter(tour => filters.countries.includes(tour.country));
    }

    // Filter by availability
    if (filters.availability === 'available') {
      filtered = filtered.filter(tour => tour.isAvailable);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(tour => !tour.isAvailable);
    }

    // Filter by package label
    if (filters.packageLabel !== 'all') {
      filtered = filtered.filter(tour => tour.package_label === filters.packageLabel);
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(tour => {
        const price = tour.price;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    setFilteredTours(filtered);
    setCurrentFilters(filters);
    setShowFilterModal(false);
  };

  const applySort = (sortOption: SortOption): void => {
    let sorted = [...filteredTours];

    switch (sortOption) {
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        sorted.sort((a, b) => a.duration.localeCompare(b.duration));
        break;
    }

    setFilteredTours(sorted);
    setCurrentSort(sortOption);
    setShowSortModal(false);
  };

  const handleGoBack = (): void => {
    router.back();
  };

  const handleNavChanges = () => {
    router.push('/(app)/home');
  };

  // 12. Render Tour Card Component
  const renderTourCard = ({ item }: { item: Tour }) => (
    <View style={styles.tourCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.tourImage} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={uniformScale(20)}
            color={item.isFavorite ? "#FF6B6B" : "#FFF"}
          />
        </TouchableOpacity>
      </View>

      
      <Text style={styles.tourTitle}>{item.location}</Text>
      
      {/* Two-column layout for tour info */}
      <View style={styles.tourInfo}>
        {/* First row: Location | Price */}
        <View style={styles.tourInfoRow}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={uniformScale(14)} color="#ED1313" />
            <Text style={styles.locationText}>{item.country}</Text>
          </View>
          <Text style={styles.priceText}>PHP {item.price.toLocaleString()}</Text>
          <Text style={styles.pricedesc}> / pax</Text>
        </View>
        
        {/* Second row: Duration | Nights */}
        <View style={styles.tourInfoRow}>
          <Text style={styles.durationText}></Text>
          <Text style={styles.nightsText}>{item.duration} {item.nights} NIGHTS</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.availabilityButton,
            !item.isAvailable && styles.unavailableButton
          ]}
        >
          <Ionicons 
            name="calendar-outline" 
            size={uniformScale(14)} 
            color={item.isAvailable ? "#154689" : "#999"} 
          />
          <Text style={[
            styles.availabilityText,
            !item.isAvailable && styles.unavailableText
          ]}>
            {item.isAvailable ? "DATES AVAILABLE" : "DATES UNAVAILABLE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 13. Filter Modal Component
  const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters }) => {
    const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

    const countries = [...new Set(tours.map(tour => tour.country))];
    const packageLabels = [...new Set(tours.map(tour => tour.package_label))];

    const toggleCountry = (country: string) => {
      setTempFilters(prev => ({
        ...prev,
        countries: prev.countries.includes(country)
          ? prev.countries.filter(c => c !== country)
          : [...prev.countries, country]
      }));
    };


    return (
      <Modal 
      visible={visible} 
      animationType="slide" 
      transparent
      statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={onClose}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={uniformScale(24)} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterSectionTitle}>Countries</Text>
              {countries.map(country => (
                <TouchableOpacity
                  key={country}
                  style={styles.filterOption}
                  onPress={() => toggleCountry(country)}
                >
                  <Text style={styles.filterOptionText}>{country}</Text>
                  <Ionicons
                    name={tempFilters.countries.includes(country) ? "checkbox" : "checkbox-outline"}
                    size={uniformScale(20)}
                    color="#154689"
                  />
                </TouchableOpacity>
              ))}

              <Text style={styles.filterSectionTitle}>Package Labels</Text>
              {packageLabels.map(label => (
                <TouchableOpacity
                  key={label}
                  style={styles.filterOption}
                  onPress={() => setTempFilters(prev => ({ ...prev, packageLabel: label }))}
                >
                  <Text style={styles.filterOptionText}>{label}</Text>
                  <Ionicons
                    name={tempFilters.packageLabel === label ? "radio-button-on" : "radio-button-off"}
                    size={uniformScale(20)}
                    color="#154689"
                  />
                </TouchableOpacity>
              ))}

              <Text style={styles.filterSectionTitle}>Availability</Text>
              {['all', 'available', 'unavailable'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.filterOption}
                  onPress={() => setTempFilters(prev => ({ ...prev, availability: option }))}
                >
                  <Text style={styles.filterOptionText}>
                    {option === 'all' ? 'All' : option === 'available' ? 'Available' : 'Unavailable'}
                  </Text>
                  <Ionicons
                    name={tempFilters.availability === option ? "radio-button-on" : "radio-button-off"}
                    size={uniformScale(20)}
                    color="#154689"
                  />
                </TouchableOpacity>
              ))}

              <Text style={styles.filterSectionTitle}>Price Range</Text>
              {['all', '0-20000', '20001-40000', '40001-60000', '60001-'].map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.filterOption}
                  onPress={() => setTempFilters(prev => ({ ...prev, priceRange: option }))}
                >
                  <Text style={styles.filterOptionText}>
                    {option === 'all' ? 'All Prices' : 
                     option === '0-20000' ? '₱0 - ₱20,000' :
                     option === '20001-40000' ? '₱20,001 - ₱40,000' :
                     option === '40001-60000' ? '₱40,001 - ₱60,000' :
                     '₱60,001+'}
                  </Text>
                  <Ionicons
                    name={tempFilters.priceRange === option ? "radio-button-on" : "radio-button-off"}
                    size={uniformScale(20)}
                    color="#154689"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setTempFilters({ 
                  countries: [], 
                  priceRange: 'all', 
                  duration: 'all', 
                  availability: 'all',
                  packageLabel: 'all' 
                })}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => onApply(tempFilters)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 14. Sort Modal Component
  const SortModal: React.FC<SortModalProps> = ({ visible, onClose, onApply, currentSort }) => {
    const sortOptions = [
      { key: 'name', label: 'Name (A-Z)' },
      { key: 'price-low', label: 'Price (Low to High)' },
      { key: 'price-high', label: 'Price (High to Low)' },
      { key: 'rating', label: 'Rating (Highest)' },
      { key: 'duration', label: 'Duration' },
    ];

    return (
      <Modal visible={visible} animationType="slide" transparent statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sortModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={uniformScale(24)} color="#333" />
              </TouchableOpacity>
            </View>

            {sortOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                style={styles.sortOption}
                onPress={() => onApply(option.key as SortOption)}
              >
                <Text style={styles.sortOptionText}>{option.label}</Text>
                <Ionicons
                  name={currentSort === option.key ? "radio-button-on" : "radio-button-off"}
                  size={uniformScale(20)}
                  color="#154689"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    );
  };

  // 15. Main Render
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}> 
      <StatusBar 
      barStyle="dark-content" 
      backgroundColor="#f8f9fa" 
      translucent={Platform.OS === 'android'}/> 
        <SharedLayout>       
        <ScrollableLogo/>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>FAVORITE TOURS</Text>
          <View style={styles.headerSpacer}></View>
        </View>

        {/* Title and Controls */}
        <View style={styles.titleContainer}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.controlButtonText}>Filters</Text>
              <Ionicons name="funnel-outline" size={uniformScale(16)} color="#154689" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setShowSortModal(true)}
            >
              <Text style={styles.controlButtonText}>Sort</Text>
              <Ionicons name="swap-vertical-outline" size={uniformScale(16)} color="#154689" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tours List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#154689" />
            <Text style={styles.loadingText}>Loading favorite tours...</Text>
          </View>
        ) : filteredTours.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={uniformScale(60)} color="#ccc" />
            <Text style={styles.emptyText}>No favorite tours found</Text>
            <Text style={styles.emptySubtext}>Start exploring and add some tours to your favorites!</Text>
          </View>
        ) : (
          <FlatList
            data={filteredTours}
            renderItem={renderTourCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={isLoading}
            onRefresh={fetchFavoriteTours}
          />
        )}

        {/* Modals */}
        <FilterModal
          visible={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={applyFilters}
          currentFilters={currentFilters}
        />

        <SortModal
          visible={showSortModal}
          onClose={() => setShowSortModal(false)}
          onApply={applySort}
          currentSort={currentSort}
        />
      </SharedLayout>
    </SafeAreaView>
  );
}

// 16. Stylesheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: uniformScale(10),
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: uniformScale(40),
  },
  emptyText: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    marginTop: uniformScale(20),
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#999',
    marginTop: uniformScale(10),
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'android' ? 0 : 0,
  },
  mainlogo: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: uniformScale(32),
    marginBottom: uniformScale(-20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(15),
  },
  backButton: {
    width: uniformScale(40),
    height: uniformScale(40),
    borderRadius: uniformScale(20),
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(2),
    elevation: 2,
  },
  headerLogo: {
    width: uniformScale(180),
    height: uniformScale(60),
  },
  headerTitle: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
  },
  headerSpacer: {
    width: uniformScale(40),
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(20),
  },
  pageTitle: {
    fontSize: fontScale(24),
    fontFamily: 'Poppins_700Bold',
    color: '#333',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: uniformScale(10),
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(8),
    borderWidth: 1,
    borderColor: '#154689',
    borderRadius: uniformScale(20),
    gap: uniformScale(5),
  },
  controlButtonText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
  },
  listContainer: {
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(20),
  },
  tourCard: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(15),
    marginBottom: uniformScale(15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: uniformScale(140),
  },
  tourImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  ratingBadge: {
    position: 'absolute',
    top: uniformScale(10),
    left: uniformScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(12),
    gap: uniformScale(3),
  },
  ratingText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  favoriteButton: {
    position: 'absolute',
    top: uniformScale(10),
    right: uniformScale(10),
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: uniformScale(8),
    borderRadius: uniformScale(20),
  },
  tourTitle: {
    paddingTop: uniformScale(15),
    paddingLeft: uniformScale(15),
    fontSize: fontScale(18),
    fontFamily: 'Poppins_700Bold',
    color: '#333',
    marginBottom: uniformScale(-5),
  },
  tourInfo: {
    paddingHorizontal: uniformScale(15),
    paddingBottom: uniformScale(15),
  },
  tourInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: uniformScale(3),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: uniformScale(3),
  },
  locationText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  priceText: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    textAlign: 'right',
  },
  pricedesc: {
    fontSize: fontScale(15),
    color: '#154689',
    fontFamily: 'Poppins_500Mediums',
  },
  durationText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    flex: 1,
  },
  nightsText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    textAlign: 'right',
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(8),
    borderWidth: 1,
    borderColor: '#154689',
    borderRadius: uniformScale(6),
    gap: uniformScale(5),
    alignSelf: 'flex-start',
    marginTop: uniformScale(-15),
  },
  unavailableButton: {
    borderColor: '#999',
  },
  availabilityText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
  },
  unavailableText: {
    color: '#999',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
    maxHeight: screenHeight * 0.85,
    width: screenWidth, // Explicitly set width
    alignSelf: 'center',
  },
  sortModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
    maxHeight: screenHeight * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: uniformScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  modalBody: {
    padding: uniformScale(20),
  },
  filterSectionTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(10),
    marginTop: uniformScale(10),
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: uniformScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingVertical: uniformScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: uniformScale(20),
    gap: uniformScale(10),
  },
  clearButton: {
    flex: 1,
    paddingVertical: uniformScale(12),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: uniformScale(8),
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    paddingVertical: uniformScale(12),
    backgroundColor: '#154689',
    borderRadius: uniformScale(8),
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
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