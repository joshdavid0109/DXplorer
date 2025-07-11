import { supabase } from '@/lib/supabase'; // Adjust path to your supabase client
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
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

// Types matching your database structure
interface DatabaseBooking {
  booking_id: number;
  package_id: string;
  date_id: number;
  num_guests: number;
  status: string;
  created_at: string;
  user_id: string;
  end_date: string;
  start_date: string;
  booking_ref: string;
  payment_id: number;
  packages?: {
    title: string;
    main_location: string;
    price: number;
  };
  payments?: {
    amount: number;
    payment_method: string;
    status: string;
    paid_at: string;
    is_installment: boolean;
    installment_plan: string;
    is_fully_paid: boolean;
  };
}

interface BookedTour {
  id: string;
  packageId: string;
  packageTitle: string;
  packageLocation: string;
  startDate: string;
  endDate: string;
  numberOfPax: number;
  totalPrice: number;
  bookingStatus: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  bookingReference: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: 'full' | 'installment';
  installmentPlan?: string;
  bookedDate: string;
  contactEmail: string;
  contactPhone: string;
  packageImage?: string;
  isFullyPaid?: boolean;
}

interface SuccessData {
  bookingReference: string;
  packageTitle: string;
  totalAmount: number;
  isInstallment: boolean;
  installmentMonths?: number;
  monthlyAmount?: number;
}

