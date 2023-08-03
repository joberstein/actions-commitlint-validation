import { ExecSyncOptions, execSync } from "child_process";
import GitEvent from "./gitEvent";

/**
 * Represents a Git Pull Request event.
 */
export default class PullRequest extends GitEvent {
    #args: PullRequestEventArgs;

    constructor(args: PullRequestEventArgs, options?: ExecSyncOptions) {
        const { target } = args;
        super({ target }, options);
        this.#args = args;
    }

     /**
     * Provide a list containing the base, head, and target refs for the pull request.
     * @returns A list of refs
     */
     getRefsToCheckout(): string[] {
        const { base_ref, head_ref, target } = this.#args;
        return [ base_ref, head_ref, target ];
    }
    
    /**
     * Provide a list containing the initial commit of the pull request, and the target ref, which may be detached from the pull request head.
     * @returns A list of commit hashes
     */
    getFromCommits(): string[] {
        const { head_ref, base_ref } = this.#args;
        const { options, target } = this;

        const [commit, ] = execSync(`git rev-list --no-merges --first-parent refs/heads/${base_ref}..refs/heads/${head_ref}`, options)
            .toString()
            .trim()
            .split('\n')
            .reverse();

        if (!commit) {
            throw new Error('Failed to get initial commit in the given range.');
        }

        return [commit, target];
    }
}