"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const actions = __importStar(require("@actions/core"));
const util_1 = __importDefault(require("./test/util"));
const validateCommits_1 = __importDefault(require("./validateCommits"));
const preinstall_1 = __importDefault(require("./preinstall"));
const commitlintExec = __importStar(require("./commitlint"));
describe("src/validateCommits", () => {
    const commitlint = jest.spyOn(commitlintExec, 'default');
    const actionsInfo = jest.spyOn(actions, "info");
    const { createTempDirectory, intializeGitRepo, getNthCommitBack, teardownGitRepo, teardownTestDirectory, addInvalidCommit, addValidCommit, setupTestDirectory, options, } = new util_1.default();
    beforeAll(() => {
        options.cwd = createTempDirectory();
        setupTestDirectory(options.cwd);
        (0, preinstall_1.default)('@joberstein12/commitlint-config', options);
    });
    beforeEach(() => {
        intializeGitRepo();
    });
    afterEach(() => {
        teardownGitRepo();
    });
    afterAll(() => {
        teardownTestDirectory(options.cwd);
    });
    it("Validates all commits with empty args", () => __awaiter(void 0, void 0, void 0, function* () {
        yield expect((0, validateCommits_1.default)({}, options)).resolves.not.toThrow();
        expect(actionsInfo).toHaveBeenCalled();
        expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: undefined }));
    }));
    describe("Validating the target commit", () => {
        it("Successfully validates the target commit", () => __awaiter(void 0, void 0, void 0, function* () {
            const target = getNthCommitBack(1);
            const args = { target };
            yield expect((0, validateCommits_1.default)(args, options)).resolves.not.toThrow();
            expect(actionsInfo).toHaveBeenCalled();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${target}^` }));
        }));
        it("Fails when the target commit is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            addInvalidCommit();
            const target = getNthCommitBack(1);
            const args = { target };
            yield expect((0, validateCommits_1.default)(args, options)).rejects.toThrow();
            expect(actionsInfo).toHaveBeenCalled();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${target}^` }));
        }));
    });
    describe("Validating a range of commits", () => {
        beforeEach(() => {
            (0, child_process_1.execSync)("git checkout -qb other", options);
            [...Array(3).keys()].forEach(addValidCommit);
        });
        it("Successfully completes commit validation", () => __awaiter(void 0, void 0, void 0, function* () {
            const target = getNthCommitBack(3);
            const args = {
                source: "master",
                destination: "other",
                target,
            };
            yield expect((0, validateCommits_1.default)(args, options)).resolves.not.toThrow();
            expect(actionsInfo).toHaveBeenCalled();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${target}^` }));
        }));
        it("Fails when the commit range is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            addInvalidCommit();
            addValidCommit();
            const target = getNthCommitBack(5);
            const args = {
                source: "master",
                destination: "other",
                target,
            };
            yield expect((0, validateCommits_1.default)(args, options)).rejects.toThrow();
            expect(actionsInfo).toHaveBeenCalled();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${target}^` }));
        }));
        it("Validates the target commit when the source is not known", () => __awaiter(void 0, void 0, void 0, function* () {
            const target = getNthCommitBack(1);
            const args = {
                source: "error",
                destination: "master",
                target,
            };
            yield expect((0, validateCommits_1.default)(args, options)).rejects.toThrow();
            expect(actionsInfo).not.toHaveBeenCalled();
            expect(commitlint).not.toHaveBeenCalled();
        }));
        it("Validates the target commit when the destination is not known", () => __awaiter(void 0, void 0, void 0, function* () {
            const target = getNthCommitBack(1);
            const args = {
                source: "other",
                destination: "error",
                target,
            };
            yield expect((0, validateCommits_1.default)(args, options)).rejects.toThrow();
            expect(actionsInfo).not.toHaveBeenCalled();
            expect(commitlint).not.toHaveBeenCalled();
        }));
        it("Successfully validates merge commits", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, child_process_1.execSync)([
                'git checkout master',
                'git merge --no-ff other'
            ].join(" && "), options);
            const target = getNthCommitBack(1);
            const args = { target };
            yield expect((0, validateCommits_1.default)(args, options)).resolves.not.toThrow();
            expect(actionsInfo).toHaveBeenCalled();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${target}^` }));
        }));
    });
});
//# sourceMappingURL=validateCommits.test.js.map