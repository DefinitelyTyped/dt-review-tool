import * as github from "./github";
import * as header from "definition-header";

export function generateComment(prNumber: number) {
    "use strict";

    return github
        .getPRInfo({ number: prNumber })
        .then(info => {
            return info.files
                .filter(file => /\.d\.ts(x)?$/.test(file.filename))
                .forEach((file, idx, files) => {
                    console.log(`*${file.filename}*`);
                    console.log("");

                    if (file.status === "modified") {
                        var content = info.baseContents[file.filename];
                        var headerInfo = header.parse(content);
                        if (!headerInfo.success) {
                            console.error("!!! TODO !!!");
                            return;
                        }
                        var accountNames = headerInfo.value.authors.map(author => {
                            var regexp = /https?:\/\/github.com\/(.*)\/?/;
                            var reArray: string[] = regexp.exec(author.url) || [];
                            var accountName = reArray[1];
                            if (accountName) {
                                return `@${accountName}`;
                            } else {
                                console.log(`author: ${author.name} (account can't detected)`);
                            }
                        }).filter(name => !!name);

                        if (accountNames.length !== 0) {
                            console.log(`to author${accountNames.length === 1 ? "" : "s"}(${accountNames.join(" ") }). could you review this PR?`);
                            console.log(":+1: or :-1:?");
                        }

                        console.log(``);
                        console.log(`check list`);
                        console.log(``);
                        console.log(`* [ ] pass the Travic-CI test?`);

                    } else if (file.status === "added") {
                        var packageName = file.filename.substr(0, file.filename.indexOf("/"));
                        var testFileNames = [file.filename.substr(0, file.filename.length - 5) + "-tests.ts"];
                        testFileNames[1] = testFileNames[0] + "x";
                        var testFileExists = info.files.filter(file => testFileNames.indexOf(file.filename) !== -1).length !== 0;

                        console.log(`check list`);
                        console.log(``);
                        console.log(`* [ ] is collect [naming convention](http://definitelytyped.org/guides/contributing.html#naming-the-file)?`);
                        console.log(`  * https://www.npmjs.com/package/${packageName}`);
                        console.log(`  * http://bower.io/search/?q=${packageName}`);
                        console.log(`  * others?`);
                        console.log(`* [${testFileExists ? "X" : " "}] has a [test file](http://definitelytyped.org/guides/contributing.html#tests)? (${testFileNames.join(" or ")})`);
                        console.log(`* [ ] pass the Travis-CI test?`);
                    }

                    console.log("");
                    if (idx < (files.length - 1)) {
                        console.log("---");
                        console.log("");
                    }
                });
        });
}
