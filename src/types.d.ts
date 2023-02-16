interface CommitRange {
    source?: string;
    destination?: string;
}

interface CommitlintArgs {
    config?: string;
    verbose?: boolean;
    from?: string;
}

interface BuildCommitlintArgs {
    config?: string;
    source?: string;
    destination?: string;
    target?: string;
}

// Copied from '@commitlint/read'
interface GetCommitMessageOptions {
    cwd?: string;
    from?: string;
    to?: string;
    edit?: boolean | string;
    gitLogArgs?: string;
}