import { Poppins_400Regular, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, NativeScrollEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Import NativeScrollEvent
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Define a type for your intro slide data
interface IntroSlide {
  slogan1: string;
  slogan2: string;
  description: string;
}

const introSlides: IntroSlide[] = [ // Use the IntroSlide type here
  {
    slogan1: "DON'T JUST TRAVEL,",
    slogan2: "GO AND XPLORE!",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vel tincidunt odio. Mauris laoreet ut velit sed venenatis. Suspendisse ac elementum nunc. In laoreet vehicula orci tincidunt posuere.",
  },
  {
    slogan1: "DISCOVER NEW",
    slogan2: "ADVENTURES",
    description: "Explore breathtaking landscapes and hidden gems. Immerse yourself in diverse cultures and create unforgettable memories.",
  },
  {
    slogan1: "PLAN YOUR",
    slogan2: "DREAM TRIP",
    description: "From pristine beaches to majestic mountains, we offer tailor-made experiences to suit every adventurer's desire. Start your journey today!",
  },
];

const CurvedBackground = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ position: 'absolute', top: 0, left: 0 }}
  >
    <Path
      d="M0,0 L100,0 V80 Q50,100 0,80 Z"
      fill="#022657"
    />
  </Svg>
);

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
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
      listener: (event: { nativeEvent: NativeScrollEvent }) => { // Explicitly type event
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(scrollOffset / width);
        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }
      },
    }
  );

  const renderDescriptionItem = ({ item }: { item: IntroSlide }) => ( // Explicitly type item
    <View style={styles.slideContent}>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const scrollTo = (index: number) => { // Explicitly type index
    if (flatListRef.current) { // Check if flatListRef.current is not null
      flatListRef.current.scrollToIndex({ index, animated: true });
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topCurvedBackground}>
        <CurvedBackground />

        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Image
            source={require('../assets/images/dx_logo_blue.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.sloganContainer}>
          <Text style={styles.mainSlogan}>{introSlides[activeIndex].slogan1}</Text>
          <Text style={styles.mainSlogan}>{introSlides[activeIndex].slogan2}</Text>
        </View>

        <FlatList<IntroSlide> // Explicitly type FlatList for better type checking
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
            length: width,
            offset: width * index,
            index,
          })}
          style={styles.descriptionFlatList}
          contentContainerStyle={styles.descriptionFlatListContent}
        />

        <View style={styles.paginationContainer}>
          {introSlides.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const dotBackgroundColor = scrollX.interpolate({
              inputRange: [(index - 1) * width, index * width, (index + 1) * width],
              outputRange: ['#bdc3c7', '#3498db', '#bdc3c7'],
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

        <TouchableOpacity style={styles.exploreButton}>
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
  topCurvedBackground: {
    width: '100%',
    height: 350,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    top: 0,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 8,
    marginTop: 30,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontFamily: 'Poppins_700Bold',
  },
  tagline: {
    fontSize: 12,
    color: '#e0e0e0',
    letterSpacing: 0.8,
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -20, // This should reveal the curve. Adjust further if needed.
    backgroundColor: '#f8f9fa',
  },
  sloganContainer: {
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  mainSlogan: {
    fontSize: 24,
    color: '#2c3e50',
    textAlign: 'center',
    lineHeight: 30,
    fontFamily: 'Poppins_700Bold',
  },
  descriptionFlatList: {
    flexGrow: 0,
    minHeight: 120,
    maxHeight: 200,
  },
  descriptionFlatListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  slideContent: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 15,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 4,
  },
  exploreButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Poppins_700Bold',
  },
});