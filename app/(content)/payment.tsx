import { supabase } from '@/lib/supabase'; // Adjust path to your supabase client
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

// Types
interface ContactDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface BookingData {
  packageId: string;
  packagePrice: number;
  startDate: string;
  endDate: string;
  numberOfPax: number;
  subtotal: number;
  totalPrice: number;
  displayDateRange: string;
  remainingSlots: number;
  bookingTimestamp: string;
}

interface PaymentMethod {
  type: string;
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
}

type InstallmentOption = '3months' | '6months' | '9months';

export default function PaymentScreen() {
  const [packageDetails, setPackageDetails] = useState<{title: string, mainLocation: string} | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentOption>('3months');
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  // Get the booking data from route params
  const { bookingData: bookingDataParam } = useLocalSearchParams<{ bookingData: string }>();
  
  // Sample contact details - in real app, this would come from user profile or form
  const [contactDetails] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    email: 'dxplorer@gmail.com'
  });

  // Sample payment method - in real app, this would come from user's saved payment methods
  const [paymentMethod] = useState<PaymentMethod>({
    type: 'Visa',
    lastFourDigits: '2489',
    expiryMonth: '07',
    expiryYear: '2029'
  });

  const fetchPackageDetails = async (packageId: string) => {
  try {
    // Fetch specific package by ID from Supabase
    const { data: packageData, error } = await supabase
      .from('packages')
      .select('*')
      .eq('package_id', packageId) // Assuming packageId is the primary key
      .single(); // Use single() since we expect one result

    if (error) {
      console.error('Error fetching package details:', error);
      // Use fallback if Supabase query fails
      setPackageDetails({
        title: packageId.toUpperCase(),
        mainLocation: packageId.split('-').join(', ')
      });
      return;
    }

    if (packageData) {
      setPackageDetails({
        title: packageData.title || packageData.package_name, // Adjust field names as needed
        mainLocation: packageData.main_location || packageData.destination
      });
    }
  } catch (error) {
    console.error('Error fetching package details:', error);
    // Fallback to package ID if fetch fails
    setPackageDetails({
      title: packageId.toUpperCase(),
      mainLocation: packageId.split('-').join(', ')
    });
  }
};

  // Parse booking data on component mount
  useEffect(() => {
    if (bookingDataParam) {
      try {
        const parsedBookingData = JSON.parse(bookingDataParam);
        setBookingData(parsedBookingData);
        
        // Fetch package details from your packages table
        fetchPackageDetails(parsedBookingData.packageId);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        Alert.alert('Error', 'Invalid booking data received');
      }
    }
  }, [bookingDataParam]);

  // Calculate installment options based on total price
  const calculateInstallmentOptions = (totalPrice: number) => {
    return {
      '3months': { months: 3, amount: Math.ceil(totalPrice / 3) },
      '6months': { months: 6, amount: Math.ceil(totalPrice / 6) },
      '9months': { months: 9, amount: Math.ceil(totalPrice / 9) }
    };
  };

  const installmentOptions = bookingData ? calculateInstallmentOptions(bookingData.totalPrice) : {
    '3months': { months: 3, amount: 0 },
    '6months': { months: 6, amount: 0 },
    '9months': { months: 9, amount: 0 }
  };

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

  // If no booking data, show error
  if (!bookingData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No booking data available</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleEditField = (field: keyof ContactDetails) => {
    console.log(`Edit ${field}`);
    // Navigate to edit screen or show modal
  };

  const handleChangeSection = (section: 'package' | 'payment') => {
    console.log(`Change ${section}`);
    if (section === 'package') {
      // Navigate back to booking screen
      router.back();
    } else {
      // Navigate to payment method selection
      console.log('Navigate to payment method selection');
    }
  };

  const handlePayNow = () => {
    console.log('Proceeding with payment...');
    console.log('Booking Data:', bookingData);
    console.log('Selected Installment:', selectedInstallment);
    console.log('Contact Details:', contactDetails);
    
    // Here you would typically:
    // 1. Validate all required fields are filled
    // 2. Process the payment
    // 3. Save the booking to database
    // 4. Navigate to confirmation screen
    
    Alert.alert(
      'Payment Confirmation',
      `Proceed with payment of PHP ${bookingData.totalPrice.toLocaleString()}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Process payment here
            console.log('Payment confirmed');
            // Navigate to success screen
            router.push('/(content)/payment-success');
          }
        }
      ]
    );
  };

  const renderContactRow = (label: string, value: string, field: keyof ContactDetails, showEdit: boolean = false) => (
    <View key={field} style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRowRight}>
        {!value ? (
          <TouchableOpacity onPress={() => handleEditField(field)}>
            <Text style={styles.addLink}>add</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.inputValue}>{value}</Text>
        )}
        {showEdit && value && (
          <TouchableOpacity onPress={() => handleEditField(field)} style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // / Function to get package display name
  const getPackageDisplayName = () => {
    if (packageDetails?.title && packageDetails?.mainLocation) {
      return `${packageDetails.mainLocation} Package`;
    }
    
    // Fallback formatting
    return bookingData?.packageId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(', ') + ' Package';
  };

  // Format the package title based on packageId
  const getPackageTitle = (packageId: string) => {
    // You can customize this based on your package IDs
    const packageTitles: { [key: string]: string } = {
      'osaka-japan': 'OSAKA, JAPAN Package',
      'tokyo-japan': 'TOKYO, JAPAN Package',
      'kyoto-japan': 'KYOTO, JAPAN Package',
      // Add more package mappings as needed
    };
    
    return packageTitles[packageId] || `Package ${packageId.toUpperCase()}`;
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!bookingData.displayDateRange) {
      const startDate = new Date(bookingData.startDate);
      const endDate = new Date(bookingData.endDate);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      
      const startDay = startDate.getDate();
      const endDay = endDate.getDate();
      const month = monthNames[startDate.getMonth()];
      const year = startDate.getFullYear();
      
      return `${startDay} - ${endDay} ${month}, ${year}`;
    }
    
    return bookingData.displayDateRange;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.mainlogo}>
          <Image
            source={require('../../assets/images/dx_logo_lg.png')} // Update path as needed
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#154689" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Review and Confirm Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Review and confirm purchase</Text>
        </View>

        {/* Contact Details */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Contact Details</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            We will contact you only if there's any updates to your booking
          </Text>
          
          <View style={styles.contactForm}>
            {renderContactRow('First name', contactDetails.firstName, 'firstName')}
            {renderContactRow('Last name', contactDetails.lastName, 'lastName')}
            {renderContactRow('Phone number', contactDetails.phone, 'phone')}
            {renderContactRow('Email address', contactDetails.email, 'email', true)}
          </View>
        </View>

        {/* Package Section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderWithChange}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardTitleIndicator} />
              <Text style={styles.cardTitle}>Package</Text>
            </View>
            <TouchableOpacity onPress={() => handleChangeSection('package')}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.packageInfo}>
            <Text style={styles.packageDate}>
              {formatDateRange()}
            </Text>
            <Text style={styles.packageTitle}>{getPackageDisplayName()}</Text>
            <Text style={styles.packagePax}>{bookingData.numberOfPax} pax</Text>
            <Text style={styles.packagePrice}>
              PHP {bookingData.packagePrice.toLocaleString()} per person
            </Text>
          </View>
        </View>

        {/* Email Address Section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Email Address</Text>
          </View>
          <Text style={styles.emailAddress}>{contactDetails.email}</Text>
        </View>

        {/* Payment Method Section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderWithChange}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardTitleIndicator} />
              <Text style={styles.cardTitle}>Payment Method</Text>
            </View>
            <TouchableOpacity onPress={() => handleChangeSection('payment')}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.paymentMethod}>
            <View style={styles.visaCard}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardNumber}>
                {paymentMethod.type} ... {paymentMethod.lastFourDigits}
              </Text>
              <Text style={styles.cardExpiry}>
                Exp: {paymentMethod.expiryMonth} / {paymentMethod.expiryYear}
              </Text>
            </View>
          </View>
        </View>

        {/* Installment Section */}
        <View style={styles.cardContainer}>
          <View style={styles.installmentHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Installment</Text>
            <TouchableOpacity style={styles.helpButton}>
              <Ionicons name="help-circle-outline" size={uniformScale(16)} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.installmentOptions}>
            {(Object.keys(installmentOptions) as InstallmentOption[]).map((option) => (
              <TouchableOpacity 
                key={option}
                style={[
                  styles.installmentOption,
                  selectedInstallment === option && styles.selectedInstallment
                ]}
                onPress={() => setSelectedInstallment(option)}
              >
                <Text style={[
                  styles.installmentText,
                  selectedInstallment === option && styles.selectedInstallmentText
                ]}>
                  {installmentOptions[option].months} months x PHP {installmentOptions[option].amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Booking Summary</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Package Price (per person)</Text>
            <Text style={styles.summaryValue}>PHP {bookingData.packagePrice.toLocaleString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Number of Passengers</Text>
            <Text style={styles.summaryValue}>{bookingData.numberOfPax}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Travel Dates</Text>
            <Text style={styles.summaryValue}>{formatDateRange()}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>PHP {bookingData.subtotal.toLocaleString()}</Text>
          </View>
        </View>

        {/* Total Section */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>PHP {bookingData.totalPrice.toLocaleString()}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Pay now</Text>
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
  cardContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
    borderRadius: uniformScale(10),
    padding: uniformScale(16),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: uniformScale(2),
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: uniformScale(8),
  },
  cardHeaderWithChange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: uniformScale(8),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleIndicator: {
    width: uniformScale(3),
    height: uniformScale(14),
    backgroundColor: '#FAAD2B',
    borderRadius: uniformScale(2),
    marginRight: uniformScale(8),
  },
  cardTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(16),
  },
  contactForm: {
    gap: uniformScale(12),
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: uniformScale(8),
  },
  inputRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(12),
  },
  inputLabel: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    flex: 1,
  },
  inputValue: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  addLink: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#007AFF',
  },
  editButton: {
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
  },
  editText: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#007AFF',
  },
  changeLink: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#007AFF',
  },
  packageInfo: {
    alignItems: 'center',
    paddingVertical: uniformScale(16),
    backgroundColor: '#f8f9fa',
    borderRadius: uniformScale(8),
    marginTop: uniformScale(8),
  },
  packageDate: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: uniformScale(8),
  },
  packageTitle: {
    fontSize: fontScale(18),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    marginBottom: uniformScale(4),
  },
  packagePax: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(4),
  },
  packagePrice: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#888',
  },
  emailAddress: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#007AFF',
    marginTop: uniformScale(8),
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(12),
    marginTop: uniformScale(8),
  },
  visaCard: {
    backgroundColor: '#1a1f71',
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(6),
    borderRadius: uniformScale(4),
  },
  visaText: {
    color: '#ffffff',
    fontSize: fontScale(12),
    fontFamily: 'Poppins_700Bold',
  },
  cardDetails: {
    flex: 1,
  },
  cardNumber: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  cardExpiry: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: uniformScale(2),
  },
  installmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(8),
    marginBottom: uniformScale(12),
  },
  helpButton: {
    marginLeft: uniformScale(4),
  },
  installmentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: uniformScale(8),
  },
  installmentOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: uniformScale(16),
    paddingVertical: uniformScale(10),
    borderRadius: uniformScale(20),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedInstallment: {
    backgroundColor: '#E3F2FD',
    borderColor: '#154689',
  },
  installmentText: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  selectedInstallmentText: {
    color: '#154689',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: uniformScale(12),
  },
  summaryLabel: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: uniformScale(12),
  },
  totalContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
    borderRadius: uniformScale(10),
    padding: uniformScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(1),
    },
    shadowOpacity: 0.05,
    shadowRadius: uniformScale(2),
    elevation: 2,
  },
  totalLabel: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  totalAmount: {
    fontSize: fontScale(20),
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
  payButton: {
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
  payButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#022657',
    letterSpacing: uniformScale(0.5),
  },
});