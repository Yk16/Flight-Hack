import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Service } from '../types/services';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

const CARD_WIDTH = moderateScale(240);

interface ServiceCardCompactProps {
  service: Service;
  onPress?: () => void;
  onBook?: () => void;
}

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'MAID': return 'spray-bottle';
    case 'COOK': return 'chef-hat';
    case 'LAUNDRY': return 'washing-machine';
    case 'FURNITURE': return 'sofa-single';
    case 'APPLIANCE': return 'wrench';
    default: return 'briefcase';
  }
};

const getPricingLabel = (model: string) => {
  switch (model) {
    case 'PER_MONTH': return '/month';
    case 'PER_JOB': return '/job';
    case 'ONE_TIME': return '';
    default: return '';
  }
};

export const ServiceCardCompact = ({ service, onPress, onBook }: ServiceCardCompactProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
  };

  const imageUrl = service.images?.[0] || 'https://via.placeholder.com/400x250?text=Service';

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name={getServiceIcon(service.type)}
              size={20}
              color={COLORS.surface}
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{service.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{service.price.toLocaleString()}</Text>
            <Text style={styles.pricingModel}>{getPricingLabel(service.pricingModel)}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={styles.rating}>{service.providerRating || 4.5}</Text>
            <Text style={styles.providerName} numberOfLines={1}>
              {service.providerName || 'Provider'}
            </Text>
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.7}>
            <Text style={styles.bookBtnText}>Book</Text>
            <Ionicons name="arrow-forward" size={12} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: verticalScale(120),
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  iconBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  price: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    fontSize: moderateScale(16),
  },
  pricingModel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  rating: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  providerName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    flex: 1,
    marginLeft: 4,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  bookBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
});
