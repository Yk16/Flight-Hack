import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Service } from '../types/services';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, scale, verticalScale } from '../utils/responsive';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  onBook?: () => void;
}

export const ServiceCard = ({ service, onPress, onBook }: ServiceCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(3)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: false,
        bounciness: 5,
      }),
      Animated.timing(shadowAnim, {
        toValue: 8,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        bounciness: 5,
      }),
      Animated.timing(shadowAnim, {
        toValue: 3,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'MAID':
        return 'spray-bottle';
      case 'COOK':
        return 'chef-hat';
      case 'LAUNDRY':
        return 'washing-machine';
      case 'FURNITURE':
        return 'sofa-single';
      case 'APPLIANCE':
        return 'wrench';
      default:
        return 'briefcase';
    }
  };

  const getPricingLabel = (model: string) => {
    switch (model) {
      case 'PER_MONTH':
        return '/month';
      case 'PER_JOB':
        return '/job';
      case 'ONE_TIME':
        return 'one-time';
      default:
        return '';
    }
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const shadowStyle = {
    elevation: shadowAnim,
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [3, 8],
      outputRange: [0.08, 0.16],
    }),
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        animatedStyle,
        Platform.OS !== 'web' && shadowStyle,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.card}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                service.images?.[0] ||
                'https://via.placeholder.com/400x250?text=Service',
            }}
            style={styles.image}
          />
          {/* Icon Badge */}
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name={getServiceIcon(service.type)}
              size={24}
              color={COLORS.surface}
            />
          </View>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {service.isFeatured && (
              <View style={[styles.badge, styles.featuredBadge]}>
                <Ionicons
                  name="star"
                  size={12}
                  color={COLORS.surface}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.badgeText}>Featured</Text>
              </View>
            )}
            {service.isTrending && (
              <View style={[styles.badge, styles.trendingBadge]}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={12}
                  color={COLORS.surface}
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.badgeText}>Trending</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Price and Type */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.price}>₹{service.price.toLocaleString()}</Text>
              <Text style={styles.pricingModel}>
                {getPricingLabel(service.pricingModel)}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{service.type}</Text>
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.title} numberOfLines={1}>
            {service.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {service.description || 'Professional service with premium quality'}
          </Text>

          {/* Provider Info */}
          <View style={styles.providerInfo}>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName} numberOfLines={1}>
                {service.providerName || 'Service Provider'}
              </Text>
              <View style={styles.ratingContainer}>
                <Ionicons
                  name="star"
                  size={12}
                  color="#FFC107"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.rating}>
                  {service.providerRating || 4.5}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={onBook}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: verticalScale(200),
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  iconBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgesContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    // RN doesn't support gap; add spacing on badges instead
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  featuredBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
  },
  trendingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.md,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  pricingModel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  typeBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  providerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  bookBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
