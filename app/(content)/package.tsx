import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
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

// Import Supabase client
import { supabase } from '../../lib/supabase';

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

// Types for our data
interface PackageDetail {
  destination?: string;
  itinerary?: string;
  side_locations?: string[];
  inclusions?: string[];
  price?: number;
  image_url?: string;
  rating?: number;
  // Add other possible field names in case of mismatch
  package_name?: string;
  description?: string;
  locations?: string[];
  package_inclusions?: string[];
}

interface PackageDate {
  available_Date: {
    end: string;
    start: string;
    remaining_slots: number;
  };
}

export default function TourDetailScreen() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [packageData, setPackageData] = useState<PackageDetail | null>(null);
  const [availableDates, setAvailableDates] = useState<PackageDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatesModal, setShowDatesModal] = useState(false);
  const { packageId } = useLocalSearchParams<{ packageId: string }>();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold
  });
  const [showFullyBookedModal, setShowFullyBookedModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Or get from your auth context

  // Add useEffect to get current user
    useEffect(() => {
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      };
      getCurrentUser();
    }, []);

  // Helper function to safely get string value
  const safeString = (value: any, fallback: string = ''): string => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  // Helper function to safely get array value
  const safeArray = (value: any): any[] => {
    if (!Array.isArray(value)) return [];
    return value.filter(item => item !== null && item !== undefined && item !== '');
  };

  // Helper function to safely get number value
  const safeNumber = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value))) return fallback;
    return Number(value);
  };

  const areAllDatesFullyBooked = (): boolean => {
    console.log('=== DEBUGGING FULLY BOOKED CHECK ===');
    console.log('Available dates count:', availableDates.length);
    
    if (availableDates.length === 0) {
      console.log('No available dates found');
      return false;
    }
    
    // Collect all date ranges with their remaining slots (matching the modal logic)
    const allDateRanges: Array<{
      start: string;
      end: string;
      remaining_slots: number;
    }> = [];
    
    availableDates.forEach((dateRow, rowIndex) => {
      console.log(`Processing date row ${rowIndex}:`, dateRow);
      
      // Parse the JSON string if it's a string, otherwise use as object
      let parsedDates;
      try {
        parsedDates = typeof dateRow.available_Date === 'string' 
          ? JSON.parse(dateRow.available_Date) 
          : dateRow.available_Date;
      } catch (error) {
        console.error('Error parsing dates:', dateRow.available_Date, error);
        return;
      }

      // Check if parsedDates is an array
      if (!Array.isArray(parsedDates)) {
        console.error('Expected array of dates, got:', parsedDates);
        return;
      }

      // Add each date range to our collection with metadata (same as modal)
      parsedDates.forEach((dateRange, dateIndex) => {
        if (dateRange && dateRange.start && dateRange.end) {
          // Create the same structure as in the modal
          const dateRangeWithSlots = {
            ...dateRange,
            originalRowIndex: rowIndex,
            originalDateIndex: dateIndex,
            startDate: new Date(dateRange.start)
          };
          
          // Get remaining slots using the same safeNumber logic as modal
          const remainingSlots = safeNumber(dateRangeWithSlots.remaining_slots, 0);
          
          console.log(`Date range ${dateIndex} - Start: ${dateRange.start}, End: ${dateRange.end}, Remaining slots: ${remainingSlots}`);
          
          allDateRanges.push({
            start: dateRange.start,
            end: dateRange.end,
            remaining_slots: remainingSlots
          });
        }
      });
    });

    console.log('All collected date ranges:', allDateRanges);
    
    // If no date ranges found, return false
    if (allDateRanges.length === 0) {
      console.log('No valid date ranges found');
      return false;
    }

    // Check if ALL date ranges have 0 remaining slots
    const allFullyBooked = allDateRanges.every(dateRange => dateRange.remaining_slots === 0);
    console.log('Are all dates fully booked?', allFullyBooked);
    
    return allFullyBooked;
  };

  // Fetch package data from Supabase
  useEffect(() => {
    const fetchPackageData = async () => {

      if (!packageId) {
        console.log('No packageId provided');
        setError('Package ID not provided');
        setLoading(false);
        return;
      }

      // Clean the packageId (remove any extra spaces)
      const cleanPackageId = packageId.trim();
      console.log('Cleaned packageId:', cleanPackageId);

      try {
        // Test query to see all package_ids and their columns in both tables
        const { data: allPackages, error: allError } = await supabase
          .from('packages')
          .select(`
            *,
            package_details (
              itinerary,
              side_locations,
              inclusions
            )
          `)
          .limit(1);
        

        // Fetch package details with JOIN to get data from both tables
        const { data: packageDetails, error: packageError } = await supabase
          .from('packages')
          .select(`
            *,
            package_details (
              itinerary,
              side_locations,
              inclusions
            )
          `)
          .eq('package_id', cleanPackageId);
        if (packageError) {
          console.error('Error fetching package details:', packageError);
          setError('Failed to load package details');
          setLoading(false);
          return;
        }

        // Check if any package was found
        if (!packageDetails || packageDetails.length === 0) {
          console.log('No package found with ID:', cleanPackageId);
          
          // Get all available package IDs for debugging
          const { data: allIds } = await supabase
            .from('packages')
            .select('package_id');
          
          console.log('Available package IDs:', allIds?.map(p => p.package_id));
          setError(`Package not found. Looking for: "${cleanPackageId}"`);
          setLoading(false);
          return;
        }

        // Use the first package (should be only one)
        const rawPackageData = packageDetails[0];
        
        // Flatten the data structure since we have nested package_details
        const flattenedData = {
          ...rawPackageData,
          ...(rawPackageData.package_details || {})
        };
        

        // Fetch available dates
        const { data: dates, error: datesError } = await supabase
          .from('package_dates')
          .select('available_Date')
          .eq('package_id', cleanPackageId);


        if (datesError) {
          console.error('Error fetching dates:', datesError);
          // Don't show error for dates as it's not critical
        }

        setPackageData(flattenedData);
        setAvailableDates(dates || []);
        setError(null);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, [packageId]);

   useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!currentUser || !packageId) return;

      try {
        const { data, error } = await supabase
          .from('liked_packages')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('package_id', packageId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking favorite status:', error);
          return;
        }

        setIsFavorite(!!data);
      } catch (error) {
        console.error('Unexpected error checking favorite:', error);
      }
    };

    checkFavoriteStatus();
  }, [currentUser, packageId]);


  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#154689" />
          <Text style={styles.loadingText}>Loading package details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !packageData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Package not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  } else {
    console.log(packageData)
  }

  // Safely extract data with fallbacks - updated field mappings
  const destination = safeString(packageData.title || packageData.main_location || packageData.destination, 'Unknown Destination');
  const itinerary = safeString(packageData.itinerary || packageData.description, 'No description available');
  const sideLocations = safeArray(packageData.side_locations || packageData.locations);
  const inclusions = safeArray(packageData.inclusions || packageData.package_inclusions);
  const price = safeNumber(packageData.price, 0);
  const imageUrl = safeString(packageData.image_url, 'https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=250&fit=crop');
  const rating = packageData.rating ? safeNumber(packageData.rating) : null;

  // Process inclusions data - with proper null checks
  // Process inclusions data - with proper null checks
