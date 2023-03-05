"use strict";
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
const commitlint_1 = __importDefault(require("./commitlint"));
/**
 * Validate all the commits between two refs if possible. If not, validate a target
 * commit instead. If the target commit is also absent, validate all commits.
 */
exports.default = ({ target, source, destination }, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const fromCommit = source && destination
        ? getCommitFromRange({ source, destination }, options)
        : target;
    yield (0, commitlint_1.default)({
        from: fromCommit ? `${fromCommit}^` : undefined,
        cwd: ((_a = options === null || options === void 0 ? void 0 : options.cwd) === null || _a === void 0 ? void 0 : _a.toString()) || undefined,
    });
});
/**
 * Get the initial commit from two refs.
 * @throws if there was an error getting the commit.
 */
const getCommitFromRange = ({ source, destination }, options) => {
    const result = (0, child_process_1.execSync)(`git rev-list ${source}..${destination} | tail -n 1`, options)
        .toString()
        .trim();
    if (!result) {
        throw new Error('Failed to get initial commit in the given range.');
    }
    return result;
};
//# sourceMappingURL=validateCommits.js.map