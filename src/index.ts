import { setFailed } from '@actions/core';
import GitEvent from './events/gitEvent';
import PullRequest from './events/pullRequest';
import Push from './events/push';
import preinstall from './utils/preinstall';

export default async () => {
    const {
        INPUT_BASE_REF: base_ref,
        INPUT_HEAD_REF: head_ref,
        INPUT_REF_NAME: ref_name,
        INPUT_REF_TYPE: ref_type,
        INPUT_TARGET_REF: target = '',
        INPUT_EXTRA_CONFIG: extraConfig,
    } = process.env;

    const event = base_ref && head_ref
        ? new PullRequest({ base_ref, head_ref, target })
        : ref_name
            ? new Push({ ref_name, ref_type, target })
            : new GitEvent({ target });
    
    try {
        event.performCheckouts();
        preinstall(extraConfig);
        await event.validateCommits();
    } catch (e) {
        setFailed((e as Error).message);
    }
}