"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
/**
 * Pre-install extra dependencies.
 */
exports.default = (packageString, options) => {
    if (!packageString) {
        return;
    }
    const packages = packageString
        .replace(/(\n\r?|\s)+/, ' ')
        .split(/\s+/)
        .map(packageName => packageName.replace(/['"]/g, ''))
        .join(' ');
    if (packages) {
        const command = (0, fs_1.existsSync)('yarn.lock')
            ? `yarn add ${packages} --silent`
            : `npm install ${packages} --silent`;
        (0, child_process_1.execSync)(command, options);
    }
};
//# sourceMappingURL=preinstall.js.map