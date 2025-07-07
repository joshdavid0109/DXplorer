// 1. Imports: Always at the top
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Google Fonts
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts
} from '@expo-google-fonts/poppins';

import BottomNavigationBar from '@/components/BottomNavigationBar';

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
  nights: string;
  imageUrl: string;
  price: string;
  isAvailable: boolean;
  isFavorite: boolean;
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
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating' | 'duration';

// 4. Component Definition
export default function FavoriteToursScreen() {
  // 5. State Variables
  const [tours, setTours] = useState<Tour[]>([
    {
      id: '1',
      title: 'OSAKA',
      country: 'Japan',
      location: 'Japan',
      rating: 4.5,
      duration: '5 DAYS',
      nights: '4 NIGHTS',
      imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=400',
      price: '₱35,999',
      isAvailable: true,
      isFavorite: true,
    },
    {
      id: '2',
      title: 'BORACAY',
      country: 'Philippines',
      location: 'Philippines',
      rating: 4.8,
      duration: '5 DAYS',
      nights: '4 NIGHTS',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      price: '₱15,999',
      isAvailable: true,
      isFavorite: true,
    },
    {
      id: '3',
      title: 'SINGAPORE',
      country: 'Singapore',
      location: 'Singapore',
      rating: 4.7,
      duration: '5 DAYS',
      nights: '4 NIGHTS',
      imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400',
      price: '₱25,999',
      isAvailable: true,
      isFavorite: true,
    },
    {
      id: '4',
      title: 'SINGAPORE',
      country: 'Singapore',
      location: 'Singapore',
      rating: 4.6,
      duration: '5 DAYS',
      nights: '4 NIGHTS',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      price: '₱28,999',
      isAvailable: false,
      isFavorite: true,
    },
  ]);

  const [filteredTours, setFilteredTours] = useState<Tour[]>(tours);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showSortModal, setShowSortModal] = useState<boolean>(false);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    countries: [],
    priceRange: 'all',
    duration: 'all',
    availability: 'all',
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

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154689" />
        <Text style={{ marginTop: uniformScale(10), fontSize: fontScale(14) }}>Loading...</Text>
      </View>
    );
  }

  // 7. Helper Functions
  const toggleFavorite = (tourId: string): void => {
    setTours(prevTours =>
      prevTours.map(tour =>
        tour.id === tourId ? { ...tour, isFavorite: !tour.isFavorite } : tour
      )
    );
    setFilteredTours(prevTours =>
      prevTours.map(tour =>
        tour.id === tourId ? { ...tour, isFavorite: !tour.isFavorite } : tour
      )
    );
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

    // Filter by duration (if needed)
    // Add more filter logic as needed

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
        sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
          const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
          return priceA - priceB;
        });
        break;
      case 'price-high':
        sorted.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
          const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
          return priceB - priceA;
        });
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
    }

  // 8. Render Tour Card Component
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
    
    <Text style={styles.tourTitle}>{item.title}</Text>
    
    {/* Two-column layout for tour info */}
    <View style={styles.tourInfo}>
      {/* First row: Location | Price */}
      <View style={styles.tourInfoRow}>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={uniformScale(14)} color="#ED1313" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.priceText}>{item.price} </Text>
        <Text style={styles.pricedesc}>/ pax</Text>
      </View>
      
      {/* Second row: Duration | Nights */}
      <View style={styles.tourInfoRow}>
        <Text style={styles.durationText}></Text>
        <Text style={styles.nightsText}>{item.duration} {item.nights}</Text>
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

  // 9. Filter Modal Component
  const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply, currentFilters }) => {
    const [tempFilters, setTempFilters] = useState<FilterOptions>(currentFilters);

    const countries = ['Japan', 'Philippines', 'Singapore', 'Thailand', 'Malaysia'];

    const toggleCountry = (country: string) => {
      setTempFilters(prev => ({
        ...prev,
        countries: prev.countries.includes(country)
          ? prev.countries.filter(c => c !== country)
          : [...prev.countries, country]
      }));
    };

    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
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
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setTempFilters({ countries: [], priceRange: 'all', duration: 'all', availability: 'all' })}
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

  // 10. Sort Modal Component
  const SortModal: React.FC<SortModalProps> = ({ visible, onClose, onApply, currentSort }) => {
    const sortOptions = [
      { key: 'name', label: 'Name (A-Z)' },
      { key: 'price-low', label: 'Price (Low to High)' },
      { key: 'price-high', label: 'Price (High to Low)' },
      { key: 'rating', label: 'Rating (Highest)' },
      { key: 'duration', label: 'Duration' },
    ];

    return (
      <Modal visible={visible} animationType="slide" transparent>
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

  // 11. Main Render
  return (
    <SafeAreaView style={styles.safeArea}> 
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <BottomNavigationBar>
        {/*Logo */}
        <View style={styles.mainlogo}>
          <Image
            source={require('../../assets/images/dx_logo_lg.png')} // Update path as needed
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

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
          </View>
        ) : (
          <FlatList
            data={filteredTours}
            renderItem={renderTourCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
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

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={handleNavChanges}>
              <Ionicons name="home" size={uniformScale(24)} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeNavBackground}>
            <Ionicons name="heart-outline" size={uniformScale(24)} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="calendar-outline" size={uniformScale(24)} color="#999" />
          </TouchableOpacity>
        </View>
      </BottomNavigationBar>
    </SafeAreaView>
  );
}

// 12. Stylesheet
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
  container: {
    flex: 1,
    paddingBottom: Platform.OS === 'android' ? 0 : 0, // iOS handles this automatically

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
    paddingTop: uniformScale(20),
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
    fontSize: fontScale(23),
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
    letterSpacing: uniformScale(2),
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#FAAD2B',
    textAlign: 'right',
  },
  pricedesc: {
    fontSize: fontScale(15),
    color: '#FAAD2B',
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
    maxHeight: screenHeight * 0.8,
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