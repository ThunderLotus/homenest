export interface StyleTitle {
  fontSize?: string
  fontWeight?: string | number
}

export interface StyleCard {
  borderRadius?: string
  padding?: string
  gap?: string
  width?: string
  background?: string
  color?: string
  fontSize?: string
  hoverEffect?: boolean
  showIcon?: boolean
  iconSize?: string
}

export interface StyleGroupOverride {
  title?: StyleTitle
  card?: StyleCard
}

export interface StyleGroupDefaults {
  titleFontSize?: string
  gap?: string
}

export type StyleGroup = StyleGroupDefaults & Record<string, StyleGroupOverride>

export interface Style {
  title?: StyleTitle
  card?: StyleCard
  group?: StyleGroup
}
