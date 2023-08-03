import { ExecSyncOptions, execSync } from 'child_process';
import { existsSync } from 'fs';

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
    const command = existsSync('yarn.lock')
      ? `yarn add ${packages} --silent`
      : `npm install ${packages} --silent`;

    execSync(command, options);
  }
};