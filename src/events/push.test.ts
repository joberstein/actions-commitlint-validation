import { execSync } from "child_process";
import * as actions from "@actions/core";
import TestUtils from "../test/util";
import preinstall from "../preinstall";
import * as commitlintExec from "../commitlint";
import Push from "./push";

describe("src/events/push", () => {
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
            expect(actions.info).toHaveBeenCalled();
            expect(actions.info).not.toHaveBeenCalledWith(
                expect.stringContaining('Skipping commit validation')
            );
            
            expect(commitlint).toHaveBeenCalledTimes(1);
        });

        it("Successfully validates commits on a branch", async () => {
            const event = new Push({
                ref_name: 'other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(3)}^` })
            );
        });

        it("Successfully validates commits after branching from a merge", async () => {
            execSync([
                'git checkout master',
                'git merge --no-ff other',
                'git checkout -qb other2',
            ].join(" && "), options);

            addValidCommit();

            const event = new Push({
                ref_name: 'other2',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(1)}^` })
            );
        });

        it("Successfully validates commits for pushed branches with a merge commit", async () => {
            execSync([
                'git checkout master',
                'git merge --no-ff other'
            ].join(" && "), options);

            addValidCommit();
    
            const event = new Push({
                ref_name: 'master',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(2)}^` })
            );
        });

        it("Fails when there's an invalid commit on a branch", async () => {
            addInvalidCommit();
            addValidCommit();
    
            const event = new Push({
                ref_name: 'other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).rejects.toThrow();
    
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: `${getNthCommitBack(5)}^` })
            );
        });
    });

    describe("Skipping validation", () => {
        afterEach(() => {
            expect(commitlint).not.toHaveBeenCalled();
        });

        ['tag', ''].forEach(refType => {
            it(`Skips validation for ref type: '${refType}' pushes`, async () => {
                const event = new Push({
                    ref_name: 'someTag',
                    ref_type: refType,
                    target: '',
                }, options);

                await expect(event.validateCommits()).resolves.not.toThrow();

                expect(actions.info).toHaveBeenCalled();
                expect(actions.info).toHaveBeenCalledWith(
                    expect.stringContaining('Skipping commit validation')
                );
            });
        });


        it("Skips commit validation for pushed branches with a fast-forward merge", async () => {
            execSync([
                'git checkout master',
                'git merge other'
            ].join(" && "), options);
    
            const event = new Push({
                ref_name: 'master',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
    
            await expect(event.validateCommits()).resolves.not.toThrow();
            
            expect(actions.warning).toHaveBeenCalled();
            expect(actions.warning).toHaveBeenCalledWith('Could not find any commits to validate.');
        });
    });
});