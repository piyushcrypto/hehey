import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 5;
const GRID_ROWS = 12;
const TOTAL_BOXES = GRID_COLS * GRID_ROWS;

// Individual animated box component
const AnimatedBox = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.02 + Math.random() * 0.04)).current;

  useEffect(() => {
    const animate = () => {
      const duration = 2000 + Math.random() * 3000;
      const toValue = 0.02 + Math.random() * 0.06;
      
      Animated.sequence([
        Animated.timing(opacity, {
          toValue,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.02 + Math.random() * 0.04,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [delay, opacity]);

  return (
    <Animated.View style={[styles.gridBox, { opacity }]} />
  );
};

export default function SplashScreen() {
  const router = useRouter();
  
  // Generate stable delays for each box
  const boxDelays = useMemo(() => 
    Array.from({ length: TOTAL_BOXES }, () => Math.random() * 2000),
    []
  );

  const handleGetStarted = () => {
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Animated grid background */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: GRID_ROWS }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array.from({ length: GRID_COLS }).map((_, colIndex) => (
              <AnimatedBox 
                key={colIndex} 
                delay={boxDelays[rowIndex * GRID_COLS + colIndex]} 
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <ThemedText style={styles.logoTop}>HE</ThemedText>
            <ThemedText style={styles.logoBottom}>HEY</ThemedText>
          </View>
        </View>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <ThemedText style={styles.tagline}>The HEHEY Group</ThemedText>
        
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <ThemedText style={styles.getStartedText}>Get Started</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridRow: {
    flexDirection: 'row',
    flex: 1,
  },
  gridBox: {
    flex: 1,
    margin: 3,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  logoTop: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 72,
  },
  logoBottom: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 72,
    marginTop: -10,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    alignItems: 'center',
    gap: 24,
  },
  tagline: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
  },
  getStartedButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  getStartedText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
