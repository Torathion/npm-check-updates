import { cliOptionsMap } from '../cli-options'
import { Index } from '../types/IndexType'
import { PackageFile } from '../types/PackageFile'
import { isString } from './utils/string'

// dependency section aliases that will be resolved to the full name
const depAliases: Index<keyof PackageFile> = {
  dev: 'devDependencies',
  peer: 'peerDependencies',
  prod: 'dependencies',
  optional: 'optionalDependencies',
}

/** Gets a list of dependency sections based on options.dep. */
export default function resolveDepSections(dep?: string | string[]): (keyof PackageFile)[] {
  // parse dep string and set default
  const depOptions: string[] = dep ? (isString(dep) ? dep.split(',') : dep) : cliOptionsMap.dep.default
  const len = depOptions.length
  const depSections: (keyof PackageFile)[] = new Array(len)

  // Map the dependency section option to a full dependency section name
  for (let i = 0; i < len; i++) {
    const name = depOptions[i]
    depSections[i] = depAliases[name] || name
  }

  return depSections
}
