/* tslint:disable:no-require-imports no-empty */
try {
    // optional
    require("source-map-support").install();
} catch (e) {
}

let pkg = require("../package.json");
/* tslint:enable:no-require-imports no-empty */

import * as review from "./";
import * as commandpost from "commandpost";

interface RootOptions {
    owner: string[];
    repo: string[];
}

interface RootArgs {
    prNumber: string;
}

let root = commandpost
    .create<RootOptions, RootArgs>("dtreview <prNumber>")
    .version(pkg.version, "-v, --version")
    .option("--owner <owner>", "target owner (repository owner)", "DefinitelyTyped")
    .option("--repo <repo>", "target repository", "DefinitelyTyped")
    .action((opts, args) => {
        let num = parseInt(args.prNumber, 10);
        return review
            .generateComment({
                owner: opts.owner[0],
                repo: opts.repo[0],
                number: num,
            }).then(comments => {
                console.log(comments.join("\n------\n\n"));
            });
    });

commandpost
    .exec(root, process.argv)
    .catch(errorHandler);

function errorHandler(err: any) {
    if (err instanceof Error && err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
    });
}
