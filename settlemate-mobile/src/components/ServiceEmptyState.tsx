import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

interface ServiceEmptyStateProps {
  title?: string;
  description?: string;
  // Use the exact icon name type for MaterialCommunityIcons to satisfy TS
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onRetry?: () => void;
}

export const ServiceEmptyState = ({
  title = 'No Services Found',
  description = 'Try adjusting your filters or search criteria',
  icon = 'folder-open-outline',
  onRetry,
}: ServiceEmptyStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={64}
          color={COLORS.textMuted}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={COLORS.surface}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  retryText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.surface,
    fontWeight: '600',
  },
});
