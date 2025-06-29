// components/SharedLayout.jsx
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const uniformScale = (size) => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

export default function SharedLayout({ children }) {
  const pathname = usePathname();
  const backgroundAnimation = useRef(new Animated.Value(0)).current;
  
  // Determine active screen based on current path
  const isHomeActive = pathname === '/home' || pathname === '/';
  const isFavoritesActive = pathname === '/favorite_tours';
  const isCalendarActive = pathname === '/calendar';

  // Define background colors for different screens
  const getBackgroundIndex = () => {
    if (isHomeActive) return 0;
    if (isFavoritesActive) return 1;
    if (isCalendarActive) return 2;
    return 0;
  };

  // Animate background transition when route changes
  useEffect(() => {
    const targetValue = getBackgroundIndex();
    Animated.timing(backgroundAnimation, {
      toValue: targetValue,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [pathname]);

  // Interpolate background colors
  const backgroundColor = backgroundAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      'rgba(255, 255, 255, 0.88)', // Home - light white
      'rgba(248, 250, 255, 0.92)', // Favorites - subtle blue tint
      'rgba(250, 248, 255, 0.92)', // Calendar - subtle purple tint
    ],
  });

  // Interpolate gradient overlay colors for more dynamic transitions
  const overlayColor = backgroundAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      'rgba(21, 70, 137, 0.02)', // Home - very subtle blue
      'rgba(21, 70, 137, 0.08)', // Favorites - more blue
      'rgba(138, 43, 226, 0.06)', // Calendar - purple tint
    ],
  });

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundContainer, { backgroundColor }]}>
        <Animated.View style={[styles.overlayGradient, { backgroundColor: overlayColor }]} />
      </Animated.View>

      {/* Screen Content */}
      <View style={styles.screenContent}>
        {children}
      </View>

      {/* Persistent Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/home')}
        >
          {isHomeActive ? (
            <Animated.View style={styles.activeNavBackground}>
              <Ionicons name="home" size={uniformScale(24)} color="#ffffff" />
            </Animated.View>
          ) : (
            <Ionicons name="home" size={uniformScale(24)} color="#999" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/favorite_tours')}
        >
          {isFavoritesActive ? (
            <Animated.View style={styles.activeNavBackground}>
              <Ionicons name="heart" size={uniformScale(24)} color="#ffffff" />
            </Animated.View>
          ) : (
            <Ionicons name="heart" size={uniformScale(24)} color="#999" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('/calendar')}
        >
          {isCalendarActive ? (
            <Animated.View style={styles.activeNavBackground}>
              <Ionicons name="calendar" size={uniformScale(24)} color="#ffffff" />
            </Animated.View>
          ) : (
            <Ionicons name="calendar" size={uniformScale(24)} color="#999" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayGradient: {
    flex: 1,
  },
  screenContent: {
    flex: 1,
    zIndex: 1,
    backgroundColor: '#f8f9fa',

  },
  bottomNav: {
    position: 'absolute',
    bottom: uniformScale(15),
    width: screenWidth * 0.5,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingVertical: uniformScale(15),
    paddingHorizontal: uniformScale(20),
    borderRadius: uniformScale(30),
    gap: uniformScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: uniformScale(4),
    },
    shadowOpacity: 0.15,
    shadowRadius: uniformScale(10),
    elevation: 8,
    zIndex: 2,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavBackground: {
    backgroundColor: '#154689',
    width: uniformScale(50),
    height: uniformScale(35),
    borderRadius: uniformScale(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
});