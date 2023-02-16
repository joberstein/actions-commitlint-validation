import { ExecSyncOptions, execSync } from 'child_process';

/**
 * Pre-install extra dependencies.
 */
export default (packageString?: string, options?: ExecSyncOptions): void => {
  if (!packageString) {
    return;
  }

  const packages = packageString
    .replace(/(\n\r?|\s)+/, ' ')
    .split(/\s+/)
    .map(packageName => packageName.replace(/['"]/g, ''))
    .join(' ');

  if (packages) {
    execSync(`npm install ${packages} --silent`, options);
  }
};