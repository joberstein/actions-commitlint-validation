import { ExecSyncOptionsWithStringEncoding, execSync } from "child_process";
import run, { validateCommits } from "./index";
import preinstall from "./preinstall";
import * as commitlintExec from "./commitlint";
import * as actions from "@actions/core";

describe("src/index", () => {
    const encoding = 'utf-8';
    const options: ExecSyncOptionsWithStringEncoding = { encoding };
    const originalDirectory = process.cwd();

    const commitlint = jest.spyOn(commitlintExec, 'default');
    const actionsInfo = jest.spyOn(actions, "info");
    const setFailed = jest.spyOn(actions, "setFailed");

    const getNthCommitBack = (numBack: number) => execSync(`git rev-parse HEAD~${numBack - 1}`, options)
        .trim();
    
    const addValidCommit = () => {
        const commands = [
            "echo invalid >> src/test.txt",
            "git add src",
            `git commit -m "chore(ci): Add valid commit."`,
        ];
        
        execSync(commands.join(" && "), options);
    }

    const addInvalidCommit = () => {
        const commands = [
            "echo invalid >> src/test.txt",
            "git add src",
            `git commit -m "Add invalid commit."`,
        ];
        
        execSync(commands.join(" && "), options);
    }

    const createTempDirectory = () => execSync("mktemp -d", { encoding })
        .trim();

    const setupTestDirectory = (tmpDir: string) => {
        execSync(`cp ${process.cwd()}/.commitlintrc.json ${tmpDir}`);
        execSync(`cp ${process.cwd()}/package*.json ${tmpDir}`);
        process.chdir(tmpDir);
        execSync('npm install --frozen-lockfile', options);
    };

    const intializeGitRepo = () => {
        execSync([
            "git init",
            "rm -rf .git/hooks",
            "mkdir src",
            "touch src/test.txt",
        ].join(" && "), options);

        [ ...Array(2).keys() ].forEach(addValidCommit);
    }

    const teardownGitRepo = () => {
        execSync([
            "rm -rf .git",
            "rm -rf src"
        ].join(' && '), options);
    }

    const teardownTestDirectory = (tmpDir: string) => {
        process.chdir(originalDirectory);
        execSync(`rm -rf ${tmpDir}`);
    }

    afterEach(() => {
        expect(actionsInfo).toHaveBeenCalled();
    });

    describe("Integration Tests", () => {
        let tmpDir: string;

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
        })

        it("Successfully validates a target commit", async () => {
            await run();
            expect(setFailed).not.toHaveBeenCalled();
        });

        it("Successfully validates a range of commits", async () => {
            process.env.INPUT_BASE_REF = "master";
            process.env.INPUT_HEAD_REF = "other";

            execSync("git checkout -qb other", options);
            [ ...Array(3).keys() ].forEach(addValidCommit);
            process.env.INPUT_TARGET_REF = getNthCommitBack(1);

            await run();
            expect(setFailed).not.toHaveBeenCalled();
        });


        it("Fails validation for an invalid commit", async () => {
            addInvalidCommit();
            process.env.INPUT_TARGET_REF = getNthCommitBack(1);

            await run();
            expect(setFailed).toHaveBeenCalledWith('Commit validation failed.');
        });
    });

    describe("Unit Tests", () => {
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
        });
    
        afterAll(() => {
            teardownTestDirectory(options.cwd as string);
        });
        
        it("Validates all commits with empty args", async () => {
            await expect(validateCommits({}, options)).resolves.not.toThrow();
            expect(commitlint).toHaveBeenCalledWith(
                expect.objectContaining({ from: undefined })
            );
        });
    
        describe("Validating the target commit", () => {
            it("Successfully validates the target commit", async () => {
                const target = getNthCommitBack(1);
                const args = { target };
    
                await expect(validateCommits(args, options)).resolves.not.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
    
            it("Fails when the target commit is invalid", async () => {
                addInvalidCommit();
    
                const target = getNthCommitBack(1);
                const args = { target };
    
                await expect(validateCommits(args, options)).rejects.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
        });
    
        describe("Validating a range of commits", () => {
            beforeEach(() => {
                execSync("git checkout -qb other", options);
                [ ...Array(3).keys() ].forEach(addValidCommit);
            });
    
            it("Successfully completes commit validation", async () => {
                const target = getNthCommitBack(3);
                const args = {
                    source: "master",
                    destination: "other",
                    target,
                };
        
                await expect(validateCommits(args, options)).resolves.not.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
    
            it("Fails when the commit range is invalid", async () => {
                addInvalidCommit();
                addValidCommit();
    
                const target = getNthCommitBack(5);
                const args = {
                    source: "master",
                    destination: "other",
                    target,
                };
        
                await expect(validateCommits(args, options)).rejects.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
    
            it("Validates the target commit when the source is not known", async () => {
                const target = getNthCommitBack(1);
                const args = {
                    source: "error",
                    destination: "master",
                    target,
                };
    
                await expect(validateCommits(args, options)).resolves.not.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
        
            it("Validates the target commit when the destination is not known", async () => {
                const target = getNthCommitBack(1);
                const args = {
                    source: "other",
                    destination: "error",
                    target,
                };
    
                await expect(validateCommits(args, options)).resolves.not.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
    
            it("Successfully validates merge commits", async () => {
                execSync([
                    'git checkout master',
                    'git merge --no-ff other'
                ].join(" && "), options);
    
                const target = getNthCommitBack(1);
                const args = { target };
    
                await expect(validateCommits(args, options)).resolves.not.toThrow();
                expect(commitlint).toHaveBeenCalledWith(
                    expect.objectContaining({ from: `${target}^` })
                );
            });
        });
    });
});