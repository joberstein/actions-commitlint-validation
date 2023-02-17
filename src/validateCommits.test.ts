// import { execSync } from "child_process";
// import * as actions from "@actions/core";
// import TestUtils from "./test/util";
// import validateCommits from "./validateCommits";
// import preinstall from "./preinstall";
// import * as commitlintExec from "./commitlint";

// describe("src/validateCommits", () => {
//     const commitlint = jest.spyOn(commitlintExec, 'default');
//     const actionsInfo = jest.spyOn(actions, "info");

//     const {
//         createTempDirectory,
//         intializeGitRepo,
//         getNthCommitBack,
//         teardownGitRepo,
//         teardownTestDirectory,
//         addInvalidCommit,
//         addValidCommit,
//         setupTestDirectory,
//         options,
//     } = new TestUtils();

//     beforeAll(() => {
//         options.cwd = createTempDirectory();
//         setupTestDirectory(options.cwd);
//         preinstall('@joberstein12/commitlint-config', options);
//     });

//     beforeEach(() => {
//         intializeGitRepo();
//     });

//     afterEach(() => {
//         teardownGitRepo();
//         expect(actionsInfo).toHaveBeenCalled();
//     });

//     afterAll(() => {
//         teardownTestDirectory(options.cwd as string);
//     });
    
//     it("Validates all commits with empty args", async () => {
//         await expect(validateCommits({}, options)).resolves.not.toThrow();
//         expect(commitlint).toHaveBeenCalledWith(
//             expect.objectContaining({ from: undefined })
//         );
//     });

//     describe("Validating the target commit", () => {
//         it("Successfully validates the target commit", async () => {
//             const target = getNthCommitBack(1);
//             const args = { target };

//             await expect(validateCommits(args, options)).resolves.not.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });

//         it("Fails when the target commit is invalid", async () => {
//             addInvalidCommit();

//             const target = getNthCommitBack(1);
//             const args = { target };

//             await expect(validateCommits(args, options)).rejects.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });
//     });

//     describe("Validating a range of commits", () => {
//         beforeEach(() => {
//             execSync("git checkout -qb other", options);
//             [ ...Array(3).keys() ].forEach(addValidCommit);
//         });

//         it("Successfully completes commit validation", async () => {
//             const target = getNthCommitBack(3);
//             const args = {
//                 source: "master",
//                 destination: "other",
//                 target,
//             };
    
//             await expect(validateCommits(args, options)).resolves.not.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });

//         it("Fails when the commit range is invalid", async () => {
//             addInvalidCommit();
//             addValidCommit();

//             const target = getNthCommitBack(5);
//             const args = {
//                 source: "master",
//                 destination: "other",
//                 target,
//             };
    
//             await expect(validateCommits(args, options)).rejects.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });

//         it("Validates the target commit when the source is not known", async () => {
//             const target = getNthCommitBack(1);
//             const args = {
//                 source: "error",
//                 destination: "master",
//                 target,
//             };

//             await expect(validateCommits(args, options)).resolves.not.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });
    
//         it("Validates the target commit when the destination is not known", async () => {
//             const target = getNthCommitBack(1);
//             const args = {
//                 source: "other",
//                 destination: "error",
//                 target,
//             };

//             await expect(validateCommits(args, options)).resolves.not.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });

//         it("Successfully validates merge commits", async () => {
//             execSync([
//                 'git checkout master',
//                 'git merge --no-ff other'
//             ].join(" && "), options);

//             const target = getNthCommitBack(1);
//             const args = { target };

//             await expect(validateCommits(args, options)).resolves.not.toThrow();
//             expect(commitlint).toHaveBeenCalledWith(
//                 expect.objectContaining({ from: `${target}^` })
//             );
//         });
//     });
// });