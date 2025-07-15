import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { ScrollableLogo } from '@/components/ScrollableLogo';
import { supabase } from '@/lib/supabase';

// Constants for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for consistent scaling
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const uniformScale = (size: number) => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

const fontScale = (size: number) => {
  const scale = screenWidth / BASE_WIDTH;
  const minScale = 0.8;
  const maxScale = 1.3;
  const clampedScale = Math.max(minScale, Math.min(maxScale, scale));
  return size * clampedScale;
};

// Types
interface Package {
  package_id: string;
  price: number;
  total_slots: number;
  status: string;
  created_at: string;
  package_label: string;
  tour_type: string;
  main_location?: string;
  duration?: number;
  nights?: number;
  rating?: number;
  image_url?: string;
}

interface FormattedPackage {
  id: string;
  main_location: string;
  price: string;
  duration: string;
  rating: number;
  imageUri: string;
  package_label: string;
  tour_type: string;
}

// Filter types
type FilterType = 'all' | 'domestic' | 'international';
type SortType = 'price_asc' | 'price_desc' | 'rating' | 'newest';

export default function SeeAllToursScreen() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<FormattedPackage[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_800ExtraBold_Italic
  });

  // Helper functions
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

  const formatPackageForDisplay = (pkg: Package): FormattedPackage => ({
    id: pkg.package_id,
    main_location: pkg.main_location || extractDestinationFromId(pkg.package_id),
    price: `PHP ${pkg.price.toLocaleString()}/PAX`,
    duration: `${pkg.duration} DAYS ${pkg.nights} NIGHTS` || "CONTACT FOR DETAILS",
    rating: pkg.rating || 4.5,
    imageUri: pkg.image_url || getDefaultImageForPackage(pkg.package_id),
    package_label: pkg.package_label,
    tour_type: pkg.tour_type,
  });

  // Fetch packages from Supabase
  const fetchPackages = async () => {
    try {
      setLoading(true);
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
        setPackages(packages);
        const formatted = packages.map(formatPackageForDisplay);
        setFilteredPackages(formatted);
      }
    } catch (error) {
      console.error('Error in fetchPackages:', error);
      Alert.alert('Error', 'Something went wrong while loading packages.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort packages
  const applyFiltersAndSort = () => {
    let filtered = packages.map(formatPackageForDisplay);

    // Apply search filter
    if (searchText.trim()) {
      filtered = filtered.filter(pkg =>
        pkg.main_location.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.tour_type.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(pkg => {
        if (activeFilter === 'domestic') return pkg.tour_type === 'Domestic';
        if (activeFilter === 'international') return pkg.tour_type === 'International';
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return parseInt(a.price.replace(/[^\d]/g, '')) - parseInt(b.price.replace(/[^\d]/g, ''));
        case 'price_desc':
          return parseInt(b.price.replace(/[^\d]/g, '')) - parseInt(a.price.replace(/[^\d]/g, ''));
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
        default:
          return 0; // Already sorted by created_at desc from database
      }
    });

    setFilteredPackages(filtered);
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchText, activeFilter, sortBy, packages]);

  const handlePackagePress = (packageId: string) => {
    router.push(`/(content)/package?packageId=${packageId}`);
  };

  const getSortButtonText = () => {
    switch (sortBy) {
      case 'price_asc': return 'Price: Low to High';
      case 'price_desc': return 'Price: High to Low';
      case 'rating': return 'Rating';
      case 'newest': return 'Newest';
      default: return 'Sort';
    }
  };

  const getFilterButtonText = () => {
    switch (activeFilter) {
      case 'domestic': return 'Domestic';
      case 'international': return 'International';
      default: return 'All Tours';
    }
  };

  const renderPackageItem = ({ item }: { item: FormattedPackage }) => (
    <TouchableOpacity 
      style={styles.packageItem} 
      onPress={() => handlePackagePress(item.id)}
    >
      <Image source={{ uri: item.imageUri }} style={styles.packageImage} />
      
      {/* Package Labels */}
      <View style={styles.labelsContainer}>
        <View style={[styles.labelBadge, { backgroundColor: item.tour_type === 'Domestic' ? '#154689' : '#FFA726' }]}>
          <Text style={styles.labelText}>{item.tour_type}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.packageInfo}>
        <Text style={styles.packageTitle}>{item.main_location}</Text>
        <Text style={styles.packagePrice}>{item.price}</Text>
        <View style={styles.packageInfoRow}>
        <Ionicons name="time-outline" size={uniformScale(12)} color="#888" />
        <Text style={styles.packageDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortModal = () => (
    showSortModal && (
      <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.sortModal}>
          <Text style={styles.modalTitle}>Sort by</Text>
          
          {[
            { key: 'newest', label: 'Newest' },
            { key: 'price_asc', label: 'Price: Low to High' },
            { key: 'price_desc', label: 'Price: High to Low' },
            { key: 'rating', label: 'Rating' },
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.activeSortOption
              ]}
              onPress={() => {
                setSortBy(option.key as SortType);
                setShowSortModal(false);
              }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.key && styles.activeSortOptionText
              ]}>
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={uniformScale(20)} color="#154689" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    )
  );

  const renderFilterModal = () => (
    showFilterModal && (
        <TouchableOpacity 
        style={styles.modalOverlay} 
        onPress={() => setShowFilterModal(false)}
        >
        <View style={styles.sortModal}>
            <Text style={styles.modalTitle}>Filter Tours</Text>
            
            {[
            { key: 'all', label: 'All Tours' },
            { key: 'domestic', label: 'Domestic' },
            { key: 'international', label: 'International' },
            ].map((option) => (
            <TouchableOpacity
                key={option.key}
                style={[
                styles.sortOption,
                activeFilter === option.key && styles.activeSortOption
                ]}
                onPress={() => {
                setActiveFilter(option.key as FilterType);
                setShowFilterModal(false);
                }}
            >
                <Text style={[
                styles.sortOptionText,
                activeFilter === option.key && styles.activeSortOptionText
                ]}>
                {option.label}
                </Text>
                {activeFilter === option.key && (
                <Ionicons name="checkmark" size={uniformScale(20)} color="#154689" />
                )}
            </TouchableOpacity>
            ))}
        </View>
        </TouchableOpacity>
    )
    );

  if (!fontsLoaded) {
    return null;
  }

   const handleBack = () => {
      router.back();
    };
  

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
       barStyle="dark-content"
       backgroundColor={Platform.OS === 'ios' ? undefined : "#f8f9fa"}
       translucent={Platform.OS === 'android'}
        />
      <BottomNavigationBar>
        <View style={styles.container}>
            <ScrollableLogo/>
            {/* Header */}
            <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={handleBack}
            >
                <Ionicons name="chevron-back" size={uniformScale(24)} color="#154689" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ALL TOURS</Text>
            <View style={styles.headerSpacer} />
            </View>
        

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={uniformScale(20)} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, tours..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
          </View>

          {/* Filter and Sort Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
                style={styles.filterDropdownButton}
                onPress={() => setShowFilterModal(true)}
            >
                <Ionicons name="options-outline" size={uniformScale(16)} color="#154689" />
                <Text style={styles.filterDropdownText}>{getFilterButtonText()}</Text>
                <Ionicons name="chevron-down" size={uniformScale(16)} color="#154689" />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => setShowSortModal(true)}
            >
                <Ionicons name="funnel-outline" size={uniformScale(16)} color="#154689" />
                <Text style={styles.sortButtonText}>{getSortButtonText()}</Text>
            </TouchableOpacity>
            </View>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#154689" />
              <Text style={styles.loadingText}>Loading tours...</Text>
            </View>
          ) : (
            /* Package List */
            <FlatList
              data={filteredPackages}
              renderItem={renderPackageItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              numColumns={2}
              columnWrapperStyle={styles.row}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={uniformScale(60)} color="#ccc" />
                  <Text style={styles.emptyTitle}>No tours found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try adjusting your search or filter criteria
                  </Text>
                </View>
              }
            />
          )}

          {/* Sort Modal */}
          {renderSortModal()}
          {/* Sort Modal */}
          {renderFilterModal()}
        </View>
      </BottomNavigationBar>
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
  },
  
   backButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
  },
  mainlogo: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: uniformScale(30),
    marginBottom: uniformScale(-20),
  },
  headerLogo: {
    width: uniformScale(180),
    height: uniformScale(60),
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
  headerTitle: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
  },
  headerSpacer: {
    width: uniformScale(40),
  },
   sectionContainer: {
    backgroundColor: '#e8e8e8',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
    borderRadius: uniformScale(10),
    paddingVertical: uniformScale(12),
    paddingHorizontal: uniformScale(16),
  },
  sectionTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: uniformScale(160),
    height: uniformScale(50),
  },
  placeholder: {
    width: uniformScale(40),
  },
  titleContainer: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  pageTitle: {
    fontSize: fontScale(28),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    marginBottom: uniformScale(5),
  },
  resultCount: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: uniformScale(20),
    paddingHorizontal: uniformScale(15),
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(12),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: uniformScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  filterDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(8),
    borderRadius: uniformScale(20),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: uniformScale(5),
    flex: 1,
    marginRight: uniformScale(10),
    },
  filterDropdownText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
    flex: 1,
    },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: uniformScale(10),
    gap: uniformScale(8),
    },
  filterButton: {
    flex: 1, 
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(8),
    borderRadius: uniformScale(20),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    },
  activeFilterButton: {
    backgroundColor: '#154689',
    borderColor: '#154689',
  },
  filterButtonText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  activeFilterButtonText: {
    color: '#ffffff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(8),
    borderRadius: uniformScale(20),
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: uniformScale(5),
  },
  sortButtonText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginTop: uniformScale(10),
  },
  listContainer: {
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(100),
  },
  row: {
    justifyContent: 'space-between',
  },
  packageItem: {
    width: (screenWidth - uniformScale(50)) / 2,
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    marginBottom: uniformScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageImage: {
    width: '100%',
    height: uniformScale(120),
    borderTopLeftRadius: uniformScale(12),
    borderTopRightRadius: uniformScale(12),
  },
  labelsContainer: {
    position: 'absolute',
    top: uniformScale(10),
    left: uniformScale(10),
    right: uniformScale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelBadge: {
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(10),
  },
  labelText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(10),
    gap: uniformScale(2),
  },
  ratingText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  packageInfo: {
    padding: uniformScale(12),
  },
  packageTitle: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(4),
    lineHeight: fontScale(16),
  },
  packagePrice: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_700Bold',
    color: '#FAAD2B',
    marginBottom: uniformScale(2),
  },
  packageInfoRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: uniformScale(4),
  },
  packageDuration: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: uniformScale(60),
  },
  emptyTitle: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginTop: uniformScale(20),
    marginBottom: uniformScale(10),
  },
  emptySubtitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: uniformScale(40),
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sortModal: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    padding: uniformScale(20),
    margin: uniformScale(20), 
    width: screenWidth - uniformScale(40),
    maxWidth: uniformScale(300),
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(15),
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: uniformScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeSortOption: {
    backgroundColor: '#f8f9fa',
  },
  sortOptionText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  activeSortOptionText: {
    color: '#154689',
    fontFamily: 'Poppins_600SemiBold',
  },
});