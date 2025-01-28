import hostedGitInfo from 'hosted-git-info'
import { URL } from 'url'
import { PackageFile } from '../types/PackageFile'
import getPackageJson from './getPackageJson'
import { isString } from './utils/string'

/**
 * @param packageName A package name as listed in package.json's dependencies list
 * @param packageJson Optional param to specify a object representation of a package.json file instead of loading from node_modules
 * @returns A valid url to the root of the package's source or null if a url could not be determined
 */
export default async function getRepoUrl(
  packageName: string,
  packageJson?: PackageFile,
  pkgFile?: string,
): Promise<string | undefined> {
  const repositoryMetadata = !packageJson
    ? (await getPackageJson(packageName, pkgFile))?.repository
    : packageJson.repository

  if (!repositoryMetadata) return

  let gitURL
  let directory = ''

  // It may be a string instead of an object
  if (isString(repositoryMetadata)) {
    gitURL = repositoryMetadata
    try {
      // It may already be a valid Repo URL
      const url = new URL(gitURL)
      // Some packages put a full URL in this field although it's not spec compliant. Let's detect that and use it if present
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        return gitURL
      }
    } catch (e) {}
  } else if (isString(repositoryMetadata.url)) {
    gitURL = repositoryMetadata.url
    if (isString(repositoryMetadata.directory)) {
      directory = repositoryMetadata.directory
    }
  }

  if (isString(gitURL) && isString(directory)) {
    const hostedGitURL = hostedGitInfo.fromUrl(gitURL)?.browse(directory)
    if (hostedGitURL !== undefined) {
      // Remove the default branch path (/tree/HEAD) from a git url
      return hostedGitURL.replace(/\/$/, '').replace(/\/tree\/HEAD$/, '')
    }
    return gitURL
  }
}
