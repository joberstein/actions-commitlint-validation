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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _GitEvent_args;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commitlint_1 = __importDefault(require("commitlint"));
const core_1 = require("@actions/core");
/**
 * Represents a base Git event.
 */
class GitEvent {
    constructor(args, options) {
        _GitEvent_args.set(this, void 0);
        this.options = options;
        __classPrivateFieldSet(this, _GitEvent_args, args, "f");
    }
    get target() {
        return __classPrivateFieldGet(this, _GitEvent_args, "f").target;
    }
    /**
     * Provide a list of refs to checkout for this Git event.
     * @returns A list of refs
     */
    getRefsToCheckout() {
        return [__classPrivateFieldGet(this, _GitEvent_args, "f").target];
    }
    /**
     * Perform a checkout on all truthy refs returned from {@link GitEvent#getRefsToCheckout}
     */
    performCheckouts() {
        this.getRefsToCheckout()
            .filter(ref => ref)
            .forEach(ref => (0, child_process_1.execSync)(`git checkout ${ref}`, this.options).toString());
    }
    /**
     * Provide a list of commits for commitlint to start validation from.
     * @returns A list of commit hashes
     */
    getFromCommits() {
        return [__classPrivateFieldGet(this, _GitEvent_args, "f").target];
    }
    /**
     * Provide a reason to skip commit validation.
     * @returns A truthy value explaining why validation is skipped, or a falsey value to proceed with commit validation.
     */
    getSkipValidationReason() {
        return;
    }
    /**
     * Executes commit validation for this Git event.
     */
    validateCommits() {
        return __awaiter(this, void 0, void 0, function* () {
            const skipReason = this.getSkipValidationReason();
            if (skipReason) {
                (0, core_1.info)(`Skipping commit validation: ${skipReason}`);
                return;
            }
            yield Promise.all(this.getFromCommits()
                .map(from => {
                var _a, _b;
                return (0, commitlint_1.default)({
                    from: from ? `${from}^` : undefined,
                    cwd: ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.cwd) === null || _b === void 0 ? void 0 : _b.toString()) || undefined,
                });
            }));
        });
    }
}
_GitEvent_args = new WeakMap();
exports.default = GitEvent;
//# sourceMappingURL=gitEvent.js.map