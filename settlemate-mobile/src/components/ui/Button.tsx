import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...props
}) => {
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  const getBackgroundColor = () => {
    if (isOutline || isText) return 'transparent';
    if (disabled && !isLoading) return COLORS.border;
    if (variant === 'secondary') return COLORS.secondary;
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (disabled && !isLoading && !isOutline && !isText) return COLORS.textMuted;
    if (isOutline || isText) {
      return COLORS.primary;
    }
    return COLORS.surface;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: isOutline ? 1 : 0,
          borderColor: isOutline ? getTextColor() : 'transparent',
          paddingVertical: isText ? SPACING.xs : SPACING.md,
          paddingHorizontal: isText ? SPACING.sm : SPACING.lg,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() },
            isText && { fontSize: TYPOGRAPHY.body2.fontSize },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    ...TYPOGRAPHY.h3,
    fontSize: 16,
  },
});
