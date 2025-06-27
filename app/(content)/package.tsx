import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Correct import for Expo Router
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

export default function TourDetailScreen() {
  const [isFavorite, setIsFavorite] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold
  });

  if (!fontsLoaded) {
    return null;
  }

  const inclusions = [
    {
      icon: 'airplane',
      title: '5 DAYS 4 NIGHTS',
      color: '#FF6B6B'
    },
    {
      icon: 'car',
      title: 'AIRPORT TRANSFER',
      color: '#4ECDC4'
    },
    {
      icon: 'document-text',
      title: 'VISA PROCESSING',
      color: '#45B7D1'
    },
    {
      icon: 'airplane',
      title: '2-WAY AIRFARE',
      color: '#96CEB4'
    },
    {
      icon: 'bed',
      title: 'HOTEL + DAILY TOUR',
      subtitle: '(TOURS ONLY NO TRANSFER)',
      color: '#FECA57'
    },
    {
      icon: 'restaurant',
      title: 'BREAKFAST INCLUDED',
      color: '#FF9FF3'
    }
  ];

  const handleBackButton = () => {
    router.push('/(app)/home');
  }

  const handleBookButton = () => {
    router.push('/(content)/booking')
  }

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
          <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
            <Ionicons name="chevron-back" size={uniformScale(24)} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>JAPAN TOUR</Text>
          <View style={styles.headerSpacer}></View>
        </View>

        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=250&fit=crop' }}
            style={styles.mainImage}
          />
          
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={uniformScale(12)} color="#FFD700" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.destinationTitle}>OSAKA, JAPAN</Text>
            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel 
            vehicula odio, blandit et velit sed conmsectetur. Suspendisse 
            sit at elementum leo. In blandit vehicula sem consequat pulvinar. 
            Quisque non ipsum in purus venenatis pretium ut eget nunc. 
            Fusce dapibus turpis ex, et pretium lacus tempor et quam, 
            pulvinar consectetur dolor varius nulla imperdiet ut quam dignissim at 
            neque. Donec enim leo. Pellentesque habitant morbi tristique senectus 
            nunc. Duis volutpat elit sed cursus, aliquam nunc bibendum.
          </Text>
        </View>

        {/* Available Dates */}
        <View style={styles.availableDatesSection}>
          <Text style={styles.sectionLabel}>Available Dates:</Text>
        </View>

        {/* Inclusions Section */}
        <View style={styles.inclusionsSection}>
          <Text style={styles.sectionTitle}>INCLUSIONS</Text>
          
          <View style={styles.inclusionsGrid}>
            {inclusions.map((item, index) => (
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
      </ScrollView>

      {/* Bottom Section - Price and Book Button */}
      <View style={styles.bottomSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.price}>PHP 49,999</Text>
          <Text style={styles.subprice}>PER PAX</Text>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookButton}>
          <Text style={styles.bookButtonText}>BOOK</Text>
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
  availableDatesSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(25),
  },
  sectionLabel: {
    fontSize: fontScale(14),
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  inclusionsSection: {
    paddingHorizontal: uniformScale(20),
    marginBottom: uniformScale(120),
  },
  sectionTitle: {
    fontSize: fontScale(16),
    fontFamily: 'Poppins_700Bold',
    color: '#333',
    marginBottom: uniformScale(20),
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