import { ExecSyncOptions, execSync } from "child_process";
import { info, warning } from "@actions/core";
import commitlint from "../commitlint";

/**
 * Represents a base Git event.
 */
class GitEvent {
    #args: GitEventArgs;
    options?: ExecSyncOptions;
    
    constructor(args: GitEventArgs, options?: ExecSyncOptions) {
        this.options = options;
        this.#args = args;
    }

    get target() {
        return this.#args.target;
    }

    /**
     * Provide a list of refs to checkout for this Git event.
     * @returns A list of refs
     */
    getRefsToCheckout(): string[] {
        return [this.#args.target];
    }

    /**
     * Perform a checkout on all truthy refs returned from {@link GitEvent#getRefsToCheckout}
     */
    performCheckouts(): void {
        this.getRefsToCheckout()
            .filter(ref => ref)
            .forEach(ref => execSync(`git checkout '${ref}'`, this.options).toString());
    }

    /**
     * Provide a list of commits for commitlint to start validation from.
     * @returns A list of commit hashes
     */
    getFromCommits(): string[] {
        return [this.#args.target];
    }

    /**
     * Provide a reason to skip commit validation.
     * @returns A truthy value explaining why validation is skipped, or a falsey value to proceed with commit validation.
     */
    getSkipValidationReason(): string | undefined {
        return;
    }

    /**
     * Executes commit validation for this Git event.
     */
    async validateCommits(): Promise<void> {
        const skipReason = this.getSkipValidationReason();

        if (skipReason) {
            info(`Skipping commit validation: ${skipReason}`);
            return;
        }

        const fromCommits = this.getFromCommits();

        if (!fromCommits.length) {
            warning('Could not find any commits to validate.');
        }

        await Promise.all(
            fromCommits.map(from => commitlint({
                    from: from ? `${from}^` : undefined,
                    cwd: this.options?.cwd?.toString() || undefined,
                }))
        );
    }
}

export default GitEvent;