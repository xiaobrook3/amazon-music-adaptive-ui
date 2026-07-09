import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps, StyleSheet } from 'react-native'
import { FONT_FAMILY, FONT_FAMILY_DISPLAY } from '../theme'

const WEIGHT_TO_FAMILY: Record<string, string> = {
  '100': FONT_FAMILY.light,
  '200': FONT_FAMILY.light,
  '300': FONT_FAMILY.light,
  '400': FONT_FAMILY.regular,
  '500': FONT_FAMILY.medium,
  '600': FONT_FAMILY.semibold,
  '700': FONT_FAMILY.bold,
  '800': FONT_FAMILY.heavy,
  '900': FONT_FAMILY.heavy,
  normal: FONT_FAMILY.regular,
  bold: FONT_FAMILY.bold,
}

const DISPLAY_WEIGHT_TO_FAMILY: Record<string, string> = {
  '400': FONT_FAMILY_DISPLAY.regular,
  '500': FONT_FAMILY_DISPLAY.regular,
  '600': FONT_FAMILY_DISPLAY.regular,
  '700': FONT_FAMILY_DISPLAY.bold,
  '800': FONT_FAMILY_DISPLAY.bold,
  '900': FONT_FAMILY_DISPLAY.bold,
  normal: FONT_FAMILY_DISPLAY.regular,
  bold: FONT_FAMILY_DISPLAY.bold,
}

function resolveFontFamily(style: TextProps['style'], variant: 'body' | 'display'): string {
  const flat = StyleSheet.flatten(style)
  if (flat?.fontFamily) return flat.fontFamily
  const weight = flat?.fontWeight?.toString() ?? '400'
  const map = variant === 'display' ? DISPLAY_WEIGHT_TO_FAMILY : WEIGHT_TO_FAMILY
  return map[weight] ?? (variant === 'display' ? FONT_FAMILY_DISPLAY.regular : FONT_FAMILY.regular)
}

type AppTextProps = TextProps & { variant?: 'body' | 'display' }
type AppTextInputProps = TextInputProps & { variant?: 'body' | 'display' }

export function Text({ style, variant = 'body', ...props }: AppTextProps) {
  return <RNText style={[{ fontFamily: resolveFontFamily(style, variant) }, style]} {...props} />
}

export function TextInput({ style, variant = 'body', ...props }: AppTextInputProps) {
  return <RNTextInput style={[{ fontFamily: resolveFontFamily(style, variant) }, style]} {...props} />
}
