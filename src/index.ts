import { execSync } from 'child_process';

const commitlint = (args: CommitlintArgs) => {
    const argString = Object.entries(args)
        .filter(([, argVal]) => !['', null, undefined, false].includes(argVal))
        .map(([argName, argVal]) => `--${argName}` + (typeof argName === 'boolean' ? '' : `=${argVal}`))
        .join(' ');

    execSync(`npm run commitlint ${argString}`);
}

const getCommitFromRange = ({ source, destination }: CommitRange): string =>
    execSync(`git rev-list ${source}..${destination} | tail -l`)
        .toString()
        .trim();

const buildCommitlintArgs = ({ 
    event, 
    config, 
    source, 
    destination, 
    target 
}: BuildCommitlintArgs): CommitlintArgs => {
    const commitlintArgs: CommitlintArgs = {
        verbose: true,
        config,
    }

    const fromCommit = event.startsWith('pull_request')
        ? getCommitFromRange({ source, destination })
        : target;

    return { ...commitlintArgs, from: `${fromCommit}^` };
}

export default () => {
    const { 
        INPUT_BASE_REF: source = '',
        INPUT_HEAD_REF: destination = '',
        INPUT_TARGET_REF: target = '',
        INPUT_EVENT: event = '',
        INPUT_CONFIG_PATH: config = '',
    } = process.env;

    const commitlintArgs = buildCommitlintArgs({ 
        event, 
        source, 
        destination, 
        target, 
        config, 
    });

    commitlint(commitlintArgs);
}