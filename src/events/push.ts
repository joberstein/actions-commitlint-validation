import { ExecSyncOptions, execSync } from "child_process";
import GitEvent from "./gitEvent";

/**
 * Represents a Git Push event.
 */
export default class Push extends GitEvent {
    #args: PushEventArgs;

    constructor(args: PushEventArgs, options?: ExecSyncOptions) {
        const { target } = args;
        super({ target }, options);
        this.#args = args;
    }

     /**
     * Provide a list of refs containing the ref that was pushed to.
     * @returns A list of refs
     */
     getRefsToCheckout(): string[] {
        const { ref_type, ref } = this.#args;
        
        return ref_type === 'branch' ? [ref] : [];
    }

    /**
     * Skip validation for tag and non-branch pushes.
     * @returns A reason for skipping validation for non-branch pushes.
     */
    getSkipValidationReason(): string | undefined {
        const { ref_type, ref } = this.#args;

        if (ref_type !== 'branch') {
            return `Pushes for ref type: '${ref_type}' are not supported, regarding: '${ref}'.`;
        }
    }
    
    /**
     * Provide a list containing the initial commit on the ref that was pushed to.
     * @returns A list of commit hashes
     */
    getFromCommits(): string[] {
        const { ref } = this.#args;
        const { options } = this;

        const refsToExclude = execSync(`git for-each-ref --format="%(refname)" refs/heads`, options)
            .toString()
            .trim()
            .split('\n')
            .filter(seenRef => ref !== seenRef)
            .join(' ');
        
        const [commit, ] = execSync(`git rev-list --no-merges --not ${refsToExclude} '${ref}'`, options)
            .toString()
            .trim()
            .split('\n')
            .reverse();

        if (!commit) {
            throw new Error(`Failed to get initial commit: '${ref}'.`);
        }

        return [commit];
    }
}