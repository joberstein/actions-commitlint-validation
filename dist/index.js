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
const validateCommits_1 = __importDefault(require("./validateCommits"));
const preinstall_1 = __importDefault(require("./preinstall"));
const core_1 = require("@actions/core");
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const { INPUT_BASE_REF: source, INPUT_HEAD_REF: destination, INPUT_TARGET_REF: target, INPUT_EXTRA_CONFIG: extraConfig, } = process.env;
    try {
        (0, preinstall_1.default)(extraConfig);
        if (source) {
            (0, child_process_1.execSync)(`git checkout '${source}'`);
        }
        if (destination) {
            (0, child_process_1.execSync)(`git checkout '${destination}'`);
        }
        yield (0, validateCommits_1.default)({
            source,
            destination,
            target,
        });
    }
    catch (e) {
        (0, core_1.setFailed)(e.message);
    }
});
//# sourceMappingURL=index.js.map