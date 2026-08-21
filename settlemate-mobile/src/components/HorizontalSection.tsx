import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';
import { moderateScale } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

interface HorizontalSectionProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  contentContainerStyle?: ViewStyle;
  emptyMessage?: string;
}

export const HorizontalSection = forwardRef<View, HorizontalSectionProps<any>>(
  (
    {
      title,
      subtitle,
      data,
      renderItem,
      keyExtractor,
      onSeeAll,
      seeAllLabel = 'See All',
      contentContainerStyle,
      emptyMessage = 'No items available.',
    },
    ref
  ) => {
    return (
      <View ref={ref} style={[styles.section, contentContainerStyle]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {onSeeAll ? (
            <TouchableOpacity style={styles.seeAllBtn} onPress={onSeeAll} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>{seeAllLabel}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ) : null}
        </View>

        {data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={32} color={COLORS.border} />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={data}
            keyExtractor={keyExtractor}
            renderItem={({ item, index }) => renderItem(item, index)}
            showsHorizontalScrollIndicator={false}
            snapToInterval={moderateScale(280) + SPACING.md}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.listContent}
            overScrollMode="never"
          />
        )}
      </View>
    );
  }
);

HorizontalSection.displayName = 'HorizontalSection';

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  seeAllText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
    gap: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
