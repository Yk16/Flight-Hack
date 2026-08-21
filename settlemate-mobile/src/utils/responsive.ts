import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device (like iPhone X/11/12/13/Pro)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// scale: Used for widths, padding, margins, borders
export const scale = (size: number) => (width / guidelineBaseWidth) * size;

// verticalScale: Used for heights
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

// moderateScale: Used for fonts and shapes that we do not want to scale strictly linearly
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const SIZES = {
  windowWidth: width,
  windowHeight: height,
};
