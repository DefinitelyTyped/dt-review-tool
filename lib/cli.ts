require("es6-promise").polyfill();

/* tslint:disable:no-require-imports */
try {
    // optional
    require("source-map-support").install();
} catch (e) {
}

var pkg = require("../package.json");
/* tslint:enable:no-require-imports */

import * as review from "./index";
import * as commandpost from "commandpost";

interface RootOptions {
}

interface RootArgs {
    prNumber: string;
}

var root = commandpost
    .create<RootOptions, RootArgs>("dtreview <prNumber>")
    .version(pkg.version, "-v, --version")
    .action((opts, args) => {
        var num = parseInt(args.prNumber);
        return review.generateComment(num);
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
