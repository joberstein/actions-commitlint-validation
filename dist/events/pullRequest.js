"use strict";
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
var _PullRequest_args;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const gitEvent_1 = __importDefault(require("./gitEvent"));
/**
 * Represents a Git Pull Request event.
 */
class PullRequest extends gitEvent_1.default {
    constructor(args, options) {
        const { target } = args;
        super({ target }, options);
        _PullRequest_args.set(this, void 0);
        __classPrivateFieldSet(this, _PullRequest_args, args, "f");
    }
    /**
    * Provide a list containing the base, head, and target refs for the pull request.
    * @returns A list of refs
    */
    getRefsToCheckout() {
        const { base_ref, head_ref, target } = __classPrivateFieldGet(this, _PullRequest_args, "f");
        return [base_ref, head_ref, target];
    }
    /**
     * Provide a list containing the initial commit of the pull request, and the target ref, which may be detached from the pull request head.
     * @returns A list of commit hashes
     */
    getFromCommits() {
        const { head_ref, base_ref } = __classPrivateFieldGet(this, _PullRequest_args, "f");
        const { options, target } = this;
        const [commit,] = (0, child_process_1.execSync)(`git rev-list --no-merges --first-parent ${base_ref}..'${head_ref}'`, options)
            .toString()
            .trim()
            .split('\n')
            .reverse();
        if (!commit) {
            throw new Error('Failed to get initial commit in the given range.');
        }
        return [commit, target];
    }
}
exports.default = PullRequest;
_PullRequest_args = new WeakMap();
//# sourceMappingURL=pullRequest.js.map