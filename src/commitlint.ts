import load from "@commitlint/load";
import read from "@commitlint/read";
import lint from "@commitlint/lint";
import format from "@commitlint/format";

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
    
    console.info(formatted);

    const warnings = [];
    const errors = [];

    results.forEach(result => {
        warnings.push(...(result.warnings || []));
        errors.push(...(result.errors || []));
    });

    if (!!warnings.length) {
        console.warn(`${warnings.length} warning(s) found.`);
    }

    if (!!errors.length) {
        console.error(`${errors.length} error(s) found.`);
    }

    if (results.some(result => !result.valid)) {
        throw new Error("Commit validation failed.");
    }
}