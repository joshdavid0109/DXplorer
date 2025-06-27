import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function CompleteBookingScreen() {
  const [selectedStartDate, setSelectedStartDate] = useState(2);
  const [selectedEndDate, setSelectedEndDate] = useState(6);
  const [numberOfPax, setNumberOfPax] = useState(2);
  const [currentMonth, setCurrentMonth] = useState('September');
  const [currentYear, setCurrentYear] = useState('2025');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Calendar data for September 2025
  const calendarDays = [
    // Week 1
    [31, 30, 1, 2, 3, 4, 5],
    // Week 2
    [6, 7, 8, 9, 10, 11, 12],
    // Week 3
    [13, 14, 15, 16, 17, 18, 19],
    // Week 4
    [20, 21, 22, 23, 24, 25, 26],
    // Week 5
    [27, 28, 29, 30, 31, 1, 2],
  ];

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const packagePrice = 49999;
  const subtotal = packagePrice * numberOfPax;

  const handleDatePress = (day: number, weekIndex: number) => {
    // Only handle current month dates
    if ((weekIndex === 0 && day > 7) || (weekIndex === 4 && day < 27)) return;
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(day);
      setSelectedEndDate(null);
    } else if (day > selectedStartDate) {
      setSelectedEndDate(day);
    } else {
      setSelectedStartDate(day);
      setSelectedEndDate(null);
    }
  };

  const isDateInRange = (day: number, weekIndex: number) => {
    if ((weekIndex === 0 && day > 7) || (weekIndex === 4 && day < 27)) return false;
    if (!selectedStartDate || !selectedEndDate) return false;
    return day >= selectedStartDate && day <= selectedEndDate;
  };

  const isDateSelected = (day: number, weekIndex: number) => {
    if ((weekIndex === 0 && day > 7) || (weekIndex === 4 && day < 27)) return false;
    return day === selectedStartDate || day === selectedEndDate;
  };

  const isDateDisabled = (day: number, weekIndex: number) => {
    return (weekIndex === 0 && day > 7) || (weekIndex === 4 && day < 27);
  };

  const handleProceedButton = () => {
    router.push('/(content)/payment')
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/*Logo */}
        <View style={styles.mainlogo}>
            <Image
            source={require('../../assets/images/dx_logo_white.png')} // Update path
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
            <TouchableOpacity style={styles.monthNavButton}>
              <Ionicons name="chevron-back" size={uniformScale(20)} color="#666" />
            </TouchableOpacity>
            <View style={styles.monthYearContainer}>
              <Text style={styles.monthText}>{currentMonth}</Text>
              <Text style={styles.yearText}>{currentYear}</Text>
            </View>
            <TouchableOpacity style={styles.monthNavButton}>
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
            {calendarDays.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((day, dayIndex) => {
                  const isDisabled = isDateDisabled(day, weekIndex);
                  const isSelected = isDateSelected(day, weekIndex);
                  const isInRange = isDateInRange(day, weekIndex);
                  
                  return (
                    <TouchableOpacity
                      key={dayIndex}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.selectedDay,
                        isInRange && !isSelected && styles.rangeDay,
                        isDisabled && styles.disabledDay
                      ]}
                      onPress={() => handleDatePress(day, weekIndex)}
                      disabled={isDisabled}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isSelected && styles.selectedDayText,
                        isInRange && !isSelected && styles.rangeDayText,
                        isDisabled && styles.disabledDayText
                      ]}>
                        {day}
                      </Text>
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
                {selectedStartDate} - {selectedEndDate} September, 2025
              </Text>
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
  selectedDateRange: {
    backgroundColor: '#f0f0f0',
    paddingVertical: uniformScale(12),
    paddingHorizontal: uniformScale(16),
    borderRadius: uniformScale(8),
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
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