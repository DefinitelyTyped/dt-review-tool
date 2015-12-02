/* tslint:disable:no-require-imports */
require("es6-promise").polyfill();
/* tslint:enable:no-require-imports */

/* tslint:disable:no-require-imports no-empty */
try {
    // optional
    require("source-map-support").install();
} catch (e) {
}

let pkg = require("../package.json");
/* tslint:enable:no-require-imports no-empty */

import * as review from "./index";
import * as commandpost from "commandpost";

interface RootOptions {
    user: string[];
    repo: string[];
}

interface RootArgs {
    prNumber: string;
}

let root = commandpost
    .create<RootOptions, RootArgs>("dtreview <prNumber>")
    .version(pkg.version, "-v, --version")
    .option("--user <user>", "target user(repository owner)", "DefinitelyTyped")
    .option("--repo <repo>", "target repository", "DefinitelyTyped")
    .action((opts, args) => {
        let num = parseInt(args.prNumber, 10);
        return review
            .generateComment({
                user: opts.user[0],
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
    "use strict";

    if (err instanceof Error && err.stack) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
    });
}
