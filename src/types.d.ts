interface PushEventArgs extends GitEventArgs {
    ref_name: string;
    ref_type?: string;
}

interface PullRequestEventArgs extends GitEventArgs {
    base_ref: string;
    head_ref: string;
}

interface GitEventArgs {
    target: string;
}

// Copied from '@commitlint/read'
interface GetCommitMessageOptions {
    cwd?: string;
    from?: string;
    to?: string;
    edit?: boolean | string;
    gitLogArgs?: string;
}