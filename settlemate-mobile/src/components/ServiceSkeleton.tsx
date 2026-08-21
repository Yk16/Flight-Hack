import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme/colors';

export const ServiceSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0.8],
    }),
  };

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imageSkeleton, shimmerStyle]} />
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Animated.View style={[styles.priceSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.badgeSkeleton, shimmerStyle]} />
        </View>
        <Animated.View style={[styles.titleSkeleton, shimmerStyle]} />
        <Animated.View style={[styles.descriptionSkeleton1, shimmerStyle]} />
        <Animated.View style={[styles.descriptionSkeleton2, shimmerStyle]} />
        <View style={styles.providerRow}>
          <Animated.View style={[styles.providerSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.buttonSkeleton, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageSkeleton: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  priceSkeleton: {
    width: 100,
    height: 24,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  badgeSkeleton: {
    width: 80,
    height: 20,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  titleSkeleton: {
    width: '80%',
    height: 18,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  descriptionSkeleton1: {
    width: '100%',
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  descriptionSkeleton2: {
    width: '85%',
    height: 14,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  providerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  providerSkeleton: {
    width: '60%',
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
  },
  buttonSkeleton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
  },
});
