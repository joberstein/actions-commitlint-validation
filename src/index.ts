import { setFailed } from '@actions/core';
import GitEvent from './events/gitEvent';
import PullRequest from './events/pullRequest';
import Push from './events/push';
import preinstall from './preinstall';

export default async () => {
    const {
        INPUT_BASE_REF: base_ref,
        INPUT_HEAD_REF: head_ref,
        INPUT_REF: ref,
        INPUT_REF_TYPE: ref_type,
        INPUT_TARGET_REF: target = '',
        INPUT_EXTRA_CONFIG: extraConfig,
    } = process.env;

    const event = base_ref && head_ref
        ? new PullRequest({ base_ref, head_ref, target })
        : ref
            ? new Push({ ref, ref_type, target })
            : new GitEvent({ target });
    
    try {
        event.performCheckouts();
        preinstall(extraConfig);
        await event.validateCommits();
    } catch (e) {
        setFailed((e as Error).message);
    }
}