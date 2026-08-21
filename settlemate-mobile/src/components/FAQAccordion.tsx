import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export const FAQAccordion = ({ items }: FAQAccordionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={item.id} style={[styles.itemContainer, index === 0 && styles.firstItem]}>
          <TouchableOpacity
            style={styles.header}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.question}>{item.question}</Text>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: expandedId === item.id ? '180deg' : '0deg',
                  },
                ],
              }}
            >
              <Ionicons
                name="chevron-down"
                size={20}
                color={COLORS.primary}
              />
            </Animated.View>
          </TouchableOpacity>

          {expandedId === item.id && (
            <View style={styles.contentContainer}>
              <Text style={styles.answer}>{item.answer}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  itemContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  firstItem: {
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  question: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.md,
  },
  contentContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  answer: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
});
