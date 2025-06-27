import { Ionicons } from '@expo/vector-icons';
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
    useFonts
} from '@expo-google-fonts/poppins';

const { width: screenWidth } = Dimensions.get('window');

export default function TourDetailScreen() {
  const [isFavorite, setIsFavorite] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Image
            source={require('../../assets/images/dx_logo_white.png')} // Update path
            style={styles.headerLogo}
            resizeMode="contain"
          />
          
          <Text style={styles.headerTitle}>JAPAN TOUR</Text>
        </View>

        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=250&fit=crop' }}
            style={styles.mainImage}
          />
          
          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
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
                size={24} 
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
                  <Ionicons name={item.icon} size={20} color="#ffffff" />
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
        </View>
        
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>BOOK</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  backButton: {
    padding: 5,
  },
  headerLogo: {
    width: 100,
    height: 30,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
    flex: 1,
    textAlign: 'center',
    marginRight: 120, // Compensate for logo width to center the title
  },
  imageContainer: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 200,
  },
  ratingBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#154689',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    lineHeight: 22,
    textAlign: 'justify',
  },
  availableDatesSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  inclusionsSection: {
    paddingHorizontal: 20,
    marginBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#333',
    marginBottom: 20,
  },
  inclusionsGrid: {
    gap: 15,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  inclusionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inclusionText: {
    flex: 1,
  },
  inclusionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  inclusionSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginTop: 2,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#FFA726',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
});