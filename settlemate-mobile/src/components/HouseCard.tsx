import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { House } from '../types/housing';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { verticalScale } from '../utils/responsive';

const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

interface HouseCardProps {
  house: House;
  onPress?: () => void;
}

export const HouseCard = ({ house, onPress }: HouseCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image 
        source={{ uri: house.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image+Available' }} 
        style={styles.image} 
      />
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
  }
});
