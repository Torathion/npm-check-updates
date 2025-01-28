import { PackageFile } from '../types/PackageFile'
import getPackageJson from './getPackageJson'

/**
 * @param packageName A package name as listed in package.json's dependencies list
 * @param packageJson Optional param to specify a object representation of a package.json file instead of loading from `node_modules`
 * @param pkgFile Specifies the package file location to add to the `node_modules` search paths. Needed in workspaces/deep mode.
 * @returns The package version or null if a version could not be determined
 */
export default async function getPackageVersion(
  packageName: string,
  packageJson?: PackageFile,
  pkgFile?: string,
): Promise<string | undefined> {
  return packageJson ? packageJson.version : (await getPackageJson(packageName, pkgFile))?.version
}