export default function BookedToursScreen() {
  const [bookedTours, setBookedTours] = useState<BookedTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTour, setSelectedTour] = useState<BookedTour | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Get success data from route params if coming from payment
  const { successData: successDataParam } = useLocalSearchParams<{ successData: string }>();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    // Get current user
    getCurrentUser();
    
    // Check if coming from successful payment
    if (successDataParam) {
      try {
        const parsedSuccessData = JSON.parse(successDataParam);
        setSuccessData(parsedSuccessData);
        setShowSuccessMessage(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } catch (error) {
        console.error('Error parsing success data:', error);
      }
    }
  }, [successDataParam]);

  useEffect(() => {
    if (currentUser) {
      fetchBookedTours();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

const fetchBookedTours = async () => {
  try {
    setIsLoading(true);
    
    if (!currentUser) {
      console.log('No user logged in');
      setIsLoading(false);
      return;
    }

    console.log('Current user ID:', currentUser.id);

    // Fetch bookings with both packages and payments data
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        packages (
          title,
          main_location,
          price
        ),
        payments (
          amount,
          payment_method,
          status,
          paid_at,
          is_installment,
          installment_plan,
          is_fully_paid
        )
      `)
      .eq('user_id', currentUser.id);

    console.log('Bookings data:', bookingsData);
    console.log('Bookings error:', bookingsError);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      Alert.alert('Error', 'Failed to load your bookings. Please try again.');
      return;
    }

    if (bookingsData && bookingsData.length > 0) {
      const formattedBookings: BookedTour[] = bookingsData.map((booking: DatabaseBooking) => {
        // Extract package data
        const packageData = booking.packages;
        const paymentData = booking.payments;

        console.log('Processing booking:', booking.booking_id);
        console.log('Package data:', packageData);
        console.log('Payment data:', paymentData);

        return {
          id: booking.booking_id.toString(),
          packageId: booking.package_id || 'unknown',
          packageTitle: packageData?.title || 'Unknown Package',
          packageLocation: packageData?.main_location || 'Unknown Location',
          startDate: booking.end_date,
          endDate: booking.start_date,
          numberOfPax: booking.num_guests,
          totalPrice: paymentData?.amount || packageData?.price || 0,
          bookingStatus: mapBookingStatus(booking.status),
          bookingReference: booking.booking_ref,
          paymentStatus: paymentData ? mapPaymentStatus(paymentData.status) : 'pending',
          paymentMethod: paymentData?.is_installment ? 'installment' : 'full',
          installmentPlan: paymentData?.installment_plan || undefined,
          bookedDate: booking.created_at,
          contactEmail: currentUser.email || '',
          contactPhone: currentUser.phone || '',
          isFullyPaid: paymentData?.is_fully_paid || false
        };
      });

      console.log('Formatted bookings:', formattedBookings);
      setBookedTours(formattedBookings);
    } else {
      setBookedTours([]);
    }

  } catch (error) {
    console.error('Error fetching booked tours:', error);
    Alert.alert('Error', 'Failed to load your bookings. Please try again.');
  } finally {
    setIsLoading(false);
    setRefreshing(false);
  }
};

  // Helper function to map booking status
  const mapBookingStatus = (status: string): 'confirmed' | 'pending' | 'completed' | 'cancelled' => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'confirmed';
      case 'pending':
        return 'pending';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  // Helper function to map payment status
  const mapPaymentStatus = (status: string): 'paid' | 'pending' | 'failed' => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookedTours();
  };

  const handleBack = () => {
    router.back();
  };

  const handleTourPress = (tour: BookedTour) => {
    setSelectedTour(tour);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedTour(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const year = start.getFullYear();
    
    if (start.getMonth() === end.getMonth()) {
      return `${startDay} - ${endDay} ${startMonth} ${year}`;
    } else {
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedTour) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Update booking status to cancelled
              const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('booking_id', parseInt(selectedTour.id));

              if (error) {
                console.error('Error cancelling booking:', error);
                Alert.alert('Error', 'Failed to cancel booking. Please try again.');
                return;
              }

              // Refresh the bookings list
              await fetchBookedTours();
              handleCloseModal();
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleViewItinerary = () => {
    router.push(`/(content)/package?packageId=${selectedTour?.packageId}`);
    handleCloseModal();
  };

  const renderTourCard = (tour: BookedTour) => (
    <TouchableOpacity
      key={tour.id}
      style={styles.tourCard}
      onPress={() => handleTourPress(tour)}
    >
      <View style={styles.tourCardHeader}>
        <View style={styles.tourCardLeft}>
          <View style={styles.cardTitleIndicator} />
          <View style={styles.tourCardInfo}>
            <Text style={styles.tourTitle}>{tour.packageTitle}</Text>
            <Text style={styles.tourLocation}>{tour.packageLocation}</Text>
            <Text style={styles.tourDate}>{formatDateRange(tour.startDate, tour.endDate)}</Text>
          </View>
        </View>
        <View style={styles.tourCardRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tour.bookingStatus) }]}>
            <Text style={styles.statusText}>{getStatusText(tour.bookingStatus)}</Text>
          </View>
          <Text style={styles.tourPrice}>PHP {tour.totalPrice.toLocaleString()}</Text>
          <Text style={styles.tourPax}>{tour.numberOfPax} pax</Text>
        </View>
      </View>
      
      <View style={styles.tourCardFooter}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingReference}>Ref: {tour.bookingReference}</Text>
          <Text style={styles.bookingDate}>Booked: {formatDate(tour.bookedDate)}</Text>
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentMethod}>
            {tour.paymentMethod === 'installment' ? `Installment (${tour.installmentPlan})` : 'Full Payment'}
          </Text>
          <View style={[styles.paymentStatusBadge, { 
            backgroundColor: tour.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' 
          }]}>
            <Text style={styles.paymentStatusText}>
              {tour.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSuccessMessage = () => {
    if (!showSuccessMessage || !successData) return null;

    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={uniformScale(50)} color="#4CAF50" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>
            Your booking has been confirmed.
          </Text>
          <View style={styles.successDetails}>
            <Text style={styles.successDetailLabel}>Booking Reference:</Text>
            <Text style={styles.successDetailValue}>{successData.bookingReference}</Text>
          </View>
          <View style={styles.successDetails}>
            <Text style={styles.successDetailLabel}>Package:</Text>
            <Text style={styles.successDetailValue}>{successData.packageTitle}</Text>
          </View>
          <View style={styles.successDetails}>
            <Text style={styles.successDetailLabel}>Amount:</Text>
            <Text style={styles.successDetailValue}>
              PHP {successData.isInstallment 
                ? `${successData.monthlyAmount?.toLocaleString()} x ${successData.installmentMonths} months`
                : successData.totalAmount.toLocaleString()
              }
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.successCloseButton}
            onPress={() => setShowSuccessMessage(false)}
          >
            <Text style={styles.successCloseText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView 
    style={styles.container}
    edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar 
      barStyle="dark-content" 
      backgroundColor={Platform.OS === 'ios' ? undefined : "#f8f9fa"}
      translucent={Platform.OS === 'android'} />
      <SharedLayout>   
        <ScrollableLogo/>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#154689" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BOOKED TOURS</Text>
          <View style={styles.headerSpacer} />
        </View>

      {/* Success Message Overlay */}
      {renderSuccessMessage()}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Your Bookings</Text>
          <Text style={styles.summarySubtitle}>
            {bookedTours.length} total booking{bookedTours.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Tour Cards */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : bookedTours.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={uniformScale(60)} color="#ccc" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>
              Your booked tours will appear here once you make a booking.
            </Text>
          </View>
        ) : (
          <View style={styles.toursContainer}>
            {bookedTours.map(renderTourCard)}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Tour Detail Modal */}
      {selectedTour && (
        <Modal
          visible={isDetailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
          statusBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={handleCloseModal}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={uniformScale(24)} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Package Information</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Package:</Text>
                    <Text style={styles.modalValue}>{selectedTour.packageTitle}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Location:</Text>
                    <Text style={styles.modalValue}>{selectedTour.packageLocation}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Travel Dates:</Text>
                    <Text style={styles.modalValue}>
                      {formatDateRange(selectedTour.startDate, selectedTour.endDate)}
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Passengers:</Text>
                    <Text style={styles.modalValue}>{selectedTour.numberOfPax} pax</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Booking Information</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Reference:</Text>
                    <Text style={styles.modalValue}>{selectedTour.bookingReference}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Status:</Text>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedTour.bookingStatus) }]}>
                      <Text style={styles.modalStatusText}>{getStatusText(selectedTour.bookingStatus)}</Text>
                    </View>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Booked Date:</Text>
                    <Text style={styles.modalValue}>{formatDate(selectedTour.bookedDate)}</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Payment Information</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Total Amount:</Text>
                    <Text style={styles.modalValue}>PHP {selectedTour.totalPrice.toLocaleString()}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Payment Method:</Text>
                    <Text style={styles.modalValue}>
                      {selectedTour.paymentMethod === 'installment' 
                        ? `Installment (${selectedTour.installmentPlan})` 
                        : 'Full Payment'
                      }
                    </Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Payment Status:</Text>
                    <View style={[styles.modalStatusBadge, { 
                      backgroundColor: selectedTour.paymentStatus === 'paid' ? '#4CAF50' : '#FF9800' 
                    }]}>
                      <Text style={styles.modalStatusText}>
                        {selectedTour.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  {selectedTour.paymentMethod === 'installment' && (
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Fully Paid:</Text>
                      <Text style={styles.modalValue}>
                        {selectedTour.isFullyPaid ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Contact Information</Text>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Email:</Text>
                    <Text style={styles.modalValue}>{selectedTour.contactEmail}</Text>
                  </View>
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Phone:</Text>
                    <Text style={styles.modalValue}>{selectedTour.contactPhone}</Text>
                  </View>
                </View>
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.modalButton} onPress={handleViewItinerary}>
                  <Text style={styles.modalButtonText}>View Itinerary</Text>
                </TouchableOpacity>
                {selectedTour.bookingStatus === 'confirmed' && (
                  <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelBooking}>
                    <Text style={styles.modalCancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
      </SharedLayout>  
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
  successContainer: {
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
  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(20),
    padding: uniformScale(30),
    margin: uniformScale(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.25,
    shadowRadius: uniformScale(8),
    elevation: 5,
  },
  successIcon: {
    marginBottom: uniformScale(15),
  },
  successTitle: {
    fontSize: fontScale(24),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    marginBottom: uniformScale(10),
  },
  successMessage: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: uniformScale(20),
  },
  successDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: uniformScale(8),
  },
  successDetailLabel: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  successDetailValue: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  successCloseButton: {
    backgroundColor: '#FAAD2B',
    paddingHorizontal: uniformScale(30),
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(25),
    marginTop: uniformScale(20),
  },
  successCloseText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#022657',
  },
  summarySection: {
    backgroundColor: '#e8e8e8',
    marginHorizontal: uniformScale(20),
    marginBottom: uniformScale(15),
    borderRadius: uniformScale(10),
    paddingVertical: uniformScale(12),
    paddingHorizontal: uniformScale(16),
  },
  summaryTitle: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  summarySubtitle: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: uniformScale(2),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: uniformScale(60),
  },
  loadingText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: uniformScale(60),
    paddingHorizontal: uniformScale(40),
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
    lineHeight: fontScale(20),
    marginBottom: uniformScale(30),
  },
  toursContainer: {
    paddingHorizontal: uniformScale(20),
  },
  tourCard: {
    backgroundColor: '#ffffff',
    borderRadius: uniformScale(12),
    padding: uniformScale(16),
    marginBottom: uniformScale(15),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(2),
    },
    shadowOpacity: 0.1,
    shadowRadius: uniformScale(4),
    elevation: 3,
  },
  tourCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: uniformScale(12),
  },
  tourCardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  cardTitleIndicator: {
    width: uniformScale(3),
    height: uniformScale(50),
    backgroundColor: '#FAAD2B',
    borderRadius: uniformScale(2),
    marginRight: uniformScale(12),
  },
  tourCardInfo: {
    flex: 1,
  },
  tourTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
    marginBottom: uniformScale(4),
  },
 tourLocation: {
    fontSize: fontScale(13),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(4),
  },
  tourDate: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#888',
  },
  tourCardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(12),
    marginBottom: uniformScale(6),
  },
  statusText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  tourPrice: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
    marginBottom: uniformScale(2),
  },
  tourPax: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  tourCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: uniformScale(12),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingReference: {
    fontSize: fontScale(12),
    fontFamily: 'Poppins_500Medium',
    color: '#154689',
    marginBottom: uniformScale(2),
  },
  bookingDate: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  paymentMethod: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: uniformScale(4),
  },
  paymentStatusBadge: {
    paddingHorizontal: uniformScale(6),
    paddingVertical: uniformScale(2),
    borderRadius: uniformScale(8),
  },
  paymentStatusText: {
    fontSize: fontScale(10),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  bottomSpacer: {
    height: uniformScale(20),
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: uniformScale(20),
    borderTopRightRadius: uniformScale(20),
    maxHeight: screenHeight * 0.85,
    paddingBottom: uniformScale(20),
    width: screenWidth, // Explicitly set width
    alignSelf: 'center',
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
    fontSize: fontScale(20),
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
  },
  modalCloseButton: {
    width: uniformScale(32),
    height: uniformScale(32),
    borderRadius: uniformScale(16),
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: uniformScale(20),
  },
  modalSection: {
    marginBottom: uniformScale(20),
  },
  modalSectionTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
    marginBottom: uniformScale(12),
    paddingBottom: uniformScale(6),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: uniformScale(8),
  },
  modalLabel: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    flex: 1,
  },
  modalValue: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalStatusBadge: {
    paddingHorizontal: uniformScale(8),
    paddingVertical: uniformScale(4),
    borderRadius: uniformScale(12),
  },
  modalStatusText: {
    fontSize: fontScale(11),
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: uniformScale(20),
    paddingTop: uniformScale(15),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: uniformScale(10),
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#FAAD2B',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(25),
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#022657',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: uniformScale(12),
    borderRadius: uniformScale(25),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  modalCancelButtonText: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_600SemiBold',
    color: '#F44336',
  },
});