/* tslint:disable:no-require-imports */
import Client = require("github");
import path = require("path");
import * as _ from "lodash";
/* tslint:enable:no-require-imports */

export interface PRInfo {
    pr: GithubAPIv3.PullRequest;
    files: GithubAPIv3.PullRequest.File[];
    contents: { [path: string]: string; };
    baseContents: { [path: string]: string; };
}

export interface PRInfoRequest {
    owner?: string;
    repo?: string;
    number: number;
}

export async function getPRInfo(req: PRInfoRequest): Promise<PRInfo> {
    let github = new Client({
        // debug: true
    });
    github.authenticate({
        type: "oauth",
        key: "6dfc3629feef934dadd0",
        secret: "7524eed1afd84b09f08f1439e7e08860add37c09",
    });

    let owner = req.owner || "DefinitelyTyped";
    let repo = req.repo || "DefinitelyTyped";

    // Get the pull request
    let pullRequestResponse = await github.pullRequests.get({
        owner: owner,
        repo: repo,
        number: req.number,
    });
    let info: PRInfo = {
        pr: pullRequestResponse.data,
        files: [],
        contents: {},
        baseContents: {},
    };

    // Get the pull request's files
    let pullRequestFilesResponse = await github.pullRequests.getFiles({
        owner: owner,
        repo: repo,
        number: req.number,
    });
    info.files = pullRequestFilesResponse.data;
    info.files = info.files.filter(file => {
        switch (path.extname(file.filename)) {
            case ".ts":
            case ".tsx":
                return true;
            default:
                return false;
        }
    });

    // Get the pull request's files' contents
    let blobRequests = info.files.map(file => {
        return github.gitdata.getBlob({
            owner: owner,
            repo: repo,
            sha: file.sha,
        }).then((res: GithubAPIv3.Response<GithubAPIv3.GitData.Blob>) => {
            if (res.data.encoding === "utf-8") {
                info.contents[file.filename] = res.data.content;
            } else {
                let b = new Buffer(res.data.content, "base64");
                info.contents[file.filename] = b.toString();
            }
        });
    });
    await Promise.all(blobRequests);

    // Get the pull request's files' base contents
    let fileContentsRequests = info.files.filter(file => file.status === "modified").map(file => {
        return github.repos.getContent({
            owner: owner,
            repo: repo,
            path: file.filename,
            ref: info.pr.base.ref,
        }).then((res: GithubAPIv3.Response<GithubAPIv3.Repository.FileContents>) => {
            if (res.data.encoding === "utf-8") {
                info.baseContents[file.filename] = res.data.content;
            } else {
                let b = new Buffer(res.data.content, "base64");
                info.baseContents[file.filename] = b.toString();
            }
        });
    });
    await Promise.all(fileContentsRequests);

    // Always download index.d.ts for a package to reference its header if necessary
    let additionalFiles: string[] = [];
    let filesByPackage = _.groupBy(info.files, file => {
        let parts = path.dirname(file.filename).split("/");
        return _.last(parts);
    });
    _.forEach(filesByPackage, pkg => {
        let index = pkg.find(file => path.basename(file.filename) === "index.d.ts");
        if (!index) {
            let filename = path.dirname(_.first(pkg)!.filename) + "/index.d.ts";
            additionalFiles.push(filename);
        }
    });
    let additionalFilesContentsRequests = additionalFiles.map(filename => {
        return github.repos.getContent({
            owner: owner,
            repo: repo,
            path: filename,
            ref: info.pr.base.ref,
        }).then((res: GithubAPIv3.Response<GithubAPIv3.Repository.FileContents>) => {
            if (res.data.encoding === "utf-8") {
                info.baseContents[filename] = res.data.content;
            } else {
                let b = new Buffer(res.data.content, "base64");
                info.baseContents[filename] = b.toString();
            }
        });
    });
    await Promise.all(additionalFilesContentsRequests);

    return info;
}
