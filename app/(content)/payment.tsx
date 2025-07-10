import { supabase } from '@/lib/supabase'; // Adjust path to your supabase client
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
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


// Import Google Fonts
import { ScrollableLogo } from '@/components/ScrollableLogo';
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
  const [user, setUser] = useState(null);
  const [packageDetails, setPackageDetails] = useState<{title: string, mainLocation: string} | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentOption | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  // Get the booking data from route params
  const { bookingData: bookingDataParam } = useLocalSearchParams<{ bookingData: string }>();
  
  // Contact details state - now properly managed
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setContactDetails(prev => ({
          ...prev,
          email: user.email || ''
        }));
      }
    };

    getCurrentUser();
  }, []);

  // Modal state for editing fields
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<keyof ContactDetails | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Installment options
  const [isInstallmentHelpModalVisible, setIsInstallmentHelpModalVisible] = useState(false);

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

  // Handle editing contact fields
  const handleEditField = (field: keyof ContactDetails) => {
    setEditingField(field);
    setEditingValue(contactDetails[field]);
    setIsEditModalVisible(true);
  };

  // Handle saving edited field
  const handleSaveEdit = () => {
    if (editingField && editingValue.trim()) {
      // Basic validation
      if (editingField === 'email' && !isValidEmail(editingValue.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      if (editingField === 'phone' && !isValidPhone(editingValue.trim())) {
        Alert.alert('Invalid Phone', 'Please enter a valid phone number');
        return;
      }

      setContactDetails(prev => ({
        ...prev,
        [editingField]: editingValue.trim()
      }));
      
      setIsEditModalVisible(false);
      setEditingField(null);
      setEditingValue('');
    } else {
      Alert.alert('Required Field', 'This field cannot be empty');
    }
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setEditingField(null);
    setEditingValue('');
  };

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (basic)
  const isValidPhone = (phone: string) => {
  // Remove all spaces, dashes, parentheses, and plus signs
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Philippine phone number patterns:
  // Mobile: 09xxxxxxxxx (11 digits) or 639xxxxxxxxx (12 digits with country code)
  // Landline: 02xxxxxxx or 032xxxxxxx etc. (area code + 7 digits)
  // Toll-free: 1800xxxxxxx (11 digits)
  
  // Mobile number patterns
  const mobilePattern = /^(09|639)\d{9}$/; // 09xxxxxxxxx or 639xxxxxxxxx
  
  // Landline patterns (major area codes)
  const landlinePattern = /^(02|032|033|034|035|036|038|042|043|044|045|046|047|048|049|052|053|054|055|056|062|063|064|065|068|072|074|075|077|078|082|083|084|085|086|087|088)\d{7}$/;
  
  // Toll-free pattern
  const tollFreePattern = /^1800\d{7}$/;
  
  // International format with +63
  const internationalPattern = /^63\d{10}$/;
  
  return mobilePattern.test(cleanPhone) || 
         landlinePattern.test(cleanPhone) || 
         tollFreePattern.test(cleanPhone) ||
         internationalPattern.test(cleanPhone);
};

// Optional: Add a phone number formatter function
const formatPhoneNumber = (phone: string) => {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Format mobile numbers
  if (cleanPhone.match(/^09\d{9}$/)) {
    return cleanPhone.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');
  }
  
  // Format international mobile numbers
  if (cleanPhone.match(/^639\d{9}$/)) {
    return cleanPhone.replace(/^(\d{3})(\d{4})(\d{3})(\d{4})$/, '+$1 $2 $3 $4');
  }
  
  // Format landline numbers (02 area code)
  if (cleanPhone.match(/^02\d{7}$/)) {
    return cleanPhone.replace(/^(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3');
  }
  
  // Format other landline numbers
  if (cleanPhone.match(/^0\d{2,3}\d{7}$/)) {
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
    } else if (cleanPhone.length === 11) {
      return cleanPhone.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');
    }
  }
  
  return phone; // Return original if no pattern matches
};

  // Get field label for modal
  const getFieldLabel = (field: keyof ContactDetails) => {
    const labels = {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      email: 'Email Address'
    };
    return labels[field];
  };

  // Get placeholder text for modal
  const getFieldPlaceholder = (field: keyof ContactDetails) => {
    const placeholders = {
      firstName: 'Enter your first name',
      lastName: 'Enter your last name',
      phone: 'Enter your phone number',
      email: 'Enter your email address'
    };
    return placeholders[field];
  };

  // Get keyboard type for modal
  const getKeyboardType = (field: keyof ContactDetails) => {
    if (field === 'email') return 'email-address';
    if (field === 'phone') return 'phone-pad';
    return 'default';
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
    // Validate required fields
    if (!contactDetails.firstName.trim()) {
      Alert.alert('Missing Information', 'Please add your first name');
      return;
    }

    if (!contactDetails.lastName.trim()) {
      Alert.alert('Missing Information', 'Please add your last name');
      return;
    }

    if (!contactDetails.phone.trim()) {
      Alert.alert('Missing Information', 'Please add your phone number');
      return;
    }

    if (!contactDetails.email.trim()) {
      Alert.alert('Missing Information', 'Please add your email address');
      return;
    }

    console.log('Proceeding with payment...');
    console.log('Booking Data:', bookingData);
    console.log('Selected Installment:', selectedInstallment);
    console.log('Contact Details:', contactDetails);
    
    // Here you would typically:
    // 1. Process the payment
    // 2. Save the booking to database
    // 3. Navigate to confirmation screen
    
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
            router.push('/(content)/payment_success');
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
        {(showEdit || value) && (
          <TouchableOpacity onPress={() => handleEditField(field)} style={styles.editButton}>
            <Text style={styles.editText}> Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Function to get package display name
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

  const isInstallmentEligible = () => {
    if (!bookingData) return false;
    
    const today = new Date();
    const bookingDate = new Date(bookingData.startDate);
    
    // Calculate 3 months from today
    const threeMonthsFromToday = new Date(today);
    threeMonthsFromToday.setMonth(today.getMonth() + 3);
    
    return bookingDate >= threeMonthsFromToday;
  };


const handleInstallmentHelpPress = () => {
  setIsInstallmentHelpModalVisible(true);
};

const handleInstallmentHelpClose = () => {
  setIsInstallmentHelpModalVisible(false);
};

const handleInstallmentToggle = (option: InstallmentOption) => {
  if (selectedInstallment === option) {
    // If same option is clicked, deselect it
    setSelectedInstallment(null);
  } else {
    // Select the new option
    setSelectedInstallment(option);
  }
};

const calculateBookingSummary = () => {
  if (!bookingData) return { subtotal: 0, total: 0, installmentAmount: 0 };
  
  const subtotal = bookingData.subtotal;
  const total = bookingData.totalPrice;
  
  if (selectedInstallment) {
    const installmentAmount = installmentOptions[selectedInstallment].amount;
    return {
      subtotal,
      total,
      installmentAmount,
      isInstallment: true,
      installmentMonths: installmentOptions[selectedInstallment].months
    };
  }
  
  return {
    subtotal,
    total,
    installmentAmount: 0,
    isInstallment: false,
    installmentMonths: 0
  };
};
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar 
      barStyle="dark-content"
      backgroundColor={Platform.OS === 'ios' ? undefined : "#f8f9fa"}
      translucent={Platform.OS === 'android'}/>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ScrollableLogo/>

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
        {isInstallmentEligible() ? (
          <View style={styles.cardContainer}>
            <View style={styles.installmentHeader}>
              <View style={styles.cardTitleIndicator} />
              <Text style={styles.cardTitle}>Installment</Text>
              <TouchableOpacity style={styles.helpButton} onPress={handleInstallmentHelpPress}>
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
                  onPress={() => handleInstallmentToggle(option)}
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
        ) : (
          <View style={styles.cardContainer}>
            <View style={styles.installmentHeader}>
              <View style={styles.cardTitleIndicator} />
              <Text style={styles.cardTitle}>Installment</Text>
              <TouchableOpacity style={styles.helpButton} onPress={handleInstallmentHelpPress}>
                <Ionicons name="help-circle-outline" size={uniformScale(16)} color="#999" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.installmentUnavailable}>
              <Text style={styles.installmentUnavailableText}>
                Installment option is not available for this booking
              </Text>
            </View>
          </View>
        )}

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
          
          {selectedInstallment && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Installment Plan</Text>
                <Text style={styles.summaryValue}>
                  {installmentOptions[selectedInstallment].months} months installment
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monthly Payment</Text>
                <Text style={styles.summaryValue}>
                  PHP {installmentOptions[selectedInstallment].amount.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Total Section */}
        <View style={styles.totalContainer}>
          <View style={styles.totalLeft}>
            <Text style={styles.totalLabel}>
              {selectedInstallment ? 'Monthly Payment' : 'Total'}
            </Text>
            {selectedInstallment && (
              <Text style={styles.totalSubLabel}>
                for {installmentOptions[selectedInstallment].months} months
              </Text>
            )}
          </View>
          <Text style={styles.totalAmount}>
            PHP {selectedInstallment 
              ? installmentOptions[selectedInstallment].amount.toLocaleString()
              : bookingData.totalPrice.toLocaleString()
            }
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
          <Text style={styles.payButtonText}>Pay now</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editingField && getFieldLabel(editingField)}
              </Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.modalCloseButton}>
                <Ionicons name="close" size={uniformScale(24)} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalInputLabel}>
                {editingField && getFieldLabel(editingField)}
              </Text>
              <TextInput
                style={styles.modalInput}
                value={editingValue}
                onChangeText={setEditingValue}
                placeholder={editingField ? getFieldPlaceholder(editingField) : ''}
                keyboardType={editingField ? getKeyboardType(editingField) : 'default'}
                autoFocus={true}
                multiline={false}
                maxLength={editingField === 'phone' ? 15 : 50}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelEdit}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Installment Help Modal */}
      <Modal
        visible={isInstallmentHelpModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleInstallmentHelpClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.helpModalContent}>
            <View style={styles.helpModalHeader}>
              <View style={styles.helpModalIcon}>
                <Ionicons name="information-circle" size={uniformScale(24)} color="#154689" />
              </View>
              <Text style={styles.helpModalTitle}>Installment Information</Text>
              <TouchableOpacity onPress={handleInstallmentHelpClose} style={styles.modalCloseButton}>
                <Ionicons name="close" size={uniformScale(20)} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.helpModalBody}>
              <Text style={styles.helpModalText}>
                Installment payment options are only available for bookings that are scheduled 3 months or more from today.
              </Text>
              <Text style={styles.helpModalSubtext}>
                This allows us to process your payments in advance and ensure your booking is secured.
              </Text>
            </View>
            
            <View style={styles.helpModalFooter}>
              <TouchableOpacity style={styles.helpModalButton} onPress={handleInstallmentHelpClose}>
                <Text style={styles.helpModalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  installmentUnavailable: {
    backgroundColor: '#f8f9fa',
    paddingVertical: uniformScale(16),
    paddingHorizontal: uniformScale(16),
    borderRadius: uniformScale(8),
    marginTop: uniformScale(8),
    alignItems: 'center',
  },
  installmentUnavailableText: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  helpModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(15),
    margin: uniformScale(20),
    width: screenWidth - uniformScale(40),
    maxWidth: uniformScale(400),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: uniformScale(8),
    elevation: 5,
  },
  helpModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingTop: uniformScale(20),
    paddingBottom: uniformScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  helpModalIcon: {
    marginRight: uniformScale(12),
  },
  helpModalTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    flex: 1,
  },
  helpModalBody: {
    paddingHorizontal: uniformScale(20),
    paddingVertical: uniformScale(20),
  },
  helpModalText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    lineHeight: fontScale(20),
    marginBottom: uniformScale(12),
  },
  helpModalSubtext: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: fontScale(18),
  },
  helpModalFooter: {
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(20),
  },
  helpModalButton: {
    backgroundColor: '#154689',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpModalButtonText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(15),
    margin: uniformScale(20),
    width: screenWidth - uniformScale(40),
    maxHeight: screenHeight * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: uniformScale(8),
    elevation: 5,
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
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  modalCloseButton: {
    width: uniformScale(30),
    height: uniformScale(30),
    borderRadius: uniformScale(15),
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: uniformScale(20),
    paddingVertical: uniformScale(20),
  },
  modalInputLabel: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
    marginBottom: uniformScale(8),
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: uniformScale(8),
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(12),
    fontSize: fontScale(14),
    fontFamily: 'Poppins_400Regular',
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: uniformScale(20),
    paddingBottom: uniformScale(20),
    paddingTop: uniformScale(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: uniformScale(12),
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#154689',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
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
  totalLeft: {
    
  },
  totalLabel: {
    fontSize: fontScale(20),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  totalSubLabel: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: uniformScale(2),
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