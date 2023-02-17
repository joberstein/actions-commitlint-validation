import { execSync } from 'child_process';
import validateCommits from './validateCommits';
import preinstall from './preinstall';
import { setFailed } from '@actions/core';

export default async () => {
    const {
        INPUT_BASE_REF: source,
        INPUT_HEAD_REF: destination,
        INPUT_TARGET_REF: target,
        INPUT_EXTRA_CONFIG: extraConfig,
    } = process.env;
    
    try {
        preinstall(extraConfig);
        
        if (source) {
            execSync(`git checkout ${source}`);
        }

        if (destination) {
            execSync(`git checkout ${destination}`);
        }

        await validateCommits({
            source,
            destination,
            target,
        });
    } catch (e) {
        setFailed((e as Error).message);
    }
}