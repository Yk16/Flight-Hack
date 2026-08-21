import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating?: number;
}

export const Testimonial = ({
  name,
  role,
  content,
  rating = 5,
}: TestimonialProps) => {
  return (
    <View style={styles.container}>
      {/* Stars */}
      <View style={styles.ratingContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFC107"
            style={styles.star}
          />
        ))}
      </View>

      {/* Quote */}
      <Text style={styles.content}>{content}</Text>

      {/* Author */}
      <View style={styles.footer}>
        <View style={styles.avatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  star: {
    marginRight: SPACING.xs,
  },
  content: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  authorInfo: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text,
    fontWeight: '600',
  },
  role: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
});
