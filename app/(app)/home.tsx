import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

const { width: screenWidth } = Dimensions.get('window');

// Destination Card Component
const DestinationCard = ({ 
  destination = "OSAKA, JAPAN",
  price = "PHP 49,999/PAX",
  duration = "5 DAYS 4 NIGHTS",
  rating = 4.8,
  imageUri = "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop",
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.destinationCard} onPress={onPress}>
      {/* Background Image */}
      <Image source={{ uri: imageUri }} style={styles.destinationCardImage} />
      
      {/* Rating Badge */}
      <View style={styles.ratingBadge}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
      
      {/* Content Overlay */}
      <View style={styles.destinationCardOverlay}>
        <View style={styles.destinationCardContent}>
          {/* Destination Name */}
          <Text style={styles.destinationCardTitle}>{destination}</Text>
          
          {/* Price */}
          <Text style={styles.destinationCardPrice}>{price}</Text>
          
          {/* Duration */}
          <Text style={styles.destinationCardDuration}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('Top Destinations');

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

  const topDestinations = [
    {
      id: 1,
      destination: "OSAKA, JAPAN",
      price: "PHP 49,999/PAX",
      duration: "5 DAYS 4 NIGHTS",
      rating: 4.8,
      imageUri: "https://images.unsplash.com/photo-1590253230532-a67f6bc61b6e?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      destination: "TOKYO, JAPAN",
      price: "PHP 55,999/PAX",
      duration: "6 DAYS 5 NIGHTS",
      rating: 4.9,
      imageUri: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      destination: "EL NIDO, PHILIPPINES",
      price: "PHP 25,999/PAX",
      duration: "4 DAYS 3 NIGHTS",
      rating: 4.7,
      imageUri: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400&h=300&fit=crop"
    }
  ];

  const localTours = [
    {
      id: 1,
      title: 'BORACAY',
      subtitle: 'White Beach',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=120&fit=crop',
    },
    {
      id: 2,
      title: 'BOHOL',
      subtitle: 'Chocolate Hills',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=120&fit=crop',
    }
  ];

  const internationalTours = [
    {
      id: 1,
      title: 'DA NANG',
      subtitle: 'Vietnam',
      image: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=200&h=120&fit=crop',
    },
    {
      id: 2,
      title: 'SINGAPORE',
      subtitle: 'Marina Bay',
      image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=200&h=120&fit=crop',
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo - Centered */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/dx_logo_white.png')} // Update this path to your logo
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Location and Profile Section */}
        <View style={styles.locationProfileSection}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationLabel}>LOCATION</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-outline" size={24} color="#154689" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>Asia, Philippines</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Let's Explore Your Best</Text>
          <Text style={styles.welcomeSubtitle}>Travel Destination</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Top Destinations' && styles.activeTabButton]}
            onPress={() => setActiveTab('Top Destinations')}
          >
            <Text style={[styles.tabText, activeTab === 'Top Destinations' && styles.activeTabText]}>
              Top Destinations
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Flash Sale' && styles.activeTabButton]}
            onPress={() => setActiveTab('Flash Sale')}
          >
            <Text style={[styles.tabText, activeTab === 'Flash Sale' && styles.activeTabText]}>
              Flash Sale
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Destinations Section with Destination Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Destinations</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {topDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination.destination}
              price={destination.price}
              duration={destination.duration}
              rating={destination.rating}
              imageUri={destination.imageUri}
              onPress={() => console.log(`Pressed ${destination.destination}`)}
            />
          ))}
        </ScrollView>

        {/* Local Tours Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Local Tours</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {localTours.map((tour) => (
            <TouchableOpacity key={tour.id} style={styles.tourCard}>
              <Image source={{ uri: tour.image }} style={styles.tourImage} />
              <View style={styles.tourInfo}>
                <Text style={styles.tourTitle}>{tour.title}</Text>
                <Text style={styles.tourSubtitle}>{tour.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* International Tours Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>International Tours</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {internationalTours.map((tour) => (
            <TouchableOpacity key={tour.id} style={styles.tourCard}>
              <Image source={{ uri: tour.image }} style={styles.tourImage} />
              <View style={styles.tourInfo}>
                <Text style={styles.tourTitle}>{tour.title}</Text>
                <Text style={styles.tourSubtitle}>{tour.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNavBackground}>
            <Ionicons name="home" size={24} color="#ffffff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="heart-outline" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color="#999" />
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
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 60,
  },
  locationProfileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: -20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#333',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#154689',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#154689',
    lineHeight: 34,
    marginLeft: 15
  },
  welcomeSubtitle: {
    fontSize: 28,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FAAD2B',
    lineHeight: 34,
    marginLeft: 15
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTabButton: {
    backgroundColor: '#154689',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#154689',
  },
  seeAllButton: {
    paddingVertical: 5,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#999',
  },
  horizontalScroll: {
    marginBottom: 30,
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  // Updated destination card styles
  destinationCard: {
    width: screenWidth * 0.75,
    height: 220,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  destinationCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
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
    zIndex: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  destinationCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
  },
  destinationCardContent: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  destinationCardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  destinationCardPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFD700',
    marginBottom: 2,
  },
  destinationCardDuration: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#ffffff',
    opacity: 0.9,
  },
  // Tour card styles (unchanged)
  tourCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tourImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tourInfo: {
    padding: 12,
  },
  tourTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
    marginBottom: 2,
  },
  tourSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#666',
  },
  bottomSpacer: {
    height: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 40,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavBackground: {
    backgroundColor: '#1E88E5',
    width: 50,
    height: 35,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});