interface CommitRange {
    source: string;
    destination: string;
}

interface CommitlintArgs {
    config?: string;
    verbose?: boolean;
    from?: string;
}

interface BuildCommitlintArgs {
    event: string;
    config: string;
    source: string;
    destination: string;
    target: string;
}