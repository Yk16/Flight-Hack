import { moderateScale } from '../utils/responsive';

export const COLORS = {
  primary: '#4F46E5', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  secondary: '#10B981', // Emerald
  
  background: '#F9FAFB', // Light gray background
  surface: '#FFFFFF', // Cards, panels, etc
  
  text: '#111827', // Almost black
  textMuted: '#6B7280', // Gray
  
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

export const SPACING = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(16),
  lg: moderateScale(24),
  xl: moderateScale(32),
  xxl: moderateScale(48),
};

export const BORDER_RADIUS = {
  sm: moderateScale(4),
  md: moderateScale(8),
  lg: moderateScale(12),
  xl: moderateScale(16),
  round: 9999,
};

export const TYPOGRAPHY = {
  h1: { fontSize: moderateScale(32), fontWeight: '700' as const },
  h2: { fontSize: moderateScale(24), fontWeight: '600' as const },
  h3: { fontSize: moderateScale(20), fontWeight: '600' as const },
  h4: { fontSize: moderateScale(16), fontWeight: '600' as const },
  body1: { fontSize: moderateScale(16), fontWeight: '400' as const },
  body2: { fontSize: moderateScale(14), fontWeight: '400' as const },
  caption: { fontSize: moderateScale(12), fontWeight: '400' as const },
};
