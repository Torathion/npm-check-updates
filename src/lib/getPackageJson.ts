import fs from 'fs/promises'
import path from 'path'
import { PackageFile } from '../types/PackageFile'
import exists from './exists'

/** Gets the package.json contents of an installed package. */
export default async function getPackageJson(packageName: string, pkgFile?: string): Promise<PackageFile | undefined> {
  const requirePaths = require.resolve.paths(packageName) || []
  const pkgFileNodeModules = pkgFile ? [path.join(path.dirname(pkgFile), 'node_modules')] : []
  const localNodeModules = [path.join(process.cwd(), 'node_modules')]
  const nodeModulePaths = [...pkgFileNodeModules, ...localNodeModules, ...requirePaths]

  for (const basePath of nodeModulePaths) {
    const packageJsonPath = path.join(basePath, packageName, 'package.json')
    if (await exists(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
        return packageJson
      } catch (e) {}
    }
  }
}
