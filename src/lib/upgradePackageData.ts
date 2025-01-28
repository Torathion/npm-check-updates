import { Index } from '../types/IndexType'
import { Options } from '../types/Options'
import { PackageFile } from '../types/PackageFile'
import { VersionSpec } from '../types/VersionSpec'
import resolveDepSections from './resolveDepSections'
import { escapeRegex } from './utils/string'

/**
 * Upgrade the dependency declarations in the package data.
 *
 * @param pkgData The package.json data, as utf8 text
 * @param oldDependencies Old dependencies {package: range}
 * @param newDependencies New dependencies {package: range}
 * @returns The updated package data, as utf8 text
 * @description Side Effect: prompts
 */
export default async function upgradePackageData(
  pkgData: string,
  current: Index<VersionSpec>,
  upgraded: Index<VersionSpec>,
  options: Options,
) {
  // Always include overrides since any upgraded dependencies needed to be upgraded in overrides as well.
  // https://github.com/raineorshine/npm-check-updates/issues/1332
  const depSections = [...resolveDepSections(options.dep), 'overrides']

  // iterate through each dependency section
  const sectionRegExp = new RegExp(`"(${depSections.join('|')})"s*:[^}]*`, 'g')
  let newPkgData = pkgData.replace(sectionRegExp, section => {
    // Some package.json files might have the same dependency in multiple sections, cache them.
    const regexCache: Record<string, RegExp> = {}

    // replace each upgraded dependency in the section
    for (const dep of Object.keys(upgraded)) {
      // Cache the regex to avoid recompilation
      if (!regexCache[dep]) {
        regexCache[dep] = new RegExp(`"${dep}"\\s*:\\s*("|{\\s*"."\\s*:\\s*")(${escapeRegex(current[dep])})"`, 'g')
      }

      section = section.replace(regexCache[dep], (match, child) => {
        return `"${dep}${child ? `": ${child}` : ': '}${upgraded[dep]}"`
      })
    }
    return section
  })

  if (depSections.includes('packageManager')) {
    const pkg = JSON.parse(pkgData) as PackageFile
    if (pkg.packageManager) {
      const name = pkg.packageManager.split('@')[0]
      if (upgraded[name]) {
        newPkgData = newPkgData.replace(
          /"packageManager"\s*:\s*".*?@[^"]*"/,
          `"packageManager": "${name}@${upgraded[name]}"`,
        )
      }
    }
  }

  return newPkgData
}
