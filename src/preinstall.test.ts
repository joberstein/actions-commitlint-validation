import { execSync } from "child_process";
import TestUtils from "./test/util";
import preinstall from "./preinstall";

const packageName = '@joberstein12/commitlint-config';

describe("src/preinstall", () => {
    const {
        createTempDirectory,
        teardownTestDirectory,
        options,
    } = new TestUtils();

    beforeEach(() => {
        options.cwd = createTempDirectory();
        process.chdir(options.cwd);
    });

    afterEach(() => {
        teardownTestDirectory(options.cwd as string);
    });

    it("Installs for an npm app", () => {
        execSync('npm init -y && npm install', options);

        preinstall(packageName, options);
       
        const isInstalled = execSync(`npm list ${packageName} | grep ${packageName}`)
            .toString()
            .trim();

        expect(isInstalled).toBeTruthy();
    });

    it("Installs for a yarn app", () => {
        execSync('yarn init -y && yarn install', options);

        preinstall(packageName, options);

        const isInstalled = execSync(`yarn list --pattern ${packageName} | grep ${packageName}`)
            .toString()
            .trim();

        expect(isInstalled).toBeTruthy();
    });
});