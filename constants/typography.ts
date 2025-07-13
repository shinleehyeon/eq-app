import { StyleSheet } from 'react-native';
import colors from './colors';

export default StyleSheet.create({
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.25,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 0.15,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.15,
  },
  heading4: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});