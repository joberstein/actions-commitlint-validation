import { execSync } from "child_process";
import * as actions from "@actions/core";
import TestUtils from "../test/util";
import preinstall from "../utils/preinstall";
import * as commitlintExec from "../utils/commitlint";
import GitEvent from "./gitEvent";

describe("src/events/gitEvent", () => {
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

    beforeAll(() => {
        options.cwd = createTempDirectory();
        setupTestDirectory(options.cwd);
        preinstall('@joberstein12/commitlint-config', options);
    });

    beforeEach(() => {
        intializeGitRepo();
    });

    afterEach(() => {
        teardownGitRepo();

        expect(actions.info).toHaveBeenCalled();
        expect(actions.info).not.toHaveBeenCalledWith(
            expect.stringContaining('Skipping commit validation')
        );

        expect(commitlint).toHaveBeenCalledTimes(1);
    });

    afterAll(() => {
        teardownTestDirectory(options.cwd as string);
    });
    
    it("Validates a git event with no target ref", async () => {
        const event = new GitEvent({ target: '' }, options);

        await expect(event.validateCommits()).resolves.not.toThrow();

        expect(commitlint).toHaveBeenCalledWith(
            expect.objectContaining({ from: undefined })
        );
    });

    describe("Validating a git event with a target ref", () => {
        it("Successfully validates the target commit", async () => {
            const target = getNthCommitBack(1);
            const event = new GitEvent({ target }, options);

            await expect(event.validateCommits()).resolves.not.toThrow();

            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${target}^` })
            );
        });

        it("Successfully validates commits a merge commit", async () => {
            execSync("git checkout -qb other", options);
            addValidCommit();

            execSync([
                'git checkout master',
                'git merge --no-ff other',
            ].join(" && "), options);

            const event = new GitEvent({
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${event.target}^` })
            );
        });

        it("Fails when the target commit is invalid", async () => {
            addInvalidCommit();

            const event = new GitEvent({
                target: getNthCommitBack(1)
            }, options);

            await expect(event.validateCommits()).rejects.toThrow();

            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${event.target}^` })
            );
        });
    });
});