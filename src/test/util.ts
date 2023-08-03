import { ExecSyncOptionsWithStringEncoding, execSync } from "child_process";

export default class TestUtils {
    encoding: BufferEncoding;
    options: ExecSyncOptionsWithStringEncoding;
    originalDirectory = process.cwd();

    constructor(encoding: BufferEncoding = 'utf-8') {
        this.encoding = encoding;
        this.options = { encoding };
    }

    getNthCommitBack = (numBack: number) => 
        execSync(`git rev-parse HEAD~${numBack - 1}`, this.options).trim();

    addValidCommit = () => {
        const commands = [
            "echo valid >> src/test.txt",
            "echo '   ' >> package.json",
            "git add --all",
            `git commit -m "chore(ci): Add valid commit."`,
        ];
    
        execSync(commands.join(" && "), this.options);
    };

    addInvalidCommit = () => {
        const commands = [
            "echo invalid >> src/test.txt",
            "git add src",
            `git commit -m "Add invalid commit."`,
        ];
    
        execSync(commands.join(" && "), this.options);
    };

    createTempDirectory = () => 
        execSync("mktemp -d", { encoding: this.encoding }).trim();

    setupTestDirectory = (tmpDir: string) => {
        execSync([
            `cp ${process.cwd()}/.commitlintrc.json ${tmpDir}`,
            `cp ${process.cwd()}/package*.json ${tmpDir}`,
            `cp ${process.cwd()}/.gitignore ${tmpDir}`,
        ].join(' && '));
        
        process.chdir(tmpDir);
        execSync('npm install --frozen-lockfile', this.options);
    };

    intializeGitRepo = () => {
        execSync([
            "git init",
            "git config advice.detachedHead false",
            "rm -rf .git/hooks",
            "mkdir src",
            "touch src/test.txt",
            "git add --all",
            "git commit -m 'chore: Add initial commit.'",
        ].join(" && "), this.options);
    
        [ ...Array(2).keys() ].forEach(this.addValidCommit);
    }

    teardownGitRepo = () => {
        execSync([
            "rm -rf .git/*",
            "rm -rf src",
        ].join(' && '), this.options);
    }

    teardownTestDirectory = (tmpDir: string) => {
        process.chdir(this.originalDirectory);
        execSync(`rm -rf ${tmpDir}`);
    }
}