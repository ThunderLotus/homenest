import * as adventurer from '@dicebear/adventurer'
import * as adventurerNeutral from '@dicebear/adventurer-neutral'
import * as avataaars from '@dicebear/avataaars'
import * as avataaarsNeutral from '@dicebear/avataaars-neutral'
import * as bigEars from '@dicebear/big-ears'
import * as bigEarsNeutral from '@dicebear/big-ears-neutral'
import * as bigSmile from '@dicebear/big-smile'
import * as bottts from '@dicebear/bottts'
import * as botttsNeutral from '@dicebear/bottts-neutral'
import { createAvatar } from '@dicebear/core'
import * as croodles from '@dicebear/croodles'
import * as croodlesNeutral from '@dicebear/croodles-neutral'
import * as funEmoji from '@dicebear/fun-emoji'
import * as identicon from '@dicebear/identicon'
import * as initials from '@dicebear/initials'
import * as lorelei from '@dicebear/lorelei'
import * as loreleiNeutral from '@dicebear/lorelei-neutral'
import * as micah from '@dicebear/micah'
import * as miniavs from '@dicebear/miniavs'
import * as notionists from '@dicebear/notionists'
import * as notionistsNeutral from '@dicebear/notionists-neutral'
import * as openPeeps from '@dicebear/open-peeps'
import * as personas from '@dicebear/personas'
import * as pixelArt from '@dicebear/pixel-art'
import * as pixelArtNeutral from '@dicebear/pixel-art-neutral'
import * as rings from '@dicebear/rings'
import * as shapes from '@dicebear/shapes'
import * as thumbs from '@dicebear/thumbs'

/**
 * Deterministic SVG avatar rendering (DiceBear, server-side).
 *
 * Core + styles are MIT / CC0 / free-commercial-use, so there are no
 * licensing concerns and avatars never leave the host. A seed produces the
 * same avatar every time, so generated avatars need no image storage.
 */
const STYLES = {
  adventurer,
  'adventurer-neutral': adventurerNeutral,
  avataaars,
  'avataaars-neutral': avataaarsNeutral,
  'big-ears': bigEars,
  'big-ears-neutral': bigEarsNeutral,
  'big-smile': bigSmile,
  bottts,
  'bottts-neutral': botttsNeutral,
  croodles,
  'croodles-neutral': croodlesNeutral,
  'fun-emoji': funEmoji,
  identicon,
  initials,
  lorelei,
  'lorelei-neutral': loreleiNeutral,
  micah,
  miniavs,
  notionists,
  'notionists-neutral': notionistsNeutral,
  'open-peeps': openPeeps,
  personas,
  'pixel-art': pixelArt,
  'pixel-art-neutral': pixelArtNeutral,
  rings,
  shapes,
  thumbs,
} as const

export type AvatarStyle = keyof typeof STYLES

/** Public style list for the client-side picker (keys of STYLES). */
export const AVATAR_STYLES = Object.keys(STYLES) as AvatarStyle[]

export function isAvatarStyle(value: string): value is AvatarStyle {
  return value in STYLES
}

export interface AvatarRenderOptions {
  backgroundColor?: string
}

export function renderAvatarSvg(style: string, seed: string, options?: AvatarRenderOptions): string {
  const entry = STYLES[style as AvatarStyle]

  if (!entry) {
    throw new Error(`Unknown avatar style: ${style}`)
  }

  const opts: Record<string, unknown> = { seed }
  if (options?.backgroundColor) {
    opts.backgroundColor = [options.backgroundColor]
  }

  return createAvatar(entry as any, opts).toString()
}
