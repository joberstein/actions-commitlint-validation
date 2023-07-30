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
        const { ref_type, ref_name } = this.#args;
        
        return ref_type === 'branch' ? [ref_name] : [];
    }

    /**
     * Skip validation for tag and non-branch pushes.
     * @returns A reason for skipping validation for non-branch pushes.
     */
    getSkipValidationReason(): string | undefined {
        const { ref_type, ref_name } = this.#args;

        if (ref_type !== 'branch') {
            return `Pushes for ref type: '${ref_type}' are not supported, regarding: '${ref_name}'.`;
        }
    }
    
    /**
     * Provide a list containing the initial commit that is only on the ref that was pushed to.
     * @returns A list of commit hashes
     */
    getFromCommits(): string[] {
        const { ref_name } = this.#args;
        const { options } = this;
        const currentBranchIndicator = '* ';

        const isBranchSpecificRevision = (refName: string, revision: string) => {
            const branchesWithRevision = execSync(`git branch -a --contains '${revision}'`, options)
                .toString()
                .trim()
                .split('\n')
                .map(branch => branch.startsWith(currentBranchIndicator)
                    ? branch.replace(currentBranchIndicator, '')
                    : branch
                )
                .every(branch => new RegExp(`^(remotes\/origin\/)?${refName}$`).test(branch.trim()));
        }
        
        const [commit, ] = execSync(`git rev-list '${ref_name}'`, options)
            .toString()
            .trim()
            .split('\n')
            .filter(revision => isBranchSpecificRevision(ref_name, revision))
            .reverse();

        return [commit].filter(c => c);
    }
}