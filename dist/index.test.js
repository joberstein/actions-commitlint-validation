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
const index_1 = __importDefault(require("./index"));
describe("src/index", () => {
    let tmpDir;
    const actionsInfo = jest.spyOn(actions, "info");
    const setFailed = jest.spyOn(actions, "setFailed");
    const { createTempDirectory, intializeGitRepo, getNthCommitBack, teardownGitRepo, teardownTestDirectory, addInvalidCommit, addValidCommit, setupTestDirectory, options, } = new util_1.default();
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
        expect(actionsInfo).toHaveBeenCalled();
    });
    it("Successfully validates a target commit", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, index_1.default)();
        expect(setFailed).not.toHaveBeenCalled();
    }));
    it("Successfully validates a range of commits", () => __awaiter(void 0, void 0, void 0, function* () {
        process.env.INPUT_BASE_REF = "master";
        process.env.INPUT_HEAD_REF = "#3";
        (0, child_process_1.execSync)(`git checkout -qb '${process.env.INPUT_HEAD_REF}'`, options);
        [...Array(3).keys()].forEach(addValidCommit);
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);
        yield (0, index_1.default)();
        expect(setFailed).not.toHaveBeenCalled();
    }));
    it("Fails validation for an invalid commit", () => __awaiter(void 0, void 0, void 0, function* () {
        addInvalidCommit();
        process.env.INPUT_TARGET_REF = getNthCommitBack(1);
        yield (0, index_1.default)();
        expect(setFailed).toHaveBeenCalledWith('Commit validation failed.');
    }));
});
//# sourceMappingURL=index.test.js.map