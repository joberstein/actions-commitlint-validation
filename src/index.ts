import { ExecSyncOptions, execSync } from 'child_process';
import commitlint from './commitlint';
import preinstall from './preinstall';
import { setFailed } from '@actions/core';

export default async () => {
    const {
        INPUT_BASE_REF: source,
        INPUT_HEAD_REF: destination,
        INPUT_TARGET_REF: target,
        INPUT_EXTRA_CONFIG: extraConfig,
    } = process.env;
    
    try {
        preinstall(extraConfig);
        
        if (source) {
            execSync(`git checkout ${source}`);
        }

        if (destination) {
            execSync(`git checkout ${destination}`);
        }

        await validateCommits({
            source,
            destination,
            target,
        });
    } catch (e) {
        setFailed((e as Error).message);
    }
}

/**
 * Validate all the commits between two refs if possible. If not, validate a target
 * commit instead. If the target commit is also absent, validate all commits.
 */
export const validateCommits = async (
    { target, source, destination }: BuildCommitlintArgs, 
    options?: ExecSyncOptions
) => {
    const fromCommit = getCommitFromRange({ source, destination }, options) || target;
    
    await commitlint({ 
        from: fromCommit ? `${fromCommit}^` : undefined, 
        cwd: options?.cwd?.toString() || undefined,
    });
}

/**
 * Get the initial commit from two refs, or an empty string if no commit found.
 */
const getCommitFromRange = (
    { source, destination }: CommitRange, 
    options?: ExecSyncOptions
): string => {
    if (source && destination) {
        try {
            const command = `git rev-list ${source}..${destination} | tail -n 1`;
            return execSync(command, options).toString().trim();
        } catch {}
    }

    return '';
}