import { supabase } from '@/lib/supabase'; // Adjust path to your supabase client
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

interface PromoData {
  promo_id: string;
  promo_code: string;
  discount_rate: number;
  promo_expiry: string;
  promo_start?: string;
  status: string;
  min_booking_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count?: number;
  effective_discount_rate?: number;
}

interface Customer {
  fullName: string;
  birthDate: string;
}

type InstallmentOption = '3months' | '6months' | '9months';

export default function PaymentScreen() {
  const [user, setUser] = useState(null);
  const [packageDetails, setPackageDetails] = useState<{title: string, mainLocation: string} | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<InstallmentOption | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoData | null>(null);
  const [promoError, setPromoError] = useState<string>('');
  const [isApplyingPromo, setIsApplyingPromo] = useState<boolean>(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState({ month: '', day: '', year: '' });

    
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

  useEffect(() => {
  if (bookingData?.numberOfPax) {
    const initialCustomers = Array.from({ length: bookingData.numberOfPax }, () => ({
      fullName: '',
      birthDate: ''
    }));
    setCustomers(initialCustomers);
  }
}, [bookingData?.numberOfPax]);

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

const updateCustomer = (index: number, field: keyof Customer, value: string) => {
  setCustomers(prev => prev.map((customer, i) => 
    i === index ? { ...customer, [field]: value } : customer
  ));
};

const validateCustomers = () => {
  for (let i = 0; i < customers.length; i++) {
    if (!customers[i].fullName.trim()) {
      Alert.alert('Missing Information', `Please enter the full name for passenger ${i + 1}`);
      return false;
    }
    if (!customers[i].birthDate.trim()) {
      Alert.alert('Missing Information', `Please enter the birth date for passenger ${i + 1}`);
      return false;
    }
  }
  return true;
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


// Add this function to validate and save date
const handleDateSave = () => {
  const { month, day, year } = tempDate;
  
  // Validate inputs
  if (!month || !day || !year) {
    Alert.alert('Invalid Date', 'Please fill in all date fields');
    return;
  }
  
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  const yearNum = parseInt(year);
  
  // Validate ranges
  if (monthNum < 1 || monthNum > 12) {
    Alert.alert('Invalid Month', 'Month must be between 1 and 12');
    return;
  }
  
  if (dayNum < 1 || dayNum > 31) {
    Alert.alert('Invalid Day', 'Day must be between 1 and 31');
    return;
  }
  
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
    Alert.alert('Invalid Year', `Year must be between 1900 and ${new Date().getFullYear()}`);
    return;
  }
  
  // Validate actual date
  const testDate = new Date(yearNum, monthNum - 1, dayNum);
  if (testDate.getMonth() !== monthNum - 1 || testDate.getDate() !== dayNum) {
    Alert.alert('Invalid Date', 'Please enter a valid date');
    return;
  }
  
  // Check if date is not in the future
  if (testDate > new Date()) {
    Alert.alert('Invalid Date', 'Birth date cannot be in the future');
    return;
  }
  
  // Format as MM/DD/YYYY
  const formattedDate = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  
  if (selectedCustomerIndex !== null) {
    updateCustomer(selectedCustomerIndex, 'birthDate', formattedDate);
  }
  
  setShowDateModal(false);
  setSelectedCustomerIndex(null);
  setTempDate({ month: '', day: '', year: '' });
};

// Add this function to cancel date input
const handleDateCancel = () => {
  setShowDateModal(false);
  setSelectedCustomerIndex(null);
  setTempDate({ month: '', day: '', year: '' });
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

  // ADD THIS NEW VALIDATION
  if (!validateCustomers()) {
    return;
  }


    console.log('Proceeding with payment...');
    console.log('Booking Data:', bookingData);
    console.log('Selected Installment:', selectedInstallment);
    console.log('Contact Details:', contactDetails);
  
    
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
          onPress: async () => {
           try {
            await processBookingAndPayment();
          } catch (error) {
            console.error('Payment processing error:', error);
            Alert.alert('Payment Error', 'Failed to process payment. Please try again.');
          }
          }
        }
      ]
    );
  };

