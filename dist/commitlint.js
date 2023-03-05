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
const load_1 = __importDefault(require("@commitlint/load"));
const read_1 = __importDefault(require("@commitlint/read"));
const lint_1 = __importDefault(require("@commitlint/lint"));
const format_1 = __importDefault(require("@commitlint/format"));
const core_1 = require("@actions/core");
/**
 * Run commitlint and print the formatted results.
 * Also print the number of errors and warnings found.
 * @throws If any of the commits are invalid.
 */
exports.default = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const [config, commits] = yield Promise.all([
        (0, load_1.default)(undefined, args),
        (0, read_1.default)(args),
    ]);
    const { rules, parserPreset = {} } = config;
    const { parserOpts } = parserPreset;
    const options = parserOpts ? { parserOpts } : {};
    const lintOutcomes = commits.map(commit => (0, lint_1.default)(commit, rules, options));
    const results = yield Promise.all(lintOutcomes);
    const formatted = (0, format_1.default)({ results }, { color: true, verbose: true });
    (0, core_1.info)(formatted);
    const warnings = [];
    const errors = [];
    results.forEach(result => {
        warnings.push(...(result.warnings || []));
        errors.push(...(result.errors || []));
    });
    if (!!warnings.length) {
        (0, core_1.warning)(`${warnings.length} warning(s) found.`);
    }
    if (!!errors.length) {
        (0, core_1.error)(`${errors.length} error(s) found.`);
    }
    if (results.some(result => !result.valid)) {
        throw new Error("Commit validation failed.");
    }
});
//# sourceMappingURL=commitlint.js.map