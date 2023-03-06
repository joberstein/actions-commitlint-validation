"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("./test/util"));
const preinstall_1 = __importDefault(require("./preinstall"));
const packageName = '@joberstein12/commitlint-config';
describe("src/preinstall", () => {
    const { createTempDirectory, teardownTestDirectory, options, } = new util_1.default();
    beforeEach(() => {
        options.cwd = createTempDirectory();
        process.chdir(options.cwd);
    });
    afterEach(() => {
        teardownTestDirectory(options.cwd);
    });
    it("Installs for an npm app", () => {
        (0, child_process_1.execSync)('npm init -y && npm install', options);
        (0, preinstall_1.default)(packageName, options);
        const isInstalled = (0, child_process_1.execSync)(`npm list ${packageName} | grep ${packageName}`)
            .toString()
            .trim();
        expect(isInstalled).toBeTruthy();
    });
    it("Installs for a yarn app", () => {
        (0, child_process_1.execSync)('yarn init -y && yarn install', options);
        (0, preinstall_1.default)(packageName, options);
        const isInstalled = (0, child_process_1.execSync)(`yarn list --pattern ${packageName} | grep ${packageName}`)
            .toString()
            .trim();
        expect(isInstalled).toBeTruthy();
    });
});
//# sourceMappingURL=preinstall.test.js.map