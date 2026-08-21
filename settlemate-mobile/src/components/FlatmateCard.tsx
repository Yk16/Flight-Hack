import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale, verticalScale } from '../utils/responsive';

const CARD_WIDTH = moderateScale(260);

interface FlatmateCardProps {
  profile: {
    id: number;
    budget: number;
    lifestyle: string[];
    lookingFor: string[];
    occupation?: string;
    bio?: string;
    moveInDate?: string;
    city?: string;
    preferredLocation?: string;
    user: {
      id: number;
      name?: string;
      avatar?: string;
      gender?: string;
      occupation?: string;
    };
  };
  onPress?: () => void;
  onChat?: () => void;
}

export const FlatmateCard = ({ profile, onPress, onChat }: FlatmateCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, bounciness: 4 }).start();
  };

  const formatInr = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const genderIcon = profile.user.gender === 'female' ? 'female' : profile.user.gender === 'male' ? 'male' : 'person';
  const compatibility = Math.floor(70 + Math.random() * 25);

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.card}
      >
        <View style={styles.topSection}>
          <View style={styles.avatarContainer}>
            {profile.user.avatar ? (
              <Image source={{ uri: profile.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={24} color={COLORS.textMuted} />
              </View>
            )}
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>{compatibility}%</Text>
            </View>
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{profile.user.name || 'Flatmate'}</Text>
              <Ionicons name={genderIcon as any} size={14} color={COLORS.primary} />
            </View>
            <Text style={styles.occupation} numberOfLines={1}>
              {profile.occupation || profile.user.occupation || 'Professional'}
            </Text>
            {profile.preferredLocation ? (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.location} numberOfLines={1}>{profile.preferredLocation}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>{formatInr(profile.budget)}/mo</Text>
          </View>
          {profile.moveInDate ? (
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>Move-in</Text>
              <Text style={styles.budgetValue}>
                {new Date(profile.moveInDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          ) : null}
        </View>

        {profile.lifestyle.length > 0 ? (
          <View style={styles.tagsRow}>
            {profile.lifestyle.slice(0, 3).map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.7}>
            <Ionicons name="chatbubble-outline" size={14} color={COLORS.primary} />
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={onPress} activeOpacity={0.7}>
            <Text style={styles.profileBtnText}>View Profile</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.surface} />
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
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: verticalScale(56),
    height: verticalScale(56),
    borderRadius: verticalScale(28),
    backgroundColor: COLORS.border,
  },
  avatarFallback: {
    width: verticalScale(56),
    height: verticalScale(56),
    borderRadius: verticalScale(28),
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compatibilityBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  compatibilityText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: moderateScale(9),
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text,
    flex: 1,
  },
  occupation: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  budgetItem: {
    flex: 1,
  },
  budgetLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  budgetValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.round,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: moderateScale(10),
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  chatBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  profileBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
  profileBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
});
