import * as github from "./github";
import * as header from "definition-header";

export function generateComment(pr: github.PRInfoRequest): Promise<string[]> {
    "use strict";

    return github
        .getPRInfo(pr)
        .then(info => {
            return info.files
                .filter(file => /\.d\.ts(x)?$/.test(file.filename))
                .map((file, idx, files) => {
                    let comment = "";
                    function log(text: string) {
                        comment += text + "\n";
                    }

                    log(`*${file.filename}*`);
                    log("");

                    if (file.status === "modified") {
                        let content = info.baseContents[file.filename];
                        let headerInfo = header.parse(content);
                        if (!headerInfo.success) {
                            log("!!! TODO !!!");
                            return;
                        }
                        let accountNames = headerInfo.value.authors.map(author => {
                            let regexp = /https?:\/\/github.com\/(.*)\/?/;
                            let reArray: string[] = regexp.exec(author.url) || [];
                            let accountName = reArray[1];
                            if (accountName) {
                                return `@${accountName}`;
                            } else {
                                return `${author.name} (account can't detected)`;
                            }
                        });

                        if (accountNames.length !== 0) {
                            log(`to author${accountNames.length === 1 ? "" : "s"}(${accountNames.join(" ") }). could you review this PR?`);
                            log(":+1: or :-1:?");
                        }

                        log(``);
                        log(`check list`);
                        log(``);
                        log(`* [ ] pass the Travic-CI test?`);

                    } else if (file.status === "added") {
                        let packageName = file.filename.substr(0, file.filename.indexOf("/"));
                        let testFileNames = [file.filename.substr(0, file.filename.length - 5) + "-tests.ts"];
                        testFileNames[1] = testFileNames[0] + "x";
                        let testFileExists = info.files.filter(file => testFileNames.indexOf(file.filename) !== -1).length !== 0;

                        log(`check list`);
                        log(``);
                        log(`* [ ] is collect [naming convention](http://definitelytyped.org/guides/contributing.html#naming-the-file)?`);
                        log(`  * https://www.npmjs.com/package/${packageName}`);
                        log(`  * http://bower.io/search/?q=${packageName}`);
                        log(`  * others?`);
                        log(`* [${testFileExists ? "X" : " "}] has a [test file](http://definitelytyped.org/guides/contributing.html#tests)? (${testFileNames.join(" or ") })`);
                        log(`* [ ] pass the Travis-CI test?`);
                    }

                    return comment;
                });
        });
}
