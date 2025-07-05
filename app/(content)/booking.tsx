import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
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
interface AvailableDate {
  start: string;
  end: string;
  remaining_slots: number;
}

interface PackageDate {
  available_Date: AvailableDate[];
}

export default function CompleteBookingScreen() {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [numberOfPax, setNumberOfPax] = useState(2);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packagePrice, setPackagePrice] = useState(49999);

  const { packageId } = useLocalSearchParams<{ packageId: string }>();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Fetch available dates from Supabase
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!packageId) {
        setError('Package ID not provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch package price
        const { data: packageData, error: packageError } = await supabase
          .from('packages')
          .select('price')
          .eq('package_id', packageId.trim())
          .single();

        if (packageError) {
          console.error('Error fetching package:', packageError);
        } else if (packageData) {
          setPackagePrice(packageData.price || 49999);
        }

        // Fetch available dates
        const { data: datesData, error: datesError } = await supabase
          .from('package_dates')
          .select('available_Date')
          .eq('package_id', packageId.trim());

        if (datesError) {
          console.error('Error fetching dates:', datesError);
          setError('Failed to load available dates');
          setLoading(false);
          return;
        }

        // Process the dates data
        const processedDates: AvailableDate[] = [];
        
        if (datesData && datesData.length > 0) {
          datesData.forEach(dateRow => {
            try {
              let parsedDates;
              if (typeof dateRow.available_Date === 'string') {
                parsedDates = JSON.parse(dateRow.available_Date);
              } else {
                parsedDates = dateRow.available_Date;
              }

              if (Array.isArray(parsedDates)) {
                parsedDates.forEach(dateRange => {
                  if (dateRange && dateRange.start && dateRange.end) {
                    processedDates.push({
                      start: dateRange.start,
                      end: dateRange.end,
                      remaining_slots: dateRange.remaining_slots || 0
                    });
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing date:', error);
            }
          });
        }

        setAvailableDates(processedDates);
        setError(null);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [packageId]);

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#154689" />
          <Text style={styles.loadingText}>Loading available dates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Helper function to get available dates for a specific date
  const getAvailableDateInfo = (date: Date): AvailableDate | null => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.find(availableDate => {
      const startDate = new Date(availableDate.start);
      const endDate = new Date(availableDate.end);
      const checkDate = new Date(dateString);
      
      return checkDate >= startDate && checkDate <= endDate;
    }) || null;
  };

  // Helper function to check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    return getAvailableDateInfo(date) !== null;
  };

  // Helper function to check if a date is a start date
  const isStartDate = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.some(availableDate => availableDate.start === dateString);
  };

  // Helper function to check if a date is an end date
  const isEndDate = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0];
    return availableDates.some(availableDate => availableDate.end === dateString);
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(currentYear, currentMonth, day));
    }
    
    // Group into weeks
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return weeks;
  };

  const calendarWeeks = generateCalendarDays();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const subtotal = packagePrice * numberOfPax;

  const handleDatePress = (date: Date) => {
    if (!isDateAvailable(date)) return;

    // Check if this date is part of an available date range
    const availableDateInfo = getAvailableDateInfo(date);
    if (!availableDateInfo) return;

    // Set the entire date range
    setSelectedStartDate(new Date(availableDateInfo.start));
    setSelectedEndDate(new Date(availableDateInfo.end));
  };

  const isDateInSelectedRange = (date: Date): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateString = date.toISOString().split('T')[0];
    const startString = selectedStartDate.toISOString().split('T')[0];
    const endString = selectedEndDate.toISOString().split('T')[0];
    return dateString === startString || dateString === endString;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleProceedButton = () => {
    if (!selectedStartDate || !selectedEndDate) {
      alert('Please select a date range first');
      return;
    }

    // Get the selected date range info
    const selectedDateRange = availableDates.find(dateRange => {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      return selectedStartDate.toISOString().split('T')[0] === startDate.toISOString().split('T')[0] &&
            selectedEndDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];
    });

    // Prepare booking data object
    const bookingData = {
      // Package Information
      packageId: packageId,
      packagePrice: packagePrice,
      
      // Date Information
      startDate: selectedStartDate.toISOString().split('T')[0], // "2025-09-09"
      endDate: selectedEndDate.toISOString().split('T')[0],     // "2025-09-14"
      dateId: selectedDateRange ? availableDates.indexOf(selectedDateRange) : 0, // For tracking which date range was selected
      
      // Booking Details
      numberOfPax: numberOfPax,
      subtotal: subtotal,
      totalPrice: subtotal, // You can add taxes, fees, etc. here later
      
      // Additional Information
      remainingSlots: selectedDateRange?.remaining_slots || 0,
      
      // Formatted display dates
      displayDateRange: formatSelectedDate(),
      
      // Timestamp for booking creation
      bookingTimestamp: new Date().toISOString(),
    };

    // Navigate to payment page with booking data
    router.push({
      pathname: '/(content)/payment',
      params: {
        bookingData: JSON.stringify(bookingData)
      }
    });
  };

  const formatSelectedDate = () => {
    if (!selectedStartDate || !selectedEndDate) return '';
    
    const startDay = selectedStartDate.getDate();
    const endDay = selectedEndDate.getDate();
    const monthName = monthNames[selectedStartDate.getMonth()];
    const year = selectedStartDate.getFullYear();
    
    return `${startDay} - ${endDay} ${monthName}, ${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#154689" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Booking</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Calendar Section */}
        <View style={styles.calendarContainer}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.monthNavButton}
              onPress={() => navigateMonth('prev')}
            >
              <Ionicons name="chevron-back" size={uniformScale(20)} color="#666" />
            </TouchableOpacity>
            <View style={styles.monthYearContainer}>
              <Text style={styles.monthText}>{monthNames[currentMonth]}</Text>
              <Text style={styles.yearText}>{currentYear}</Text>
            </View>
            <TouchableOpacity 
              style={styles.monthNavButton}
              onPress={() => navigateMonth('next')}
            >
              <Ionicons name="chevron-forward" size={uniformScale(20)} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Day Labels */}
          <View style={styles.dayLabelsContainer}>
            {dayLabels.map((label, index) => (
              <View key={index} style={styles.dayLabel}>
                <Text style={styles.dayLabelText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <View key={dayIndex} style={styles.emptyCalendarDay} />;
                  }

                  const isAvailable = isDateAvailable(date);
                  const isSelected = isDateSelected(date);
                  const isInRange = isDateInSelectedRange(date);
                  const isStart = isStartDate(date);
                  const isEnd = isEndDate(date);
                  
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.selectedDay,
                        isInRange && !isSelected && styles.rangeDay,
                        !isAvailable && styles.disabledDay,
                        isStart && styles.startDay,
                        isEnd && styles.endDay,
                      ]}
                      onPress={() => handleDatePress(date)}
                      disabled={!isAvailable}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isSelected && styles.selectedDayText,
                        isInRange && !isSelected && styles.rangeDayText,
                        !isAvailable && styles.disabledDayText,
                        (isStart || isEnd) && styles.availableDayText,
                      ]}>
                        {date.getDate()}
                      </Text>
                      {(isStart || isEnd) && (
                        <View style={styles.availableDot} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Selected Date Range Display */}
          {selectedStartDate && selectedEndDate && (
            <View style={styles.selectedDateRange}>
              <Text style={styles.selectedDateText}>
                {formatSelectedDate()}
              </Text>
            </View>
          )}

          {/* Available Dates Info */}
          {availableDates.length > 0 && (
            <View style={styles.availableDatesInfo}>
              <Text style={styles.availableDatesTitle}>Available Date Ranges:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.availableDatesScroll}
              >
                {availableDates.map((dateRange, index) => (
                  <TouchableOpacity
                      key={index}
                      style={styles.availableDateChip}
                      onPress={() => {
                        const startDate = new Date(dateRange.start);
                        const endDate = new Date(dateRange.end);
                        
                        // Set the selected date range
                        setSelectedStartDate(startDate);
                        setSelectedEndDate(endDate);
                        
                        // Change calendar to show the month of the start date
                        setCurrentMonth(startDate.getMonth());
                        setCurrentYear(startDate.getFullYear());
                      }}
                    >
                      <Text style={styles.availableDateChipText}>
                        {new Date(dateRange.start).getDate()} - {new Date(dateRange.end).getDate()}
                      </Text>
                      <Text style={styles.availableDateChipSlots}>
                        {dateRange.remaining_slots} slots left
                      </Text>
                    </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Price Details Section */}
        <View style={styles.priceDetailsContainer}>
          <Text style={styles.priceDetailsTitle}>Price Details</Text>
          
          {/* Package Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Package Price/pax (5D4N)</Text>
            <Text style={styles.priceValue}>PHP {packagePrice.toLocaleString()}</Text>
          </View>

          {/* Number of Pax */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Number of pax</Text>
            <View style={styles.paxControls}>
              <TouchableOpacity 
                style={styles.paxButton}
                onPress={() => setNumberOfPax(Math.max(1, numberOfPax - 1))}
              >
                <Ionicons name="remove" size={uniformScale(16)} color="#666" />
              </TouchableOpacity>
              <Text style={styles.paxNumber}>{numberOfPax}</Text>
              <TouchableOpacity 
                style={styles.paxButton}
                onPress={() => setNumberOfPax(numberOfPax + 1)}
              >
                <Ionicons name="add" size={uniformScale(16)} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.priceDivider} />

          {/* Subtotal */}
          <View style={styles.priceRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>PHP {subtotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Proceed to Payment Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.proceedButton} onPress={handleProceedButton}>
          <Text style={styles.proceedButtonText}>PROCEED TO PAYMENT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  headerLogo: {
    width: uniformScale(180),
    height: uniformScale(60),
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
  headerTitle: {
    fontSize: fontScale(23),
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
  },
  headerSpacer: {
    width: uniformScale(40),
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(30),
    borderRadius: uniformScale(15),
    padding: uniformScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: uniformScale(20),
  },
  monthNavButton: {
    width: uniformScale(32),
    height: uniformScale(32),
    borderRadius: uniformScale(16),
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  yearText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  dayLabelsContainer: {
    flexDirection: 'row',
    marginBottom: uniformScale(10),
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: uniformScale(8),
  },
  dayLabelText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  calendarGrid: {
    marginBottom: uniformScale(20),
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: uniformScale(5),
  },
  calendarDay: {
    flex: 1,
    height: uniformScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: uniformScale(8),
    marginHorizontal: uniformScale(2),
    position: 'relative',
  },
  emptyCalendarDay: {
    flex: 1,
    height: uniformScale(40),
  },
  selectedDay: {
    backgroundColor: '#154689',
  },
  rangeDay: {
    backgroundColor: '#E3F2FD',
  },
  disabledDay: {
    opacity: 0.3,
  },
  startDay: {
    backgroundColor: '#154689',
  },
  endDay: {
    backgroundColor: '#154689',
  },
  calendarDayText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  selectedDayText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
  },
  rangeDayText: {
    color: '#154689',
  },
  disabledDayText: {
    color: '#ccc',
  },
  availableDayText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
  },
  availableDot: {
    position: 'absolute',
    bottom: uniformScale(6),
    width: uniformScale(4),
    height: uniformScale(4),
    borderRadius: uniformScale(2),
    backgroundColor: '#fff',
  },
  selectedDateRange: {
    backgroundColor: '#f0f0f0',
    paddingVertical: uniformScale(12),
    paddingHorizontal: uniformScale(16),
    borderRadius: uniformScale(8),
    alignItems: 'center',
    marginBottom: uniformScale(15),
  },
  selectedDateText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
  },
  availableDatesInfo: {
    marginTop: uniformScale(10),
  },
  availableDatesTitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_600SemiBold',
    color: '#666',
    marginBottom: uniformScale(8),
  },
  availableDatesScroll: {
    maxHeight: uniformScale(50),
  },
  availableDateChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(6),
    borderRadius: uniformScale(12),
    marginRight: uniformScale(8),
    alignItems: 'center',
    minWidth: uniformScale(80),
  },
  availableDateChipText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
  },
  availableDateChipSlots: {
    fontSize: fontScale(9),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  priceDetailsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: uniformScale(20),
    borderRadius: uniformScale(15),
    padding: uniformScale(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
  },
  priceDetailsTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(20),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: uniformScale(15),
  },
  priceLabel: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    flex: 1,
  },
  priceValue: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  paxControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(12),
  },
  paxButton: {
    width: uniformScale(32),
    height: uniformScale(32),
    borderRadius: uniformScale(16),
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paxNumber: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    minWidth: uniformScale(20),
    textAlign: 'center',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: uniformScale(15),
  },
  subtotalLabel: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  subtotalValue: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
  },
  bottomSpacer: {
    height: uniformScale(100),
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: uniformScale(20),
    paddingTop: uniformScale(15),
    paddingBottom: uniformScale(30),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  proceedButton: {
    backgroundColor: '#FAAD2B',
    paddingVertical: uniformScale(16),
    borderRadius: uniformScale(25),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
  },
  proceedButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#022657',
    letterSpacing: uniformScale(0.5),
  },
});