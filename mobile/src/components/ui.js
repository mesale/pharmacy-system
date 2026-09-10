import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { radii, fonts, font } from '../theme';
import { useTheme, useThemedStyles } from '../theme-context';

// Mirrors the web app's shadcn/ui primitives (Card, Button, Badge, Input)
// so mobile screens read the same as their Inertia counterparts.
// All palette-dependent styling is rebuilt from the active theme.

export function Card({ style, children, ...rest }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]} {...rest}>{children}</View>;
}

export function CardHeader({ style, children }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.cardHeader, style]}>{children}</View>;
}

export function CardTitle({ style, children }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[styles.cardTitle, style]}>{children}</Text>;
}

export function CardDescription({ style, children }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[styles.cardDescription, style]}>{children}</Text>;
}

export function CardContent({ style, children }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.cardContent, style]}>{children}</View>;
}

// variant: default | outline | secondary | ghost | destructive
// size: default | sm | lg | icon
export function Button({
  variant = 'default',
  size = 'default',
  onPress,
  disabled,
  style,
  textStyle,
  children,
}) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const variants = makeButtonVariants(colors);
  const v = variants[variant] || variants.default;
  const s = buttonSizes[size] || buttonSizes.default;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[styles.btnBase, v.container, s.container, disabled && { opacity: 0.5 }, style]}
    >
      {typeof children === 'function'
        ? children({ color: v.text.color, size: s.iconSize })
        : (
          <Text style={[styles.btnText, v.text, s.text, textStyle]}>{children}</Text>
        )}
    </TouchableOpacity>
  );
}

// variant: default | secondary | destructive | outline | success | warning
export function Badge({ variant = 'default', style, textStyle, children }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const variants = makeBadgeVariants(colors);
  const v = variants[variant] || variants.default;
  return (
    <View style={[styles.badge, v.container, style]}>
      <Text style={[styles.badgeText, v.text, textStyle]}>{children}</Text>
    </View>
  );
}

export const Input = React.forwardRef(function Input({ style, ...rest }, ref) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.textFaint}
      style={[styles.input, style]}
      {...rest}
    />
  );
});

const makeButtonVariants = (c) => ({
  default: { container: { backgroundColor: c.primary }, text: { color: c.primaryForeground } },
  outline: { container: { backgroundColor: c.surfaceBase, borderWidth: 1, borderColor: c.border }, text: { color: c.textPrimary } },
  secondary: { container: { backgroundColor: c.surfaceContainer }, text: { color: c.textPrimary } },
  ghost: { container: { backgroundColor: 'transparent' }, text: { color: c.textPrimary } },
  destructive: { container: { backgroundColor: c.destructive }, text: { color: '#ffffff' } },
});

const buttonSizes = {
  default: { container: { height: 40, paddingHorizontal: 16 }, text: { fontSize: 14 }, iconSize: 16 },
  sm: { container: { height: 32, paddingHorizontal: 12 }, text: { fontSize: 13 }, iconSize: 14 },
  lg: { container: { height: 56, paddingHorizontal: 20 }, text: { fontSize: 18 }, iconSize: 20 },
  icon: { container: { height: 32, width: 32, paddingHorizontal: 0 }, text: { fontSize: 14 }, iconSize: 16 },
};

const makeBadgeVariants = (c) => ({
  default: { container: { backgroundColor: c.primary }, text: { color: c.primaryForeground } },
  secondary: { container: { backgroundColor: c.surfaceContainer }, text: { color: c.textPrimary } },
  destructive: { container: { backgroundColor: c.statusCriticalBg }, text: { color: c.statusCriticalText } },
  outline: { container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border }, text: { color: c.textPrimary } },
  success: { container: { backgroundColor: c.primarySoft }, text: { color: c.statusSuccessText } },
  warning: { container: { backgroundColor: c.statusWarningBg }, text: { color: c.statusWarningText } },
});

const makeStyles = (c) => StyleSheet.create({
  card: {
    backgroundColor: c.surfaceBase,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: c.border,
  },
  cardHeader: { padding: 24, paddingBottom: 8, gap: 6 },
  cardTitle: { ...fonts.headlineSm, color: c.textPrimary },
  cardDescription: { ...fonts.bodySm, color: c.textMuted },
  cardContent: { padding: 24, paddingTop: 0 },
  btnBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    gap: 8,
  },
  btnText: { fontFamily: font.medium, fontWeight: '500' },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  badgeText: { fontFamily: font.semibold, fontSize: 12, fontWeight: '600' },
  input: {
    backgroundColor: c.surfaceBase,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: radii.md,
    color: c.textPrimary,
    height: 40,
    paddingHorizontal: 12,
    fontFamily: font.regular,
    fontSize: 14,
  },
});
