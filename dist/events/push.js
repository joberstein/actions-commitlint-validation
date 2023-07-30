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
        const { ref_type, ref_name } = __classPrivateFieldGet(this, _Push_args, "f");
        return ref_type === 'branch' ? [ref_name] : [];
    }
    /**
     * Skip validation for tag and non-branch pushes.
     * @returns A reason for skipping validation for non-branch pushes.
     */
    getSkipValidationReason() {
        const { ref_type, ref_name } = __classPrivateFieldGet(this, _Push_args, "f");
        if (ref_type !== 'branch') {
            return `Pushes for ref type: '${ref_type}' are not supported, regarding: '${ref_name}'.`;
        }
    }
    /**
     * Provide a list containing the initial commit that is only on the ref that was pushed to.
     * @returns A list of commit hashes
     */
    getFromCommits() {
        const { ref_name } = __classPrivateFieldGet(this, _Push_args, "f");
        const { options } = this;
        const currentBranchIndicator = '* ';
        const isBranchSpecificRevision = (refName, revision) => {
            const branchesWithRevision = (0, child_process_1.execSync)(`git branch -a --contains '${revision}'`, options)
                .toString()
                .trim()
                .split('\n')
                .map(branch => branch.startsWith(currentBranchIndicator)
                ? branch.replace(currentBranchIndicator, '')
                : branch)
                .every(branch => new RegExp(`^(remotes\/origin\/)?${refName}$`).test(branch.trim()));
        };
        const [commit,] = (0, child_process_1.execSync)(`git rev-list '${ref_name}'`, options)
            .toString()
            .trim()
            .split('\n')
            .filter(revision => isBranchSpecificRevision(ref_name, revision))
            .reverse();
        return [commit].filter(c => c);
    }
}
exports.default = Push;
_Push_args = new WeakMap();
//# sourceMappingURL=push.js.map