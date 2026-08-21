import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { House } from '../types/housing';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CARD_WIDTH = moderateScale(280);

interface PropertyCardHorizontalProps {
  house: House;
  onPress?: () => void;
  onFavorite?: () => void;
}

export const PropertyCardHorizontal = ({ house, onPress, onFavorite }: PropertyCardHorizontalProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
  };

  const typeBadgeLabel = (type?: string) => {
    switch (type) {
      case 'APARTMENT': return 'Apartment';
      case 'INDEPENDENT_HOUSE': return 'House';
      case 'VILLA': return 'Villa';
      case 'ROOM': return 'Room';
      case 'PG': return 'PG';
      case 'STUDIO': return 'Studio';
      default: return type?.replace(/_/g, ' ') || 'Property';
    }
  };

  const imageUrl = house.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image';

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
          {house.type ? (
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeBadgeLabel(house.type)}</Text>
            </View>
          ) : null}
          {house.status === 'AVAILABLE' ? (
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Available</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.favoriteBtn} onPress={onFavorite} activeOpacity={0.7}>
            <Ionicons name="heart-outline" size={18} color={COLORS.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatInr(house.rent)}</Text>
            <Text style={styles.period}>/ month</Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{house.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.location} numberOfLines={1}>
              {[house.addressLine2, house.city].filter(Boolean).join(', ')}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="bed-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{house.bedrooms ?? 1} Bed</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="water-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{house.bathrooms ?? 1} Bath</Text>
            </View>
            {house.area ? (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="resize-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.metaText}>{house.area} sqft</Text>
                </View>
              </>
            ) : null}
          </View>

          <View style={styles.footer}>
            <View style={styles.depositRow}>
              <Text style={styles.footerLabel}>Deposit </Text>
              <Text style={styles.footerValue}>{formatInr(house.deposit)}</Text>
            </View>
            {house.owner?.aadhaarVerified ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={13} color={COLORS.secondary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>
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
    height: verticalScale(160),
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  typeBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: moderateScale(10),
  },
  availableBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
  },
  availableText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: moderateScale(10),
  },
  favoriteBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontSize: moderateScale(20),
  },
  period: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  title: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  location: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginLeft: 4,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  footerValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondary,
    fontWeight: '600',
    fontSize: moderateScale(10),
  },
});
