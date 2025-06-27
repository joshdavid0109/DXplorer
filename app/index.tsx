import { Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, NativeScrollEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

interface IntroSlide {
  slogan1: string;
  slogan2: string;
  description: string;
}

const introSlides: IntroSlide[] = [
  {
    slogan1: "DON'T JUST TRAVEL,",
    slogan2: "GO AND XPLORE!",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel tincidunt odio. Mauris laoreet ut velit sed venenatis. Suspendisse ac elementum nunc. In laoreet vehicula orci tincidunt posuere.",
  },
  {
    slogan1: "DON'T JUST TRAVEL,",
    slogan2: "GO AND XPLORE!",
    description: "Explore breathtaking landscapes and hidden gems. Immerse yourself in diverse cultures and create unforgettable memories.",
  },
  {
    slogan1: "DON'T JUST TRAVEL,",
    slogan2: "GO AND XPLORE!",
    description: "From pristine beaches to majestic mountains, we offer tailor-made experiences to suit every adventurer's desire. Start your journey today!",
  },
];

const backgroundImages = [
  require('../assets/images/main_page_slide/slide_image1.jpg'),
  require('../assets/images/main_page_slide/slide_image2.jpg'),
  require('../assets/images/main_page_slide/slide_image3.jpg'),
];

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

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<IntroSlide> | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!fontsLoaded) {
    return null;
  }

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: { nativeEvent: NativeScrollEvent }) => {
        const scrollOffset = Math.round(event.nativeEvent.contentOffset.x);
        const newIndex = Math.round(scrollOffset / screenWidth);
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      },
    }
  );

  const renderDescriptionItem = ({ item }: { item: IntroSlide }) => (
    <View style={styles.slideContent}>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const scrollTo = (index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  const handleExplorePress = () => {
    // Navigate to login screen using Expo Router
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Full-screen background images */}
      {backgroundImages.map((imgSrc, i) => (
        <Animated.Image
          key={i}
          source={imgSrc}
          style={[
            styles.fullScreenBackgroundImage,
            {
              opacity: scrollX.interpolate({
                inputRange: [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
                outputRange: [0, 1, 0],
                extrapolate: 'clamp',
              }),
              transform: [{
                translateX: scrollX.interpolate({
                  inputRange: [(i - 1) * screenWidth, i * screenWidth, (i + 1) * screenWidth],
                  outputRange: [
                    screenWidth * 0.2,
                    0,
                    -screenWidth * 0.2
                  ],
                  extrapolate: 'clamp',
                })
              }],
            },
          ]}
          resizeMode="cover"
        />
      ))}

      {/* Full-screen overlay */}
      <View style={styles.fullScreenOverlay} />

      <View style={styles.topCurvedBackground}>
        <CurvedBackground />
        <View style={[styles.header, { paddingTop: Math.max(insets.top, uniformScale(20)) }]}>
            <Image
              source={require('../assets/images/dx_white_nobg.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.sloganContainer}>
          <Text style={styles.subSlogan}>{introSlides[activeIndex].slogan1}</Text>
          <Text style={styles.mainSlogan}>{introSlides[activeIndex].slogan2}</Text>
        </View>

        <View style={styles.descriptionSection}>
          <FlatList<IntroSlide>
            ref={flatListRef}
            data={introSlides}
            renderItem={renderDescriptionItem}
            keyExtractor={(_, index) => String(index)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialScrollIndex={activeIndex}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            style={styles.descriptionFlatList}
            contentContainerStyle={styles.descriptionFlatListContent}
          />
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.paginationContainer}>
            {introSlides.map((_, index) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
                outputRange: [uniformScale(8), uniformScale(24), uniformScale(8)],
                extrapolate: 'clamp',
              });

              const dotBackgroundColor = scrollX.interpolate({
                inputRange: [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
                outputRange: ['#bdc3c7', '#022657', '#bdc3c7'],
                extrapolate: 'clamp',
              });

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => scrollTo(index)}
                >
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        width: dotWidth,
                        backgroundColor: dotBackgroundColor,
                      }
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

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
  logo: {
    width: '70%',
    height: '60%',
    maxWidth: uniformScale(280),
    maxHeight: uniformScale(240),
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 3,
  },
  sloganContainer: {
    height: '25%',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: '10%',
    marginTop: '-11%',
    zIndex: 4,
  },
  mainSlogan: {
    fontSize: uniformScale(32),
    color: '#022657',
    textAlign: 'left',
    lineHeight: uniformScale(36),
    fontFamily: 'Poppins_700Bold',
    marginTop: '2%',
  },
  subSlogan: {
    fontSize: uniformScale(32),
    color: '#022657',
    textAlign: 'left',
    lineHeight: uniformScale(36),
    fontFamily: 'Poppins_500Medium',
  },
  descriptionSection: {
    height: '35%',
    justifyContent: 'center',
    zIndex: 4,
  },
  descriptionFlatList: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  descriptionFlatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  slideContent: {
    width: screenWidth,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '10%',
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: uniformScale(16),
    color: '#fff',
    textAlign: 'center',
    lineHeight: uniformScale(22),
    fontFamily: 'Poppins_400Regular',
    zIndex: 4,
  },
  bottomSection: {
    height: '25%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: '3%',
    zIndex: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: '20%',
  },
  dot: {
    height: uniformScale(8),
    borderRadius: uniformScale(4),
    backgroundColor: '#bdc3c7',
    marginHorizontal: uniformScale(4),
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