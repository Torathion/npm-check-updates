import { Index } from '../../types'
import chalk from '../chalk'

/**
 * Indents multiple string lines by a certain amount.
 *
 * @param text - the target multiline text.
 * @param indent - amount of indentation
 * @returns the indented text.
 */
export function indentText(text: string, indent: number): string {
  if (indent <= 0) return text
  return text.replace(/^/gm, ' '.repeat(indent))
}

/**
 * Removes inline code ticks.
 *
 * @param text - target text.
 * @returns the escaped string.
 */
export function uncode(text: string): string {
  return text.replace(/^/g, '')
}

let keywords: Index<string> = {}
let hasKeywords = false

export function getHighlightedKeywords(): Index<string> {
  if (hasKeywords) return keywords
  keywords = {
    keyConst: chalk.cyan('const'),
    keyIf: chalk.red('if'),
    keyReturn: chalk.red('return'),
    keyTrue: chalk.cyan('true'),
    keyFalse: chalk.cyan('false'),
    keyAssign: chalk.red('='),
    keyEq: chalk.red('==='),
    keyAnd: chalk.red('&&'),
    keyLess: chalk.red('<'),
    keyGreater: chalk.red('>'),
    keyArrow: chalk.cyan('<='),
    keyDollar: chalk.cyan('$'),
  }
  hasKeywords = true
  return keywords
}

/**
 * Wraps a given code string in quotes, if we are in a markdown file.
 *
 * @param text - target text.
 * @param markdown - flag indicating whether we are in a markdown file.
 * @returns either the wrapped text or the original text.
 */
export function codeInlineIfMarkdown(text: string, markdown?: boolean): string {
  return markdown ? `\`${text}\`` : text
}

/**
 * Checks if a given string is a normal word.
 *
 * @param text - target string.
 * @returns `true`, if the string is a word, otherwise `false`.
 */
export function isWord(text: string): boolean {
  return /^[a-z]/i.test(text)
}

/**
 * Converts kebab-case-styled strings to a single connected string.
 *
 * @example
 * ```
 * stripKebabCase('Hello-I-Am-An-Example') // 'helloiamanexample'
 * ```
 *
 * @param text - the target string
 * @returns the converted string
 */
export function stripKebabCase(text: string): string {
  return text.replace(/-/g, '').toLowerCase()
}

/**
 * Safely converts a string to a boolean value.
 *
 * @param text - target string.
 * @returns the converted string as a boolean value
 */
export function stringToBoolean(text: string): boolean {
  return !!text && text !== 'false' && text !== '0'
}

/**
 * Safely converts a string to a number.
 *
 * @param text - the target string.
 * @returns the converted number, otherwise `0`.
 */
export function stringToNumber(text: string): number {
  return parseInt(text) ?? 0
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isUrl(text: string): boolean {
  return text.startsWith('http://') || text.startsWith('https://')
}

/**
 * Safely interpolates a string as a template string.
 *
 * @param text - target string
 * @param data - data to map to.
 * @returns the interpolated string
 */
export function interpolate(text: string, data: Index<string | undefined>): string {
  if (!text) return text
  return text.replace(
    /\$\{([^:-]+)(?:(:)?-([^}]*))?\}/g,
    (match, key, name, fallbackOnEmpty, fallback) => data[key] ?? (fallbackOnEmpty ? fallback : ''),
  )
}
