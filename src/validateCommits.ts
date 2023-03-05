import { ExecSyncOptions, execSync } from 'child_process';
import commitlint from './commitlint';
import { setFailed } from '@actions/core';

/**
 * Validate all the commits between two refs if possible. If not, validate a target
 * commit instead. If the target commit is also absent, validate all commits.
 */
export default async (
    { target, source, destination }: BuildCommitlintArgs, 
    options?: ExecSyncOptions
) => {
    const fromCommit = source && destination
        ? getCommitFromRange({ source, destination }, options) 
        : target;
    
    await commitlint({ 
        from: fromCommit ? `${fromCommit}^` : undefined, 
        cwd: options?.cwd?.toString() || undefined,
    });
}

/**
 * Get the initial commit from two refs.
 * @throws if there was an error getting the commit.
 */
const getCommitFromRange = (
    { source, destination }: CommitRange, 
    options?: ExecSyncOptions
): string => {
    const result = execSync(`git rev-list ${source}..${destination} | tail -n 1`, options)
        .toString()
        .trim();

    if (!result) {
        throw new Error('Failed to get initial commit in the given range.');
    }

    return result;
}