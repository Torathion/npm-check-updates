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
 * Trims the end of each line of a multiline string.
 *
 * @param text - target multiline string.
 * @returns the trimmed string.
 */
export function trimEndAll(text: string): string {
  return text.replace(/[ \t]+$/gm, '')
}

/**
 * Unwraps back ticks from a string that was marked as code.
 *
 * @param text - target code.
 * @returns the unwrapped code.
 */
export function uncode(text: string): string {
  return text.replace(/^/g, '')
}

let keywords: Index<string> = {}
let hasKeywords = false

/**
 * Lazy loads syntax highlighted keywords for the cli options using the library chalk instance.
 *
 * @returns the syntax highlighted keys.
 */
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
 * Replaces markdown code ticks with html code elements.
 *
 * @param code - target code string
 * @returns the html wrapped code.
 */
export function wrapHtmlCode(code: string): string {
  return code.replace(/\b`/g, '</code>').replace(/`/g, '<code>')
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

/**
 * Guard function identifying an `unknown` value as `string`.
 *
 * @param value - target value.
 * @returns `true`, if the value is a string, otherwise `false`.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * Guard function identifying a string as an url string.
 *
 * @param text - target string.
 * @returns `true`, if the string is a url string, otherwise `false`.
 */
export function isUrl(text: string): boolean {
  return text.startsWith('http://') || text.startsWith('https://')
}

const E404Error = /E400|E404|ENOTFOUND|404 Not Found|400 Bad Request/i
const TimeoutError = /(Response|network) timeout/i

/**
 * Guard function identifying an error message as a error 404 string.
 *
 * @param message - target error message.
 * @returns `true`, if the error message is a error 404 string, otherwise `false`.
 */
export function is404Error(message: string): boolean {
  return E404Error.test(message)
}

/**
 * Guard function identifying an error message as a timeout error.
 *
 * @param message - target error message.
 * @returns `true`, if the error message is a timeout error, otherwise `false`.
 */
export function isTimeoutError(message: string): boolean {
  return TimeoutError.test(message)
}

/**
 * Safely escapes special regex characters for use in `RegExp` constructors.
 *
 * @param s - regex string.
 * @returns the escaped regex string.
 */
export function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
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

const termLineLength = Math.min(process.stdout.columns, 92)

/**
 * Wraps a string by inserting new lines every `n` character. Also wraps on word break.
 *
 * @param text - target text.
 * @param lineLength - maximum character length per line. Default: `92`.
 * @returns the wrapped text.
 */
export function wrap(text: string, lineLength = termLineLength): string {
  if (!text) return text
  const linesIn = text.split('\n')
  const linesOut: string[] = []

  for (const lineIn of linesIn) {
    const lineInLen = lineIn.length
    if (lineIn.length === 0) {
      linesOut.push('')
      continue
    }

    let i = 0
    while (i < lineInLen) {
      const lineFull = lineIn.substring(i, i + lineLength + 1)
      const len = lineFull.length

      // If the line is within the line length, push it as the last line and break
      const lineTrimmed = lineFull.trimEnd()
      if (lineTrimmed.length <= lineLength) {
        linesOut.push(lineTrimmed)
        break
      }

      // Otherwise, wrap before the last word that exceeds the wrap length
      // Do not wrap in the middle of a word
      let wrapOffset = 0
      for (let j = len - 1; j >= 0; j--) {
        if (lineFull[j] === ' ' || lineFull[j] === '-') {
          wrapOffset = len - j - 1
          break
        }
      }

      const line = lineFull.substring(0, len - wrapOffset)

      // Make sure we do not end up in an infinite loop
      if (line.length === 0) break

      linesOut.push(line.trimEnd())
      i += line.length
    }
  }

  return linesOut.join('\n').trim()
}
