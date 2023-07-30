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
var _Push_args;
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const gitEvent_1 = __importDefault(require("./gitEvent"));
/**
 * Represents a Git Push event.
 */
class Push extends gitEvent_1.default {
    constructor(args, options) {
        const { target } = args;
        super({ target }, options);
        _Push_args.set(this, void 0);
        __classPrivateFieldSet(this, _Push_args, args, "f");
    }
    /**
    * Provide a list of refs containing the ref that was pushed to.
    * @returns A list of refs
    */
    getRefsToCheckout() {
        const { ref_type, ref } = __classPrivateFieldGet(this, _Push_args, "f");
        return ref_type === 'branch' ? [ref] : [];
    }
    /**
     * Skip validation for tag and non-branch pushes.
     * @returns A reason for skipping validation for non-branch pushes.
     */
    getSkipValidationReason() {
        const { ref_type, ref } = __classPrivateFieldGet(this, _Push_args, "f");
        if (ref_type !== 'branch') {
            return `Pushes for ref type: '${ref_type}' are not supported, regarding: '${ref}'.`;
        }
    }
    /**
     * Provide a list containing the initial commit on the ref that was pushed to.
     * @returns A list of commit hashes
     */
    getFromCommits() {
        const { ref } = __classPrivateFieldGet(this, _Push_args, "f");
        const { options } = this;
        const refs = (0, child_process_1.execSync)(`git for-each-ref --format="%(refname)" refs/heads`, options)
            .toString()
            .trim()
            .split('\n');
        console.log(refs);
        const refsToExclude = refs
            .filter(seenRef => ref !== seenRef)
            .join(' ');
        const [commit,] = (0, child_process_1.execSync)(`git rev-list --no-merges '${ref}' --not ${refsToExclude}`, options)
            .toString()
            .trim()
            .split('\n')
            .reverse();
        if (!commit) {
            throw new Error(`Failed to get initial commit: '${ref}'.`);
        }
        return [commit];
    }
}
exports.default = Push;
_Push_args = new WeakMap();
//# sourceMappingURL=push.js.map