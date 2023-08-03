import { execSync } from "child_process";
import * as actions from "@actions/core";
import TestUtils from "./test/util";
import * as commitlintExec from "./utils/commitlint";
import run from "./index";

jest.setTimeout(20_000);

describe("src/index", () => {
    let tmpDir: string;
    
    const commitlint = jest.spyOn(commitlintExec, 'default');

    const {
        createTempDirectory,
        intializeGitRepo,
        getNthCommitBack,
        teardownGitRepo,
        teardownTestDirectory,
        addInvalidCommit,
        addValidCommit,
        setupTestDirectory,
        options,
    } = new TestUtils();

    beforeEach(() => {
        tmpDir = createTempDirectory();
        setupTestDirectory(tmpDir);
        intializeGitRepo();

        process.env.INPUT_EXTRA_CONFIG = "\"@joberstein12/commitlint-config\"";
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);
    });

    afterEach(() => {
        teardownGitRepo();
        teardownTestDirectory(tmpDir);
        
        delete process.env.INPUT_TARGET_REF;
        delete process.env.INPUT_BASE_REF;
        delete process.env.INPUT_HEAD_REF;
        delete process.env.INPUT_EXTRA_CONFIG;
        delete process.env.INPUT_REF_NAME;
        delete process.env.INPUT_REF_TYPE;

        expect(actions.info).toHaveBeenCalled();
    });

    it("Successfully validates a target commit", async () => {
        await run();

        expect(actions.setFailed).not.toHaveBeenCalled();
        expect(commitlint).toHaveBeenCalledTimes(1);
        expect(commitlint).toHaveBeenCalledWith({ from: `${process.env.INPUT_TARGET_REF}^` });
    });

    it("Successfully validates commits for a branch push", async () => {
        const branch = '#3';

        execSync(`git checkout -qb '${branch}'`, options);
        [ ...Array(3).keys() ].forEach(addValidCommit);

        process.env.INPUT_TARGET_REF = getNthCommitBack(1);
        process.env.INPUT_REF_NAME = branch;
        process.env.INPUT_REF_TYPE = 'branch';

        await run();

        expect(actions.setFailed).not.toHaveBeenCalled();
        expect(commitlint).toHaveBeenCalledTimes(1);
        expect(commitlint).toHaveBeenCalledWith({ from: `${getNthCommitBack(3)}^` });
    });

    it("Successfully validates commits for a pull request", async () => {
        process.env.INPUT_BASE_REF = "master";
        process.env.INPUT_HEAD_REF = '#3';

        execSync(`git checkout -qb '${process.env.INPUT_HEAD_REF}'`, options);
        [ ...Array(3).keys() ].forEach(addValidCommit);
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);

        await run();

        expect(actions.setFailed).not.toHaveBeenCalled();
        expect(commitlint).toHaveBeenCalledTimes(2);

        [getNthCommitBack(3), process.env.INPUT_TARGET_REF]
            .forEach(commit =>
                expect(commitlint).toHaveBeenCalledWith({ from: `${commit}^` })
            );
    });

    it("Successfully validates commits for a pull request with a detached head", async () => {
        process.env.INPUT_BASE_REF = "master";
        process.env.INPUT_HEAD_REF = '#3';

        execSync(`git checkout -qb '${process.env.INPUT_HEAD_REF}'`, options);
        [ ...Array(3).keys() ].forEach(addValidCommit);
        const fromCommit = getNthCommitBack(3);

        execSync(`git checkout --detach`, options);
        addValidCommit();

        process.env.INPUT_TARGET_REF = getNthCommitBack(1);

        await run();
        
        expect(actions.setFailed).not.toHaveBeenCalled();
        expect(commitlint).toHaveBeenCalledTimes(2);

        [fromCommit, process.env.INPUT_TARGET_REF]
            .forEach(commit =>
                expect(commitlint).toHaveBeenCalledWith({ from: `${commit}^` })
            );
    });

    it("Skips commit validation for a tag push", async () => {
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);
        process.env.INPUT_REF_NAME = 'someTag';
        process.env.INPUT_REF_TYPE = 'tag';

        await run();

        expect(actions.setFailed).not.toHaveBeenCalled();
        expect(commitlint).not.toHaveBeenCalled();
    });

    it("Fails validation for an invalid commit", async () => {
        addInvalidCommit();
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);

        await run();

        expect(commitlint).toHaveBeenCalledTimes(1);
        expect(actions.setFailed).toHaveBeenCalledWith('Commit validation failed.');
    });
});