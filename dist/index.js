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
const core_1 = require("@actions/core");
const gitEvent_1 = __importDefault(require("./events/gitEvent"));
const pullRequest_1 = __importDefault(require("./events/pullRequest"));
const push_1 = __importDefault(require("./events/push"));
const preinstall_1 = __importDefault(require("./preinstall"));
exports.default = () => __awaiter(void 0, void 0, void 0, function* () {
    const { INPUT_BASE_REF: base_ref, INPUT_HEAD_REF: head_ref, INPUT_REF_NAME: ref_name, INPUT_REF_TYPE: ref_type, INPUT_TARGET_REF: target = '', INPUT_EXTRA_CONFIG: extraConfig, } = process.env;
    const event = base_ref && head_ref
        ? new pullRequest_1.default({ base_ref, head_ref, target })
        : ref_name
            ? new push_1.default({ ref_name, ref_type, target })
            : new gitEvent_1.default({ target });
    try {
        event.performCheckouts();
        (0, preinstall_1.default)(extraConfig);
        yield event.validateCommits();
    }
    catch (e) {
        (0, core_1.setFailed)(e.message);
    }
});
//# sourceMappingURL=index.js.map