const processedInclusions = inclusions
  .filter(inclusion => inclusion != null && inclusion !== '' && inclusion !== undefined)
  .map((inclusion: any, index: number) => {
    const iconMap: { [key: string]: string } = {
      'DAYS': 'airplane',
      'AIRPORT': 'car',
      'VISA': 'document-text',
      'AIRFARE': 'airplane',
      'HOTEL': 'bed',
      'BREAKFAST': 'restaurant',
      'TRANSFER': 'car',
      'TOUR': 'map'
    };

    const colorMap = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    
    // Handle both string and object inclusions
    let inclusionString = '';
    let subtitle = '';
    
    if (typeof inclusion === 'string') {
      inclusionString = inclusion;
    } else if (typeof inclusion === 'object' && inclusion !== null) {
      // Debug: log the object structure
      console.log('Object inclusion:', inclusion);
      
      // Handle different object structures
      if (Array.isArray(inclusion)) {
        // If it's an array, join the elements
        inclusionString = inclusion.join(' + ');
      } else {

        const entries = Object.entries(inclusion);
        if (entries.length > 0) {
          const [key, value] = entries[0];
          inclusionString = key;
          // Set subtitle if value exists and has content
          if (value && typeof value === 'string' && value.trim()) {
            subtitle = value.trim();
          }
        } else {
          // Fallback: try different common property names for the main text
          inclusionString = inclusion.title || 
                           inclusion.name || 
                           inclusion.text || 
                           inclusion.label || 
                           inclusion.value ||
                           inclusion.description;
          
          // If no standard property found, try to extract from object values
          if (!inclusionString) {
            const values = Object.values(inclusion).filter(val => 
              typeof val === 'string' && val.trim() !== ''
            );
            if (values.length > 0) {
              inclusionString = values[0] as string;
            }
          }
          
          // Last resort - convert to string but clean it up
          if (!inclusionString) {
            const jsonStr = JSON.stringify(inclusion);
            // Remove brackets and quotes, replace commas with spaces
            inclusionString = jsonStr
              .replace(/[{}"[\]]/g, '')
              .replace(/,/g, ' ')
              .replace(/:/g, ': ')
              .trim();
          }
        }
      
        if (entries.length > 1) {
          subtitle = entries[1][1] as string || '';
        }
      }
    } else {
      inclusionString = String(inclusion);
    }
    
    // Clean up the string - remove extra quotes and brackets
    inclusionString = inclusionString.replace(/^["']|["']$/g, '').trim();
    subtitle = subtitle.replace(/^["']|["']$/g, '').trim();
    
    const inclusionText = inclusionString.toUpperCase();
    
    let icon = 'checkmark-circle';
    for (const [key, value] of Object.entries(iconMap)) {
      if (inclusionText.includes(key)) {
        icon = value;
        break;
      }
    }

    return {
      icon,
      title: inclusionString,
      subtitle: subtitle,
      color: colorMap[index % colorMap.length]
    };
  });

  const handleBackButton = () => {
    router.back();
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('liked_packages')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('package_id', packageId);

        if (error) {
          console.error('Error removing favorite:', error);
          Alert.alert('Error', 'Failed to remove from favorites');
          return;
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('liked_packages')
          .insert({
            user_id: currentUser.id,
            package_id: packageId,
            liked_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error adding favorite:', error);
          Alert.alert('Error', 'Failed to add to favorites');
          return;
        }
      }

      // Update local state
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleBookButton = () => {
    if (areAllDatesFullyBooked()) {
      setShowFullyBookedModal(true);
    } else {
      router.push(`/(content)/booking?packageId=${packageId}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      console.log('Formatting date:', dateString);
      
      // Handle YYYY-MM-DD format from database
      const date = new Date(dateString + 'T00:00:00'); // Add time to ensure proper parsing
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return dateString; // Return original string if can't parse
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Original:', dateString);
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDayName = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        weekday: 'short'
      });
    } catch (error) {
      return '';
    }
  };

   const getSlotsStatus = (remainingSlots: number) => {
    if (remainingSlots === 0) {
      return { text: 'FULLY BOOKED', color: '#FF5252', bgColor: '#FFEBEE' };
    } else if (remainingSlots <= 3) {
      return { text: 'ALMOST FULL', color: '#FF9800', bgColor: '#FFF3E0' };
    } else if (remainingSlots <= 5) {
      return { text: 'FILLING FAST', color: '#FFC107', bgColor: '#FFFDE7' };
    } else {
      return { text: 'AVAILABLE', color: '#4CAF50', bgColor: '#E8F5E8' };
    }
  };

  // Available Dates Modal Component
  const AvailableDatesModal = () => (
     <Modal
      animationType="slide"
      transparent={true}
      visible={showDatesModal}
      onRequestClose={() => setShowDatesModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AVAILABLE DATES</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDatesModal(false)}
            >
              <Ionicons name="close" size={uniformScale(24)} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {availableDates.length > 0 ? (
              <View style={styles.datesGrid}>
                {(() => {
                  // First, collect all date ranges with their metadata
                  const allDateRanges: Array<{
                    start: string;
                    end: string;
                    remaining_slots: number;
                    originalRowIndex: number;
                    originalDateIndex: number;
                    startDate: Date;
                  }> = [];
                  
                  availableDates.forEach((dateRow, rowIndex) => {
                    // Parse the JSON string if it's a string, otherwise use as object
                    let parsedDates;
                    try {
                      parsedDates = typeof dateRow.available_Date === 'string' 
                        ? JSON.parse(dateRow.available_Date) 
                        : dateRow.available_Date;
                    } catch (error) {
                      console.error('Error parsing dates:', dateRow.available_Date, error);
                      return;
                    }

                    // Check if parsedDates is an array
                    if (!Array.isArray(parsedDates)) {
                      console.error('Expected array of dates, got:', parsedDates);
                      return;
                    }

                    // Add each date range to our collection with metadata
                    parsedDates.forEach((dateRange, dateIndex) => {
                      if (dateRange && dateRange.start && dateRange.end) {
                        allDateRanges.push({
                          ...dateRange,
                          originalRowIndex: rowIndex,
                          originalDateIndex: dateIndex,
                          startDate: new Date(dateRange.start)
                        });
                      }
                    });
                  });

                  // Sort all date ranges by start date (nearest to farthest)
                  allDateRanges.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

                  // Render the sorted date ranges
                  return allDateRanges.map((dateRange, sortedIndex) => {
                    // Get remaining slots for this date range
                    const remainingSlots = safeNumber(dateRange.remaining_slots, 0);
                    const slotsStatus = getSlotsStatus(remainingSlots);

                    // Calculate duration
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <View key={`sorted-${sortedIndex}`} style={styles.dateCard}>
                        <View style={styles.dateHeader}>
                          <View style={styles.dateIconContainer}>
                            <Ionicons name="calendar" size={uniformScale(18)} color="#154689" />
                          </View>
                          <Text style={styles.durationText}>{duration} Days</Text>
                        </View>
                        
                        <View style={styles.dateRange}>
                          <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>DEPARTURE</Text>
                            <Text style={styles.dateValue}>
                              {formatDateShort(dateRange.start)}
                            </Text>
                            <Text style={styles.dayName}>
                              {formatDayName(dateRange.start)}
                            </Text>
                          </View>
                          
                          <View style={styles.dateArrow}>
                            <Ionicons name="arrow-forward" size={uniformScale(20)} color="#FFA726" />
                          </View>
                          
                          <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>ARRIVAL</Text>
                            <Text style={styles.dateValue}>
                              {formatDateShort(dateRange.end)}
                            </Text>
                            <Text style={styles.dayName}>
                              {formatDayName(dateRange.end)}
                            </Text>
                          </View>
                        </View>

                        {/* Slots Information */}
                        <View style={styles.slotsSection}>
                          <View style={styles.slotsInfo}>
                            <View style={styles.slotsIconContainer}>
                              <Ionicons 
                                name="people" 
                                size={uniformScale(16)} 
                                color="#666" 
                              />
                            </View>
                            <Text style={styles.slotsText}>
                              {remainingSlots} slots remaining
                            </Text>
                          </View>
                          
                          <View style={[
                            styles.statusBadge, 
                            { backgroundColor: slotsStatus.bgColor }
                          ]}>
                            <Text style={[
                              styles.statusText, 
                              { color: slotsStatus.color }
                            ]}>
                              {slotsStatus.text}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>
            ) : (
              <View style={styles.emptyDatesContainer}>
                <Ionicons name="calendar-outline" size={uniformScale(48)} color="#ccc" />
                <Text style={styles.emptyDatesText}>No available dates at the moment</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const FullyBookedModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showFullyBookedModal}
      onRequestClose={() => setShowFullyBookedModal(false)}
    >
      <View style={styles.fullyBookedModalOverlay}>
        <View style={styles.fullyBookedModalContainer}>
          {/* Icon */}
          <View style={styles.fullyBookedIconContainer}>
            <Ionicons name="calendar-outline" size={uniformScale(48)} color="#FF5252" />
          </View>
          
          {/* Title */}
          <Text style={styles.fullyBookedTitle}>FULLY BOOKED</Text>
          
          {/* Message */}
          <Text style={styles.fullyBookedMessage}>
            All available dates for this tour are currently fully booked. Please check back later or contact us for more information.
          </Text>
          
          {/* Buttons */}
          <View style={styles.fullyBookedButtonContainer}>
            <TouchableOpacity 
              style={styles.fullyBookedContactButton}
              onPress={() => {
                setShowFullyBookedModal(false);
                // Add your contact logic here
              }}
            >
              <Text style={styles.fullyBookedContactButtonText}>CONTACT US</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fullyBookedOkButton}
              onPress={() => setShowFullyBookedModal(false)}
            >
              <Text style={styles.fullyBookedOkButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.mainlogo}>
          <Image
            source={require('../../assets/images/dx_logo_lg.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>TOUR DETAILS</Text>
          <View style={styles.headerSpacer}></View>
        </View>

        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.mainImage}
          />
          
          {/* Rating Badge */}
          {rating && rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.destinationTitle}>{destination.toUpperCase()}</Text>
            <TouchableOpacity onPress={handleFavoriteToggle}>
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={uniformScale(24)} 
                color={isFavorite ? "#FF6B6B" : "#666"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            {itinerary}
          </Text>
        </View>

        {/* Side Locations */}
        {sideLocations.length > 0 && (
          <View style={styles.sideLocationsSection}>
            <Text style={styles.sectionTitle}>INCLUDED LOCATIONS</Text>
            <View style={styles.locationsGrid}>
              {sideLocations.map((location, index) => (
                <View key={index} style={styles.locationItem}>
                  <Ionicons name="location" size={uniformScale(16)} color="#154689" />
                  <Text style={styles.locationText}>{safeString(location)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Check Available Dates Button */}
        {availableDates.length > 0 && (
          <View style={styles.availableDatesSection}>
            <TouchableOpacity 
              style={styles.checkDatesButton}
              onPress={() => setShowDatesModal(true)}
            >
              <View style={styles.checkDatesContent}>
                <Ionicons name="calendar" size={uniformScale(20)} color="#154689" />
                <Text style={styles.checkDatesText}>CHECK AVAILABLE DATES</Text>
                <Ionicons name="chevron-forward" size={uniformScale(20)} color="#154689" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Inclusions Section */}
        {processedInclusions.length > 0 && (
        <View style={styles.inclusionsSection}>
          <Text style={styles.sectionTitle}>INCLUSIONS</Text>
          
          <View style={styles.inclusionsGrid}>
            {processedInclusions.map((item, index) => (
              <View key={index} style={styles.inclusionItem}>
                <View style={[styles.inclusionIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={uniformScale(20)} color="#ffffff" />
                </View>
                <View style={styles.inclusionText}>
                  <Text style={styles.inclusionTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.inclusionSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      </ScrollView>

      

      {/* Bottom Section - Price and Book Button */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>PHP {price.toLocaleString()}</Text>
          <Text style={styles.subprice}>PER PAX</Text>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookButton}>
          <Text style={styles.bookButtonText}>BOOK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>

    {/* Available Dates Modal */}
      <AvailableDatesModal />
    {/* Fully Booked Modal */}
      <FullyBookedModal />
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
    marginTop: uniformScale(10),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    marginBottom: uniformScale(20),
    textAlign: 'center',
    paddingHorizontal: uniformScale(20),
  },
  mainlogo: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: uniformScale(30),
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
  backButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
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
  imageContainer: {
    marginHorizontal: uniformScale(20),
    borderRadius: uniformScale(15),
    overflow: 'hidden',
    marginBottom: uniformScale(20),
  },
  mainImage: {
    width: '100%',
    height: uniformScale(200),
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
  },
  ratingText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  titleSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationTitle: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
  },
  descriptionSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  descriptionText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: fontScale(22),
    textAlign: 'justify',
  },
  sideLocationsSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(20),
  },
  locationsList: {
    gap: uniformScale(8),
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: uniformScale(8),
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(8),
    width: '48%', // Two columns with small gap
    marginBottom: uniformScale(8),
  },
  locationText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
    flex: 1, // Allow text to wrap if needed
  },
  availableDatesSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(25),
  },
  checkDatesButton: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    padding: uniformScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  checkDatesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkDatesText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
    flex: 1,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
    maxHeight: screenHeight * 0.8,
    paddingBottom: uniformScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingTop: uniformScale(20),
    paddingBottom: uniformScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_700Bold',
    color: '#333',
  },
  closeButton: {
    width: uniformScale(36),
    height: uniformScale(36),
    borderRadius: uniformScale(18),
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: uniformScale(20),
    paddingTop: uniformScale(15),
  },
  datesGrid: {
    gap: uniformScale(5),
  },
  dateCard: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    padding: uniformScale(16),
    marginBottom: uniformScale(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
    borderLeftWidth: uniformScale(9),
    borderLeftColor: '#FAAD2B',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: uniformScale(12),
  },
  dateIconContainer: {
    width: uniformScale(32),
    height: uniformScale(20),
    borderRadius: uniformScale(16),
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#FAAD2B',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(8),
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    marginBottom: uniformScale(4),
    letterSpacing: uniformScale(0.5),
  },
  dateValue: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    marginBottom: uniformScale(2),
  },
  dayName: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  dateArrow: {
    marginHorizontal: uniformScale(16),
  },
  emptyDatesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: uniformScale(40),
  },
  emptyDatesText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#999',
    marginTop: uniformScale(12),
    textAlign: 'center',
  },
  fullyBookedModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1001,
},
fullyBookedModalContainer: {
  backgroundColor: '#ffffff',
  borderRadius: uniformScale(20),
  padding: uniformScale(30),
  marginHorizontal: uniformScale(30),
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: uniformScale(4),
  },
  shadowOpacity: 0.3,
  shadowRadius: uniformScale(8),
  elevation: 10,
  },
  fullyBookedIconContainer: {
    width: uniformScale(80),
    height: uniformScale(80),
    borderRadius: uniformScale(40),
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: uniformScale(20),
  },
  fullyBookedTitle: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_700Bold',
    color: '#FF5252',
    marginBottom: uniformScale(15),
    textAlign: 'center',
  },
  fullyBookedMessage: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: fontScale(22),
    marginBottom: uniformScale(25),
  },
  fullyBookedButtonContainer: {
    flexDirection: 'row',
    gap: uniformScale(12),
    width: '100%',
  },
  fullyBookedContactButton: {
    flex: 1,
    backgroundColor: '#154689',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(25),
    alignItems: 'center',
  },
  fullyBookedContactButtonText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
    letterSpacing: uniformScale(0.5),
  },
  fullyBookedOkButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(25),
    alignItems: 'center',
  },
  fullyBookedOkButtonText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    letterSpacing: uniformScale(0.5),
  },
  slotsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: uniformScale(12),
    paddingTop: uniformScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  slotsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(6),
  },
  slotsIconContainer: {
    width: uniformScale(24),
    height: uniformScale(24),
    borderRadius: uniformScale(12),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotsText: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(8),
  },
  statusText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: uniformScale(0.5),
  },
  sectionTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#333',
    marginBottom: uniformScale(15),
  },
  inclusionsSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(120),
  },
  inclusionsGrid: {
    gap: uniformScale(15),
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(15),
  },
  inclusionIcon: {
    width: uniformScale(40),
    height: uniformScale(40),
    borderRadius: uniformScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inclusionText: {
    flex: 1,
  },
  inclusionTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  inclusionSubtitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: uniformScale(2),
    fontStyle: 'italic',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: uniformScale(20),
    paddingVertical: uniformScale(10),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(2),
  },
  price: {
    fontSize: fontScale(24),
    fontFamily: 'Poppins_700Bold',
    color: '#022657',
    marginBottom: uniformScale(-5)
  },
  subprice: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_700Bold',
    color: '#FAAD2B'
  },
  bookButton: {
    backgroundColor: '#FFA726',
    paddingHorizontal: uniformScale(40),
    paddingVertical: uniformScale(15),
    borderRadius: uniformScale(25),
  },
  bookButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#022657',
    letterSpacing: uniformScale(1),
  },
});