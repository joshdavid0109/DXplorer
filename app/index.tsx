import { supabase } from '@/lib/supabase'; // adjust if needed
import { Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions for consistent scaling (iPhone 12 Pro as reference)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Consistent scaling function that maintains proportions
const uniformScale = (size: number) => {
  const scale = Math.min(screenWidth / BASE_WIDTH, screenHeight / BASE_HEIGHT);
  return size * scale;
};

const CurvedBackground = () => (
  <Svg
    width="100%"
    height="40%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ position: 'absolute', top: 0, left: 0 }}
  >
    <Path
      d="M0,0 L100,0 L100,75 Q50,95 0,75 Z"
      fill="transparent"
    />
  </Svg>
);

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Poppins_500Medium
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleExplorePress = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (session && session.user) {
    router.replace('/(app)/home'); // go to main app screen
  } else {
    router.push('/(auth)/login'); // go to login if not authenticated
  }
};

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image
        source={require('../assets/images/main_page_slide/slide_image1.jpg')}
        style={styles.fullScreenBackgroundImage}
        resizeMode="cover"
      />

      {/* Full-screen overlay */}
      <View style={styles.fullScreenOverlay} />

      <View style={styles.topCurvedBackground}>
        <CurvedBackground />
         <View style={[styles.header, { paddingTop: Math.max(insets.top, uniformScale(20)) }]}>
          {/*<LottieView
              source={require('../assets/animations/logo-animation.json')}
              autoPlay
              loop
              style={[styles.logoAnimation, { backgroundColor: 'transparent'}]}
              speed={1}
              hardwareAccelerationAndroid={true}
              renderMode="HARDWARE"
              resizeMode="contain"
            />*/}
          <Image
            source={require('../assets/images/dxblue.png')}
            style={styles.logoAnimation}
            resizeMode="contain"></Image>
        </View> 
        
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.exploreButton} onPress={handleExplorePress}>
            <Text style={styles.exploreButtonText}>EXPLORE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fullScreenBackgroundImage: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight,
    top: 0,
    left: 0,
    zIndex: 0,
  },
  fullScreenOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(160, 160, 160, 0.4)',
    zIndex: 1,
  },
  topCurvedBackground: {
    width: '100%',
    height: '40%',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  header: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 10,
    top: 0,
  },
  logoAnimation: {
    width: '70%',
    height: '60%',
    maxWidth: uniformScale(280),
    maxHeight: uniformScale(240),
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 3,
    justifyContent: 'flex-end',
  },
  bottomSection: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '3%',
    zIndex: 4,
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    paddingVertical: '4%',
    paddingHorizontal: '15%',
    borderRadius: uniformScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: '60%',
    maxWidth: '75%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreButtonText: {
    color: '#022657',
    fontSize: uniformScale(18),
    textTransform: 'uppercase',
    letterSpacing: uniformScale(1.5),
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
});