"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class TestUtils {
    constructor(encoding = 'utf-8') {
        this.originalDirectory = process.cwd();
        this.getNthCommitBack = (numBack) => (0, child_process_1.execSync)(`git rev-parse HEAD~${numBack - 1}`, this.options).trim();
        this.addValidCommit = () => {
            const commands = [
                "echo valid >> src/test.txt",
                "echo '   ' >> package.json",
                "git add --all",
                `git commit -m "chore(ci): Add valid commit."`,
            ];
            (0, child_process_1.execSync)(commands.join(" && "), this.options);
        };
        this.addInvalidCommit = () => {
            const commands = [
                "echo invalid >> src/test.txt",
                "git add src",
                `git commit -m "Add invalid commit."`,
            ];
            (0, child_process_1.execSync)(commands.join(" && "), this.options);
        };
        this.createTempDirectory = () => (0, child_process_1.execSync)("mktemp -d", { encoding: this.encoding }).trim();
        this.setupTestDirectory = (tmpDir) => {
            (0, child_process_1.execSync)([
                `cp ${process.cwd()}/.commitlintrc.json ${tmpDir}`,
                `cp ${process.cwd()}/package*.json ${tmpDir}`,
                `cp ${process.cwd()}/.gitignore ${tmpDir}`,
            ].join(' && '));
            process.chdir(tmpDir);
            (0, child_process_1.execSync)('npm install --frozen-lockfile', this.options);
        };
        this.intializeGitRepo = () => {
            (0, child_process_1.execSync)([
                "git init",
                "git config advice.detachedHead false",
                "rm -rf .git/hooks",
                "mkdir src",
                "touch src/test.txt",
                "git add --all",
                "git commit -m 'chore: Add initial commit.'",
            ].join(" && "), this.options);
            [...Array(2).keys()].forEach(this.addValidCommit);
        };
        this.teardownGitRepo = () => {
            (0, child_process_1.execSync)([
                "rm -rf .git/*",
                "rm -rf src",
            ].join(' && '), this.options);
        };
        this.teardownTestDirectory = (tmpDir) => {
            process.chdir(this.originalDirectory);
            (0, child_process_1.execSync)(`rm -rf ${tmpDir}`);
        };
        this.encoding = encoding;
        this.options = { encoding };
    }
}
exports.default = TestUtils;
//# sourceMappingURL=util.js.map