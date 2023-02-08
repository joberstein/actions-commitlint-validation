import { execSync } from 'child_process';

/**
 * Pre-install extra dependencies
 */
const installPackages = (packageString?: string): void => {
  if (!packageString) {
    return;
  }

  const packages = packageString
    .split('\n\r')
    .map(packageName => packageName.replace(/['"]/g, ''))
    .join(' ');

  if (packages) {
    execSync(`npm install ${packages} --silent`);
  }
};

export default (): void => {
  const {
    INPUT_COMMITLINT_VERSION: commitlintVersion = 'latest',
    INPUT_EXTRA_CONFIG: extraConfig = '',
    INPUT_EVENT: event = '',
    INPUT_BASE_REF: source = '',
    INPUT_HEAD_REF: destination = '',
  } = process.env;

  installPackages(`commitlint@${commitlintVersion}`);
  installPackages(extraConfig);
  
  if (event.startsWith('pull_request')) {
    execSync(`git checkout ${source}`);
    execSync(`git checkout ${destination}`);
  }
};