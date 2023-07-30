import { execSync } from "child_process";
import * as actions from "@actions/core";
import TestUtils from "../test/util";
import preinstall from "../preinstall";
import * as commitlintExec from "../commitlint";
import Push from "./push";

describe("src/events/push", () => {
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
    });

    afterAll(() => {
        teardownTestDirectory(options.cwd as string);
    });

    describe("Validating push events to branches", () => {
        afterEach(() => {
            expect(actionsInfo).toHaveBeenCalled();
            expect(actionsInfo).not.toHaveBeenCalledWith(
                expect.stringContaining('Skipping commit validation')
            );
            
            expect(commitlint).toHaveBeenCalledTimes(1);
        });

        it("Successfully validates commits on a branch", async () => {
            const event = new Push({
                ref: 'refs/heads/other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(3)}^` })
            );
        });

        it("Successfully validates commits since a merge", async () => {
            execSync([
                'git checkout master',
                'git merge --no-ff other'
            ].join(" && "), options);

            addValidCommit();
    
            const event = new Push({
                ref: 'refs/heads/master',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(1)}^` })
            );
        });

        it("Fails when there's an invalid commit on a branch", async () => {
            addInvalidCommit();
            addValidCommit();
    
            const event = new Push({
                ref: 'refs/heads/other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).rejects.toThrow();
    
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(5)}^` })
            );
        });
    });

    describe("Validating push events for other ref types", () => {
        afterEach(() => {
            expect(actionsInfo).toHaveBeenCalled();
            expect(actionsInfo).toHaveBeenCalledWith(
                expect.stringContaining('Skipping commit validation')
            );

            expect(commitlint).not.toHaveBeenCalled();
        });

        ['tag', ''].forEach(refType => {
            it(`Skips validation for ref type: '${refType}' pushes`, async () => {
                const event = new Push({
                    ref: 'refs/tags/someTag',
                    ref_type: refType,
                    target: '',
                }, options);

                await expect(event.validateCommits()).resolves.not.toThrow();
            });
        });
    });
});