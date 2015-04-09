/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../node_modules/commandpost/commandpost.d.ts" />

require("es6-promise").polyfill();

try {
    // optional
    require("source-map-support").install();
} catch (e) {
}

var pkg = require("../package.json");

import review = require("./index");

import commandpost = require("commandpost");

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

    if (err instanceof Error) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
    });
}
