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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={{ position: 'relative' }}>
        <Image 
          source={{ uri: house.images?.[0] || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=80' }} 
          style={styles.image} 
        />
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
        <Text style={styles.price}>{formatInr(house.rent)}<Text style={styles.period}> / month</Text></Text>
        <Text style={styles.title} numberOfLines={1}>{house.title}</Text>
        <Text style={styles.location} numberOfLines={1}>{[house.addressLine1, house.city].filter(Boolean).join(', ') || house.city}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.tag}>{house.type || house.furnishing || 'Unspecified'}</Text>
          <Text style={styles.deposit}>Deposit: {formatInr(house.deposit)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{house.bedrooms ?? 1} bed</Text>
          <Text style={styles.meta}>{house.bathrooms ?? 1} bath</Text>
          {house.status ? <Text style={styles.meta}>{house.status.replaceAll('_', ' ')}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: verticalScale(180),
    backgroundColor: COLORS.border,
  },
  content: {
    padding: SPACING.md,
  },
  price: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  period: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  location: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  meta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  deposit: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
  },
});
