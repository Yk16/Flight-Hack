import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { House } from '../types/housing';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { verticalScale, moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '../store/favoritesStore';

const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

interface HouseCardProps {
  house: House;
  onPress?: () => void;
  onFavorite?: () => void;
}

export const HouseCard = ({ house, onPress, onFavorite }: HouseCardProps) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const liked = isFavorite(house.id);

  const handleHeartPress = () => {
    if (onFavorite) {
      onFavorite();
    } else {
      toggleFavorite(house);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={{ position: 'relative' }}>
        <Image 
          source={{ uri: house.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80' }} 
          style={styles.image} 
        />
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{house.type?.replace(/_/g, ' ') || 'House'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.favoriteBtn, liked && { backgroundColor: 'rgba(239, 68, 68, 0.95)' }]}
          onPress={(e) => {
            e?.stopPropagation?.();
            handleHeartPress();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatInr(house.rent)}<Text style={styles.period}>/mo</Text></Text>
          {house.status === 'AVAILABLE' ? (
            <View style={styles.availBadge}>
              <View style={styles.availDot} />
              <Text style={styles.availText}>Available</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={1}>{house.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{[house.addressLine1, house.city].filter(Boolean).join(', ') || house.city}</Text>
        </View>
        
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <Ionicons name="bed-outline" size={13} color={COLORS.primary} />
            <Text style={styles.metaText}>{house.bedrooms ?? 1} Bed</Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="water-outline" size={13} color={COLORS.primary} />
            <Text style={styles.metaText}>{house.bathrooms ?? 1} Bath</Text>
          </View>
          {house.furnishing ? (
            <View style={styles.meta}>
              <Ionicons name="cube-outline" size={13} color={COLORS.primary} />
              <Text style={styles.metaText}>{house.furnishing.replace(/_/g, ' ')}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.deposit}>Deposit: <Text style={styles.depositBold}>{formatInr(house.deposit)}</Text></Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: verticalScale(185),
    backgroundColor: '#F1F5F9',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 20,
  },
  period: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '500',
    fontSize: 13,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  availText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  title: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
    fontSize: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  location: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 2,
  },
  deposit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  depositBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
});
