import flow from 'lodash/flow'
import { parseRange } from 'semver-utils'
import { Index } from '../types/IndexType'
import { Options } from '../types/Options'
import { Version } from '../types/Version'
import { VersionSpec } from '../types/VersionSpec'
import filterObject from './filterObject'
import getPreferredWildcard from './getPreferredWildcard'
import isUpgradeable from './isUpgradeable'
import { pickBy } from './pick'
import { isString } from './utils/string'
import * as versionUtil from './version-util'

interface UpgradeSpec {
  current: VersionSpec
  currentParsed: VersionSpec | null
  latest: Version
  latestParsed: Version | null
}

/**
 * Upgrade a dependencies collection based on latest available versions. Supports npm aliases.
 *
 * @param currentDependencies current dependencies collection object
 * @param latestVersions latest available versions collection object
 * @param [options={}]
 * @returns upgraded dependency collection object
 */
function upgradeDependencies(
  currentDependencies: Index<VersionSpec | null>,
  latestVersions: Index<Version>,
  options: Options = {},
): Index<VersionSpec> {
  const targetOption = options.target || 'latest'

  // filter out dependencies with empty values
  currentDependencies = filterObject(currentDependencies, (key, value) => !!value)

  // get the preferred wildcard and bind it to upgradeDependencyDeclaration
  const wildcard = getPreferredWildcard(currentDependencies) ?? versionUtil.DEFAULT_WILDCARD

  /** Upgrades a single dependency. */
  const upgradeDep = (current: VersionSpec, latest: Version) =>
    versionUtil.upgradeDependencyDeclaration(current, latest, {
      wildcard,
      removeRange: options.removeRange,
    })

  return flow([
    // only include packages for which a latest version was fetched
    (deps: Index<VersionSpec>): Index<VersionSpec> =>
      pickBy(deps, (current, packageName) => packageName in latestVersions),
    // unpack npm alias and git urls
    (deps: Index<VersionSpec>): Index<UpgradeSpec> =>
      Object.entries(deps).reduce<Index<UpgradeSpec>>((acc, [packageName, current]) => {
        const latest = latestVersions[packageName]
        let currentParsed = null
        let latestParsed = null

        // parse npm alias
        if (versionUtil.isNpmAlias(current)) {
          currentParsed = versionUtil.parseNpmAlias(current)![1]
        }
        if (versionUtil.isNpmAlias(latest)) {
          latestParsed = versionUtil.parseNpmAlias(latest)![1]
        }

        // "branch" is also used for tags (refers to everything after the hash character)
        if (versionUtil.isGithubUrl(current)) {
          const currentTag = versionUtil.getGithubUrlTag(current)!
          const [currentSemver] = parseRange(currentTag)
          currentParsed = versionUtil.stringify(currentSemver)
        }

        if (versionUtil.isGithubUrl(latest)) {
          const latestTag = versionUtil.getGithubUrlTag(latest)!
          const [latestSemver] = parseRange(latestTag)
          latestParsed = versionUtil.stringify(latestSemver)
        }

        acc[packageName] = { current, currentParsed, latest, latestParsed }
        return acc
      }, {}),
    // pick the packages that are upgradeable
    (deps: Index<UpgradeSpec>): Index<UpgradeSpec> =>
      pickBy(deps, ({ current, currentParsed, latest, latestParsed }: UpgradeSpec, name) => {
        // allow downgrades from prereleases when explicit tag is given
        const downgrade: boolean =
          versionUtil.isPre(current) &&
          (isString(targetOption) ? targetOption : targetOption(name, parseRange(current)))[0] === '@'
        return isUpgradeable(currentParsed ?? current, latestParsed ?? latest, { downgrade })
      }),
    // pack embedded versions: npm aliases and git urls
    (deps: Index<UpgradeSpec>): Index<Version | null> =>
      Object.entries(deps).reduce<Index<Version | null>>(
        (acc, [packageName, { current, currentParsed, latest, latestParsed }]) => {
          const upgraded = upgradeDep(currentParsed ?? current, latestParsed ?? latest)

          acc[packageName] = versionUtil.isNpmAlias(current)
            ? versionUtil.upgradeNpmAlias(current, upgraded)
            : versionUtil.isGithubUrl(current)
              ? versionUtil.upgradeGithubUrl(current, upgraded)
              : upgraded
          return acc
        },
        {},
      ),
  ])(currentDependencies)
}

export default upgradeDependencies
