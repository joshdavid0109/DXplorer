import { Poppins_400Regular, Poppins_500Medium, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, NativeScrollEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

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
    height={315}
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
                    Math.round(screenWidth * 0.2),
                    0,
                    Math.round(-screenWidth * 0.2)
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
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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

        <View style={styles.paginationContainer}>
          {introSlides.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(index - 1) * screenWidth, index * screenWidth, (index + 1) * screenWidth],
              outputRange: [8, 24, 8],
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
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    top: 0,
  },
  logo: {
    width: 300,
    height: 270,
    marginBottom: 8,
    marginTop: 20,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
    zIndex: 3,
  },
  sloganContainer: {
    marginBottom: 20,
    alignItems:'flex-start',
    marginTop: -20,
    paddingHorizontal: 40,
    zIndex: 4,
  },
  mainSlogan: {
    fontSize: 40,
    color: '#022657',
    textAlign: 'left',
    marginTop: 15,
    lineHeight: 30,
    fontFamily: 'Poppins_700Bold',
  },
  subSlogan: {
    fontSize: 40,
    color: '#022657',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: 'Poppins_500Medium',
  },
  descriptionFlatList: {
    marginTop: 150,
    flexGrow: 0,
    minHeight: 120,
    maxHeight: 200,
    backgroundColor: 'transparent',
    zIndex: 4,
  },
  descriptionFlatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  slideContent: {
    width: screenWidth,
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
    zIndex: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 15,
    zIndex: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 4,
  },
  exploreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    paddingVertical: 8,
    paddingHorizontal: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 30,
    zIndex: 4,
  },
  exploreButtonText: {
    color: '#022657',
    fontSize: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Poppins_700Bold',
  },
});