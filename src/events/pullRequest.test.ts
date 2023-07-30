import { execSync } from "child_process";
import * as actions from "@actions/core";
import TestUtils from "../test/util";
import preinstall from "../preinstall";
import * as commitlintExec from "../commitlint";
import PullRequest from "./pullRequest";

describe("src/events/pullRequest", () => {
    const commitlint = jest.spyOn(commitlintExec, 'default');
    const actionsInfo = jest.spyOn(actions, "info");

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

    beforeAll(() => {
        options.cwd = createTempDirectory();
        setupTestDirectory(options.cwd);
        preinstall('@joberstein12/commitlint-config', options);
    });

    beforeEach(() => {
        intializeGitRepo();

        execSync("git checkout -qb other", options);
        [ ...Array(3).keys() ].forEach(addValidCommit);
    });

    afterEach(() => {
        teardownGitRepo();
        
        expect(actionsInfo).toHaveBeenCalled();
        expect(actionsInfo).not.toHaveBeenCalledWith(
            expect.stringContaining('Skipping commit validation')
        );

        expect(commitlint).toHaveBeenCalledTimes(2);
    });

    afterAll(() => {
        teardownTestDirectory(options.cwd as string);
    });
    
    it("Successfully completes commit validation with a detached head", async () => {
        execSync(`git checkout --detach`, options);
        addValidCommit();
        
        const event = new PullRequest({
            base_ref: 'master',
            head_ref: 'other',
            target: getNthCommitBack(1)
        }, options);

        await expect(event.validateCommits()).resolves.not.toThrow();

        [getNthCommitBack(4), event.target].forEach(from => {
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${from}^` }))
        });
    });

    it("Successfully completes commit validation between two branches", async () => {
        const event = new PullRequest({
            base_ref: 'master',
            head_ref: 'other',
            target: getNthCommitBack(1)
        }, options);

        await expect(event.validateCommits()).resolves.not.toThrow();

        [getNthCommitBack(3), event.target].forEach(from => {
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${from}^` }))
        });
    });

    it("Fails when there's an invalid commit between two branches", async () => {
        addInvalidCommit();
        addValidCommit();

        const event = new PullRequest({
            base_ref: 'master',
            head_ref: 'other',
            target: getNthCommitBack(1),
        }, options);

        await expect(event.validateCommits()).rejects.toThrow();

        expect(commitlint).toHaveBeenCalledWith(
            expect.objectContaining({ from: `${getNthCommitBack(5)}^` })
        );
    });
});