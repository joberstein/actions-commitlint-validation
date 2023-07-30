import load from "@commitlint/load";
import read from "@commitlint/read";
import lint from "@commitlint/lint";
import format from "@commitlint/format";
import {info, warning, error} from "@actions/core";

/**
 * Run commitlint and print the formatted results. 
 * Also print the number of errors and warnings found.
 * @throws If any of the commits are invalid.
 */
export default async (args: GetCommitMessageOptions) => {
    const [ config, commits ] = await Promise.all([
        load(undefined, args),
        read(args),
    ]);

    const { rules, parserPreset = {} } = config;
    const { parserOpts } = parserPreset;
    const options = parserOpts ?  { parserOpts } : {};

    const lintOutcomes = commits.map(commit => lint(commit, rules, options));
    const results = await Promise.all(lintOutcomes);
    const formatted = format({ results }, { color: true , verbose: true });
    
    info(formatted);

    const warnings = [];
    const errors = [];

    results.forEach(({ warnings, errors }) => {
        warnings.push(...warnings);
        errors.push(...errors);
    });

    if (warnings.length) {
        warning(`${warnings.length} warning(s) found.`);
    }

    if (errors.length) {
        error(`${errors.length} error(s) found.`);
    }

    if (results.some(result => !result.valid)) {
        throw new Error("Commit validation failed.");
    }
}