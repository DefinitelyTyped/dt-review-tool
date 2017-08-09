import * as path from "path";
import * as url from "url";

import * as github from "./github";
import * as GithubAPIv3 from "../github-api";
import * as npm from "npm";
import * as header from "definition-header";

export interface ReviewResult {
    parent: github.PRInfo;
    file: GithubAPIv3.PullRequest.File;
    baseHeader?: header.Result;
    authorAccounts: string[];
    unknownAuthors: header.model.Author[];
    message?: string;
}

function processAdded(reviewResult: ReviewResult): Promise<ReviewResult> {
    let comment = "";
    function log(text: string) {
        comment += text + "\n";
    }

    let info = reviewResult.parent;
    let file = reviewResult.file;

    let packageName = file.filename.split("/")[1] || "package-name";
    let npmPackageName = packageName.indexOf("__") !== -1
        ? `@${packageName.split("__").join("/")}` // 'bla__foo' on the file system -> '@bla/foo' on npm
        : packageName;
    let testFileNames = [`${packageName}-tests.ts`, `${packageName}-tests.tsx`];
    let testFileExists = info.files!.filter(f => {
        let basename = path.basename(f.filename);
        return testFileNames.indexOf(basename) !== -1;
    }).length !== 0;

    let content = info.contents[file.filename];
    let headerInfo = header.parse(content);
    if (headerInfo.success) {
        reviewResult.baseHeader = headerInfo;
    }

    return new Promise<ReviewResult>((resolve) => {
        npm.load(null as any, () => {
            (npm.commands.info as any)([npmPackageName], true, (err: any, result: any) => {
                let npmExists = false;
                let info: any;
                if (!err && reviewResult.baseHeader) {
                    info = result[Object.keys(result)[0]] || {};
                    if (info.homepage && reviewResult.baseHeader.value!.project[0].url) {
                        let infoUrl = url.parse(info.homepage);
                        let headerUrl = url.parse(reviewResult.baseHeader.value!.project[0].url);
                        if (infoUrl.host === headerUrl.host && infoUrl.path === headerUrl.path) {
                            // ignore protocol mismatch
                            npmExists = true;
                        }
                    }
                }

                log(`Checklist`);
                log(``);
                log(`* [${npmExists ? "X" : " "}] is correct [naming convention](http://definitelytyped.org/guides/contributing.html#naming-the-file)?`);
                if (npmExists) {
                    log(`  * https://www.npmjs.com/package/${npmPackageName} - ${info.homepage}`);
                } else {
                    log(`  * https://www.npmjs.com/package/${npmPackageName}`);
                    log(`  * http://bower.io/search/?q=${npmPackageName}`);
                    log(`  * others?`);
                }
                log(`* [${testFileExists ? "X" : " "}] has a [test file](http://definitelytyped.org/guides/contributing.html#tests)? (${testFileNames.join(" or ")})`);
                log(`* [ ] pass the Travis CI test?`);

                reviewResult.message = comment;

                resolve(reviewResult);
            });
        });
    });
}

function convertAuthorToAccount(author: header.model.Author): string[] | null {
    switch (author.url) {
        case "https://asana.com":
            return ["@pspeter3", "@vsiao"];
        case "http://phyzkit.net/":
            return ["@kontan"];
        case "http://ianobermiller.com":
            return ["@ianobermiller"];
        case "https://invent.life/":
            return ["@seanhess"];
        case "http://blog.gandjustas.ru":
            return ["@gandjustas"];
        case "http://www.esri.com":
            return ["@dasa"];
        case "http://devexpress.com/":
            return ["@Seteh"];
        case "https://github.com/a904guy/,http://a904guy.com":
            return ["@a904guy"];
        case "http://www.colsa.com/":
            return ["@ColsaCorp"];
        case "http://guido.io":
            return ["@gzuidhof"];
        case "http://raphael.atallah.me":
            return ["@devnixs"];
        case "https://github.com/ButterFaces/ButterFaces":
            return ["@larmic"];
        case "http://midnight-design.at/":
            return ["@MidnightDesign"];
        case "http://pspeter3.com":
            return ["@pspeter3"];
        case "http://dreampulse.de":
            return ["@dreampulse"];
        case "http://handsoncode.net/":
            return ["@swistach"];
        case "http://samchon.org":
            return ["@samchon"];
        case "http://www.tim-jonischkat.de":
            return ["@timjonischkat"];
        case "http://leancloud.cn":
            return ["@wujun4code"];
        case "http://alan.norbauer.com/":
            return ["@altano"];
        case "http://cs.toronto.edu/~wehr":
            return ["@DustinWehr"];
        default:
            return null;
    }
}

