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
const util_1 = __importDefault(require("../test/util"));
const preinstall_1 = __importDefault(require("../preinstall"));
const commitlintExec = __importStar(require("../commitlint"));
const push_1 = __importDefault(require("./push"));
describe("src/events/push", () => {
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
        (0, child_process_1.execSync)("git checkout -qb other", options);
        [...Array(3).keys()].forEach(addValidCommit);
    });
    afterEach(() => {
        teardownGitRepo();
    });
    afterAll(() => {
        teardownTestDirectory(options.cwd);
    });
    describe("Validating push events to branches", () => {
        afterEach(() => {
            expect(actionsInfo).toHaveBeenCalled();
            expect(actionsInfo).not.toHaveBeenCalledWith(expect.stringContaining('Skipping commit validation'));
            expect(commitlint).toHaveBeenCalledTimes(1);
        });
        it("Successfully validates commits on a branch", () => __awaiter(void 0, void 0, void 0, function* () {
            const event = new push_1.default({
                ref: 'refs/heads/other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
            yield expect(event.validateCommits()).resolves.not.toThrow();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${getNthCommitBack(3)}^` }));
        }));
        it("Successfully validates commits since a merge", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, child_process_1.execSync)([
                'git checkout master',
                'git merge --no-ff other'
            ].join(" && "), options);
            addValidCommit();
            const event = new push_1.default({
                ref: 'refs/heads/master',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
            yield expect(event.validateCommits()).resolves.not.toThrow();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${getNthCommitBack(1)}^` }));
        }));
        it("Fails when there's an invalid commit on a branch", () => __awaiter(void 0, void 0, void 0, function* () {
            addInvalidCommit();
            addValidCommit();
            const event = new push_1.default({
                ref: 'refs/heads/other',
                ref_type: 'branch',
                target: getNthCommitBack(1),
            }, options);
            yield expect(event.validateCommits()).rejects.toThrow();
            expect(commitlint).toHaveBeenCalledWith(expect.objectContaining({ from: `${getNthCommitBack(5)}^` }));
        }));
    });
    describe("Validating push events for other ref types", () => {
        afterEach(() => {
            expect(actionsInfo).toHaveBeenCalled();
            expect(actionsInfo).toHaveBeenCalledWith(expect.stringContaining('Skipping commit validation'));
            expect(commitlint).not.toHaveBeenCalled();
        });
        ['tag', ''].forEach(refType => {
            it(`Skips validation for ref type: '${refType}' pushes`, () => __awaiter(void 0, void 0, void 0, function* () {
                const event = new push_1.default({
                    ref: 'refs/tags/someTag',
                    ref_type: refType,
                    target: '',
                }, options);
                yield expect(event.validateCommits()).resolves.not.toThrow();
            }));
        });
    });
});
//# sourceMappingURL=push.test.js.map