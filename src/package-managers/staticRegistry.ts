import memoize from 'fast-memoize'
import fs from 'fs/promises'
import programError from '../lib/programError'
import { isUrl } from '../lib/utils/string'
import { GetVersion } from '../types/GetVersion'
import { Options } from '../types/Options'
import { StaticRegistry } from '../types/StaticRegistry'
import { Version } from '../types/Version'

/**
 * Returns a registry object given a valid file path or url.
 *
 * @param path
 * @returns a registry object
 */
const readStaticRegistry = async (options: Options): Promise<StaticRegistry> => {
  const path = options.registry!
  let content: string

  // url
  if (isUrl(path)) {
    content = await (await fetch(path)).text()
  }
  // local path
  else {
    try {
      content = await fs.readFile(path, 'utf8')
    } catch (err) {
      programError(options, `\nThe specified static registry file does not exist: ${options.registry}`)
    }
  }

  return JSON.parse(content)
}

const registryMemoized = memoize(readStaticRegistry)

/**
 * Fetches the version in static registry.
 *
 * @param packageName
 * @param currentVersion
 * @param options
 * @returns A promise that fulfills to string value or null
 */
export const latest: GetVersion = async (packageName: string, currentVersion: Version, options?: Options) => {
  const registry: StaticRegistry = await registryMemoized(options ?? {})
  return { version: registry[packageName] || null }
}
