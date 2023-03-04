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
    const fromCommit = getCommitFromRange({ source, destination }, options) || target;
    console.log(fromCommit);
    
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
            console.log(command);
            return execSync(command, options).toString().trim();
        } catch {
            console.log("Failed getting initial commit");
            setFailed('Failed to get initial commit in the given range.');
        }
    }

    console.log("commit range passthrough");

    return '';
}