import { ExecSyncOptions, execSync } from 'child_process';
import commitlint from './commitlint';

/**
 * Validate all the commits between two refs if possible. If not, validate a target
 * commit instead. If the target commit is also absent, validate all commits.
 */
export default async (
    { target }: CommitRange,
    // { target, source, destination }: BuildCommitlintArgs, 
    options?: ExecSyncOptions
) => {
    // const fromCommit = getCommitFromRange({ source, destination }, options) || target;
    const fromCommit = getFromCommit({ target }, options);
    
    await commitlint({ 
        from: fromCommit ? `${fromCommit}^` : undefined, 
        cwd: options?.cwd?.toString() || undefined,
    });
}

/**
 * Get the initial commit from two refs, or an empty string if no commit found.
 */
const getFromCommit = (
    { target }: CommitRange,
    options?: ExecSyncOptions
): string => {
    // if (source && destination) {
        // try {
            // const command = `git rev-list ${source}..${destination} | tail -n 1`;
            const command = `git rev-list ${target} | tail -n 1`;
            return execSync(command, options).toString().trim();
        // } catch {}
    // }

    // return '';
}