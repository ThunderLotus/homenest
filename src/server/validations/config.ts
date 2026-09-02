import { z } from 'zod'
import { serviceSchema, tagSchema } from './service'

// Style values stay type-lenient (string | number) so hand-written yaml like
// `gap: 10` or `fontSize: 2rem` never fails validation — parse results are
// discarded anyway, so this schema only guards against gross type mistakes.
const styleLength = z.union([z.string(), z.number()])

const styleTitleSchema = z.object({
  fontSize: styleLength.optional(),
  fontWeight: styleLength.optional(),
})

export const styleCardSchema = z.object({
  borderRadius: styleLength.optional(),
  padding: styleLength.optional(),
  gap: styleLength.optional(),
  width: styleLength.optional(),
  background: styleLength.optional(),
  color: styleLength.optional(),
  fontSize: styleLength.optional(),
  hoverEffect: z.union([z.boolean(), z.string()]).optional(),
  showIcon: z.union([z.boolean(), z.string()]).optional(),
  iconSize: styleLength.optional(),
})

export const styleSchema = z.object({
  title: styleTitleSchema.optional(),
  card: styleCardSchema.optional(),
  // `group` mixes scalar defaults (titleFontSize/gap) with group-name keys
  // holding per-group overrides, so it must stay permissive.
  group: z.record(z.any()).optional(),
})

const configI18nSchema = z.object({
  title: z.record(z.string()).optional(),
  groups: z.record(z.record(z.string())).optional(),
  services: z.record(z.record(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }))).optional(),
})

export const configSchema = z.object({
  title: z.string().optional(),
  version: z.string().optional(),
  lang: z.string().optional(),
  baseLang: z.string().optional(),
  theme: z.string().optional(),
  checkUpdates: z.boolean().optional(),
  tags: z.array(tagSchema).optional(),
  services: z.union([
    z.array(serviceSchema),
    z.record(z.array(serviceSchema)),
  ]),
  // Load path stays fully permissive: `loadConfig` discards the parse result,
  // and an unusual hand-written `style` value must never break rendering.
  style: z.record(z.any()).optional(),
  i18n: configI18nSchema.optional(),
})

export const servicesGroupSchema = z.object({
  title: z.string().nullish().optional(),
  items: z.array(serviceSchema),
})

/**
 * Shape of the config **draft** as sent by the editor (grouped services).
 * Validated before any processing so a malformed body yields 422, not 500.
 */
export const configDraftSchema = z.object({
  title: z.string().optional(),
  lang: z.string().optional(),
  baseLang: z.string().optional(),
  theme: z.string().optional(),
  checkUpdates: z.boolean().optional(),
  tags: z.array(tagSchema).optional(),
  services: z.array(servicesGroupSchema),
  style: styleSchema.optional(),
  i18n: configI18nSchema.optional(),
})