const processBookingAndPayment = async () => {
  setIsProcessingPayment(true);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      Alert.alert('Authentication Error', 'Please sign in to continue');
      return;
    }

    // Generate booking reference
    const bookingRef = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 1. First, get the current package data to check available slots
    const { data: currentPackage, error: packageFetchError } = await supabase
      .from('packages')
      .select('total_slots')
      .eq('package_id', bookingData.packageId)
      .single();

    if (packageFetchError) {
      throw new Error('Failed to verify package availability');
    }

    // Check if enough slots are available
    if (currentPackage.total_slots < bookingData.numberOfPax) {
      Alert.alert('Booking Unavailable', 'Not enough slots available for this package');
      return;
    }

    // 2. Update or create user profile with contact details
    const profileData = {
      user_id: user.id,
      first_name: contactDetails.firstName,
      last_name: contactDetails.lastName,
      phone: contactDetails.phone,
      email_address: contactDetails.email,
      updated_at: new Date().toISOString()
    };

    // Use upsert to either update existing profile or create new one
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      });

    if (profileError) {
      console.error('Profile update error:', profileError);
      // Don't throw error here, just log it as it's not critical for booking
    }

    // 3. Insert booking record (matching your table structure)
    const bookingInsertData = {
      package_id: bookingData.packageId,
      user_id: user.id,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      num_guests: bookingData.numberOfPax,
      status: 'confirmed',
      booking_ref: bookingRef,
      payment_id: null, // Will be updated after payment insertion
      customers: customers.map(customer => ({
        full_name: customer.fullName.trim(),
        birth_date: customer.birthDate.trim()
      })),
      created_at: new Date().toISOString()
    };

    const { data: bookingDataInserted, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingInsertData])
      .select('booking_id')
      .single();

    if (bookingError) {
      console.error('Booking insertion error:', bookingError);
      throw new Error('Failed to create booking: ' + bookingError.message);
    }

    const bookingId = bookingDataInserted.booking_id;

    // 4. Insert payment record (matching your table structure)
    const finalTotal = calculateFinalTotal();
    const today = new Date();
    
    const paymentInsertData = {
      booking_id: bookingId,
      user_id: user.id,
      amount: finalTotal,
      payment_method: 'card',
      transaction_ref: `TXN_${Date.now()}_${bookingId}`,
      status: selectedInstallment ? 'installment_pending' : 'completed',
      paid_at: selectedInstallment ? null : new Date().toISOString(),
      is_installment: selectedInstallment ? true : false,
      installment_plan: selectedInstallment || null,
      next_due_date: selectedInstallment ? 
        new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().split('T')[0] : null,
      is_fully_paid: selectedInstallment ? false : true
    };

    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert([paymentInsertData])
      .select('payment_id')
      .single();

    if (paymentError) {
      console.error('Payment insertion error:', paymentError);
      // If payment fails, we should also remove the booking
      await supabase.from('bookings').delete().eq('booking_id', bookingId);
      throw new Error('Failed to record payment: ' + paymentError.message);
    }

    // 5. Update booking with payment_id
    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({ payment_id: paymentData.payment_id })
      .eq('booking_id', bookingId);

    if (updateBookingError) {
      console.error('Booking update error:', updateBookingError);
      // This is not critical for the booking process, but log it
    }

    // Success - navigate to success screen
    console.log('Payment processed successfully');
    Alert.alert(
      'Payment Successful!',
      `Your booking has been confirmed. Booking reference: ${bookingRef}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Pass booking details to success screen
            router.push({
              pathname: '/(content)/payment_success',
              params: {
                bookingId: bookingId.toString(),
                bookingRef: bookingRef,
                totalAmount: finalTotal.toString(),
                packageName: getPackageDisplayName()
              }
            });
          }
        }
      ]
    );

  } catch (error) {
    console.error('Error processing booking and payment:', error);
    Alert.alert(
      'Processing Error', 
      error.message || 'Failed to process your booking. Please try again.'
    );
  } finally {
    setIsProcessingPayment(false);
  }
};

const payButtonStyle = [
  styles.payButton, 
  isProcessingPayment && styles.payButtonDisabled
];


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

const showDateModalForCustomer = (index: number) => {
  setSelectedCustomerIndex(index);
  
  // If customer already has a date, parse it
  const existingDate = customers[index].birthDate;
  if (existingDate) {
    const parts = existingDate.split('/');
    if (parts.length === 3) {
      setTempDate({
        month: parts[0],
        day: parts[1],
        year: parts[2]
      });
    }
  } else {
    setTempDate({ month: '', day: '', year: '' });
  }
  
  setShowDateModal(true);
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

const handleApplyPromo = async () => {
  if (!promoCode.trim()) {
    setPromoError('Please enter a promo code');
    return;
  }

  setIsApplyingPromo(true);
  setPromoError('');

  try {
    // Query promo code from Supabase
    console.log('Applying promo code:', promoCode.trim().toUpperCase());
    const { data: promoData, error: promoError } = await supabase
      .from('promos')
      .select('*')
      .eq('promo_code', promoCode.trim().toUpperCase())
      .eq('status', 'active') // Assuming you have a status column
      .single();

    console.log('Promo Data:', promoData);

    if (promoError || !promoData) {
      setPromoError('Invalid promo code');
      setAppliedPromo(null);
      return;
    }

    // Check if promo code is expired
    const currentDate = new Date();
    const expiryDate = new Date(promoData.promo_expiry);
    
    if (expiryDate < currentDate) {
      setPromoError('This promo code has expired');
      setAppliedPromo(null);
      return;
    }

    // Check if promo code hasn't started yet (if you have a start date)
    if (promoData.promo_start) {
      const startDate = new Date(promoData.promo_start);
      if (startDate > currentDate) {
        setPromoError('This promo code is not yet available');
        setAppliedPromo(null);
        return;
      }
    }

    // Check minimum booking amount if applicable
    if (promoData.min_booking_amount && bookingData.subtotal < promoData.min_booking_amount) {
      setPromoError(`Minimum booking amount of PHP ${promoData.min_booking_amount.toLocaleString()} required`);
      setAppliedPromo(null);
      return;
    }

    // Check maximum discount amount if applicable
    let finalDiscountRate = promoData.discount_rate;
    if (promoData.max_discount_amount) {
      const calculatedDiscount = (bookingData.subtotal * promoData.discount_rate) / 100;
      if (calculatedDiscount > promoData.max_discount_amount) {
        finalDiscountRate = (promoData.max_discount_amount / bookingData.subtotal) * 100;
      }
    }

    // Apply the promo code
    setAppliedPromo({
      ...promoData,
      effective_discount_rate: finalDiscountRate
    });
    setPromoError('');

  } catch (error) {
    console.error('Error applying promo code:', error);
    setPromoError('Failed to apply promo code. Please try again.');
    setAppliedPromo(null);
  } finally {
    setIsApplyingPromo(false);
  }
};

// Add this function to remove applied promo
const handleRemovePromo = () => {
  setAppliedPromo(null);
  setPromoCode('');
  setPromoError('');
};

const calculateDiscount = () => {
  if (!appliedPromo) return 0;
  
  const discountRate = appliedPromo.effective_discount_rate || appliedPromo.discount_rate;
  const calculatedDiscount = (bookingData.subtotal * discountRate) / 100;
  
  // Apply max discount cap if exists
  if (appliedPromo.max_discount_amount) {
    return Math.min(calculatedDiscount, appliedPromo.max_discount_amount);
  }
  
  return calculatedDiscount;
};

// Add this function to calculate final total
const calculateFinalTotal = () => {
  const discount = calculateDiscount();
  return bookingData.subtotal - discount;
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

        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Customers ({bookingData.numberOfPax} passengers)</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Please provide the complete name and birth date for each passenger
          </Text>
          
          <View style={styles.customersForm}>
            {customers.map((customer, index) => (
              <View key={index} style={styles.customerCard}>
                <Text style={styles.customerTitle}>Passenger {index + 1}</Text>
                
                <View style={styles.customerInputContainer}>
                  <Text style={styles.customerInputLabel}>Complete Name</Text>
                  <TextInput
                    style={styles.customerInput}
                    placeholder="Enter full name"
                    value={customer.fullName}
                    onChangeText={(value) => updateCustomer(index, 'fullName', value)}
                  />
                </View>
                
                <View style={styles.customerInputContainer}>
  <Text style={styles.customerInputLabel}>Birth Date</Text>
  <TouchableOpacity
    style={styles.dateInputButton}
    onPress={() => showDateModalForCustomer(index)}
  >
    <Text style={[
      styles.dateInputText,
      !customer.birthDate && styles.dateInputPlaceholder
    ]}>
      {customer.birthDate || 'Select birth date'}
    </Text>
    <Ionicons 
      name="calendar-outline" 
      size={uniformScale(20)} 
      color={customer.birthDate ? '#333' : '#999'} 
    />
  </TouchableOpacity>
</View>
              </View>
            ))}
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

         {/* Promo Code Section */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleIndicator} />
            <Text style={styles.cardTitle}>Promo Code</Text>
          </View>
          
          {!appliedPromo ? (
            <View style={styles.promoInputContainer}>
              <View style={styles.promoInputWrapper}>
                <TextInput
                  style={[styles.promoInput, promoError && styles.promoInputError]}
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChangeText={(text) => {
                    setPromoCode(text.toUpperCase());
                    setPromoError('');
                  }}
                  autoCapitalize="characters"
                  editable={!isApplyingPromo}
                />
                <TouchableOpacity 
                  style={[styles.applyButton, isApplyingPromo && styles.applyButtonDisabled]}
                  onPress={handleApplyPromo}
                  disabled={isApplyingPromo}
                >
                  {isApplyingPromo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.applyButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
              {promoError ? (
                <Text style={styles.promoErrorText}>{promoError}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.appliedPromoContainer}>
              <View style={styles.appliedPromoInfo}>
                <View style={styles.promoSuccessIcon}>
                  <Ionicons name="checkmark-circle" size={uniformScale(20)} color="#4CAF50" />
                </View>
                <View style={styles.appliedPromoDetails}>
                  <Text style={styles.appliedPromoCode}>{appliedPromo.promo_code}</Text>
                  <Text style={styles.appliedPromoDiscount}>
                    {Math.round(appliedPromo.effective_discount_rate || appliedPromo.discount_rate)}% discount applied
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.removePromoButton}
                onPress={handleRemovePromo}
              >
                <Ionicons name="close" size={uniformScale(20)} color="#999" />
              </TouchableOpacity>
            </View>
          )}
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
          
          {appliedPromo && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelDiscount}>
                Discount ({appliedPromo.promo_code} - {Math.round(appliedPromo.effective_discount_rate || appliedPromo.discount_rate)}%)
              </Text>
              <Text style={styles.summaryValueDiscount}>
                -PHP {calculateDiscount().toLocaleString()}
              </Text>
            </View>
          )}
          
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
                  PHP {Math.ceil(calculateFinalTotal() / installmentOptions[selectedInstallment].months).toLocaleString()}
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
              ? Math.ceil(calculateFinalTotal() / installmentOptions[selectedInstallment].months).toLocaleString()
              : calculateFinalTotal().toLocaleString()
            }
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Now Button */}
      <TouchableOpacity 
        style={payButtonStyle} 
        onPress={handlePayNow}
        disabled={isProcessingPayment}
      >
        {isProcessingPayment ? (
          <ActivityIndicator size="small" color="#022657" />
        ) : (
          <Text style={styles.payButtonText}>Confirm Details</Text>
        )}
      </TouchableOpacity>

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

      {/* Date Input Modal */}
<Modal
  visible={showDateModal}
  animationType="slide"
  transparent={true}
  onRequestClose={handleDateCancel}
>
  <View style={styles.modalOverlay}>
    <View style={styles.dateModalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Enter Birth Date</Text>
        <TouchableOpacity onPress={handleDateCancel} style={styles.modalCloseButton}>
          <Ionicons name="close" size={uniformScale(24)} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateModalBody}>
        <Text style={styles.dateModalSubtitle}>
          {selectedCustomerIndex !== null ? 
            `Passenger ${selectedCustomerIndex + 1}` : 
            'Passenger'
          }
        </Text>
        
        <View style={styles.dateInputContainer}>
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateInputGroupLabel}>Month</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="MM"
              value={tempDate.month}
              onChangeText={(text) => {
                // Only allow numbers and limit to 2 digits
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 2);
                setTempDate(prev => ({ ...prev, month: filtered }));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          
          <Text style={styles.dateSeparator}>/</Text>
          
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateInputGroupLabel}>Day</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="DD"
              value={tempDate.day}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 2);
                setTempDate(prev => ({ ...prev, day: filtered }));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          
          <Text style={styles.dateSeparator}>/</Text>
          
          <View style={styles.dateInputGroup}>
            <Text style={styles.dateInputGroupLabel}>Year</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY"
              value={tempDate.year}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                setTempDate(prev => ({ ...prev, year: filtered }));
              }}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </View>
        
        <Text style={styles.dateHintText}>
          Example: 03/15/1990 for March 15, 1990
        </Text>
      </View>
      
      <View style={styles.modalFooter}>
        <TouchableOpacity style={styles.modalCancelButton} onPress={handleDateCancel}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalSaveButton} onPress={handleDateSave}>
          <Text style={styles.modalSaveText}>Save</Text>
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
  promoInputContainer: {
    marginTop: uniformScale(12),
  },
  promoInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: uniformScale(8),
  },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: uniformScale(8),
    paddingHorizontal: uniformScale(12),
    paddingVertical: uniformScale(10),
    fontSize: uniformScale(14),
    color: '#333',
    backgroundColor: '#fff',
  },
  promoInputError: {
    borderColor: '#F44336',
  },
  applyButton: {
    backgroundColor: '#154689',
    paddingHorizontal: uniformScale(16),
    paddingVertical: uniformScale(10),
    borderRadius: uniformScale(8),
    minWidth: uniformScale(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: uniformScale(14),
    fontWeight: '600',
  },
  promoErrorText: {
    color: '#F44336',
    fontSize: uniformScale(12),
    marginTop: uniformScale(4),
  },
  appliedPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E8',
    padding: uniformScale(12),
    borderRadius: uniformScale(8),
    marginTop: uniformScale(12),
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoSuccessIcon: {
    marginRight: uniformScale(8),
  },
  appliedPromoDetails: {
    flex: 1,
  },
  appliedPromoCode: {
    fontSize: uniformScale(14),
    fontWeight: '600',
    color: '#2E7D32',
  },
  appliedPromoDiscount: {
    fontSize: uniformScale(12),
    color: '#388E3C',
    marginTop: uniformScale(2),
  },
  removePromoButton: {
    padding: uniformScale(4),
  },
  summaryLabelDiscount: {
    fontSize: uniformScale(14),
    color: '#4CAF50',
    fontWeight: '500',
  },
  summaryValueDiscount: {
    fontSize: uniformScale(14),
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(16),
  },

  customersForm: {
  gap: uniformScale(16),
  marginTop: uniformScale(12),
},
customerCard: {
  backgroundColor: '#f8f9fa',
  borderRadius: uniformScale(8),
  padding: uniformScale(12),
  borderWidth: 1,
  borderColor: '#e9ecef',
},
customerTitle: {
  fontSize: fontScale(14),
  fontFamily: 'Poppins_600SemiBold',
  color: '#154689',
  marginBottom: uniformScale(12),
},
customerInputContainer: {
  marginBottom: uniformScale(12),
},
customerInputLabel: {
  fontSize: fontScale(12),
  fontFamily: 'Poppins_500Medium',
  color: '#333',
  marginBottom: uniformScale(4),
},
customerInput: {
  borderWidth: 1,
  borderColor: '#e0e0e0',
  borderRadius: uniformScale(6),
  paddingHorizontal: uniformScale(12),
  paddingVertical: uniformScale(10),
  fontSize: fontScale(14),
  fontFamily: 'Poppins_400Regular',
  color: '#333',
  backgroundColor: '#ffffff',
},

dateInputButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderWidth: 1,
  borderColor: '#e0e0e0',
  borderRadius: uniformScale(6),
  paddingHorizontal: uniformScale(12),
  paddingVertical: uniformScale(12),
  backgroundColor: '#ffffff',
},
dateInputText: {
  fontSize: fontScale(14),
  fontFamily: 'Poppins_400Regular',
  color: '#333',
  flex: 1,
},
dateInputPlaceholder: {
  color: '#999',
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
dateModalContent: {
  backgroundColor: '#ffffff',
  borderRadius: uniformScale(15),
  margin: uniformScale(20),
  width: screenWidth - uniformScale(40),
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: uniformScale(4),
  },
  shadowOpacity: 0.25,
  shadowRadius: uniformScale(8),
  elevation: 5,
},
dateModalBody: {
  paddingHorizontal: uniformScale(20),
  paddingVertical: uniformScale(20),
},
dateModalSubtitle: {
  fontSize: fontScale(16),
  fontFamily: 'Poppins_600SemiBold',
  color: '#154689',
  marginBottom: uniformScale(20),
  textAlign: 'center',
},
dateInputContainer: {
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'center',
  marginBottom: uniformScale(16),
},
dateInputGroup: {
  alignItems: 'center',
},
dateInputGroupLabel: {
  fontSize: fontScale(12),
  fontFamily: 'Poppins_500Medium',
  color: '#666',
  marginBottom: uniformScale(4),
},
dateInput: {
  borderWidth: 1,
  borderColor: '#e0e0e0',
  borderRadius: uniformScale(6),
  paddingHorizontal: uniformScale(8),
  paddingVertical: uniformScale(10),
  fontSize: fontScale(16),
  fontFamily: 'Poppins_500Medium',
  color: '#333',
  backgroundColor: '#f8f9fa',
  textAlign: 'center',
  width: uniformScale(60),
},
dateSeparator: {
  fontSize: fontScale(20),
  fontFamily: 'Poppins_500Medium',
  color: '#666',
  marginHorizontal: uniformScale(8),
  marginBottom: uniformScale(5),
},
dateHintText: {
  fontSize: fontScale(12),
  fontFamily: 'Poppins_400Regular',
  color: '#666',
  textAlign: 'center',
  fontStyle: 'italic',
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
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#022657',
    letterSpacing: uniformScale(0.5),
  },
});