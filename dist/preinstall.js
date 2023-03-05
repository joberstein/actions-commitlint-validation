"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
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
        (0, child_process_1.execSync)(`npm install ${packages} --silent`, options);
    }
};
//# sourceMappingURL=preinstall.js.map