function convertInactiveAuthor(author: string): string {
    switch (author) {
        case "@benjaminjackman":
            return "@.benjaminjackman";
        case "@Bartvds":
        case "@bartvds":
            return "@.Bartvds";
        case "@job13er":
            return "@.job13er";
        default:
            return author;
    }
}

function processModified(reviewResult: ReviewResult): Promise<ReviewResult> {
    let comment = "";
    function log(text: string) {
        comment += text + "\n";
    }

    let info = reviewResult.parent;
    let file = reviewResult.file;

    let content = info.baseContents[file.filename];
    let headerInfo = header.parse(content);
    if (!headerInfo.success) {
        reviewResult.message = "can't parse definition header...";
        return Promise.resolve(reviewResult);
    }
    reviewResult.baseHeader = headerInfo;
    headerInfo.value!.authors.forEach(author => {
        if (reviewResult.parent.pr.user.html_url === author.url) {
            return;
        }

        let accountNames = convertAuthorToAccount(author);
        if (accountNames) {
            reviewResult.authorAccounts = reviewResult.authorAccounts.concat(accountNames);
            return;
        }

        let regexp1 = /https?:\/\/github.com\/(.+)\/?/;
        let regexp2 = /https?:\/\/([^.]+)\.github\.io\/?/;
        let reArray: string[] = regexp1.exec(author.url) || regexp2.exec(author.url) || [];
        let accountName = reArray[1];
        if (accountName) {
            reviewResult.authorAccounts.push(`@${accountName}`);
        } else {
            reviewResult.unknownAuthors.push(author);
        }
    });
    reviewResult.authorAccounts = reviewResult.authorAccounts.map(author => convertInactiveAuthor(author));

    let accountNames: string[] = ([] as string[]).concat(reviewResult.authorAccounts);

    reviewResult.unknownAuthors.forEach(author => {
        accountNames.push(`${author.name} (account can't be detected)`);
    });

    if (accountNames.length !== 0) {
        log(`to author${accountNames.length === 1 ? "" : "s"} (${accountNames.join(" ")}). Could you review this PR?`);
        log(":+1: or :-1:?");
    }

    log(``);
    log(`Checklist`);
    log(``);
    log(`* [ ] pass the Travis CI test?`);

    reviewResult.message = comment;

    return Promise.resolve(reviewResult);
}

function processRemoved(reviewResult: ReviewResult): Promise<ReviewResult> {
    reviewResult.message = "REMOVED!";

    return Promise.resolve(reviewResult);
}

export function generateComment(pr: github.PRInfoRequest): Promise<string[]> {
    return constructReviewResult(pr)
        .then(ts => ts.map(result => [`*${result.file.filename}*`, "", result.message].join("\n")));
}

export function constructReviewResult(pr: github.PRInfoRequest): Promise<ReviewResult[]> {
    return github
        .getPRInfo(pr)
        .then(info => {
            let ps = info.files
                .filter(file => /\.d\.ts(x)?$/.test(file.filename))
                .map(file => {
                    let reviewResult: ReviewResult = {
                        parent: info,
                        file: file,
                        authorAccounts: [],
                        unknownAuthors: [],
                    };

                    if (file.status === "modified") {
                        return processModified(reviewResult).then(async reviewResult => {
                            // If parsing fails for a file, fall back to index.d.ts's header
                            if (path.basename(file.filename) !== "index.d.ts" &&
                                reviewResult.message === "can't parse definition header...") {
                                let indexFilename = path.dirname(file.filename) + "/index.d.ts";
                                let indexReviewResult = await processModified({
                                    parent: info,
                                    file: { filename: indexFilename } as any,
                                    authorAccounts: [],
                                    unknownAuthors: [],
                                });

                                reviewResult.baseHeader = indexReviewResult.baseHeader;
                                reviewResult.authorAccounts = indexReviewResult.authorAccounts;
                                reviewResult.unknownAuthors = indexReviewResult.unknownAuthors;
                                reviewResult.message = indexReviewResult.message;
                            }

                            return reviewResult;
                        });
                    } else if (file.status === "added") {
                        return processAdded(reviewResult);
                    } else if (file.status === "removed") {
                        return processRemoved(reviewResult);
                    }

                    reviewResult.message = `unknown status: ${file.status}`;

                    return Promise.resolve(reviewResult);
                });
            return Promise.all<ReviewResult>(ps);
        });
}
