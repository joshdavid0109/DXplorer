// components/ScrollableLogo.tsx
import React from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';

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

const AppLogo = require('../assets/images/dx_nobg.png'); // Replace with your actual logo path

interface ScrollableLogoProps {
  style?: any;
  logoStyle?: any;
}

export const ScrollableLogo: React.FC<ScrollableLogoProps> = ({ style, logoStyle }) => {
  return (
    <View style={[styles.headerContainer, style]}>
      <Image
        source={AppLogo}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: uniformScale(20),
    paddingTop: Platform.OS === 'android' ? uniformScale(5) : uniformScale(5),
  },
  logo: {
    width: uniformScale(200),
    height: uniformScale(50),
  },
});