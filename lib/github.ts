/// <reference path="../github.d.ts" />
/// <reference path="../node_modules/definition-header/dist/index.d.ts" />

/* tslint:disable:no-require-imports */
import Client = require("github");
/* tslint:enable:no-require-imports */

export interface PRInfo {
    pr: PullRequest;
    files: PullRequestFile[];
    contents: { [path: string]: string; };
    baseContents: { [path: string]: string; };
}

export interface PRInfoRequest {
    user?: string;
    repo?: string;
    number: number;
}

export interface PullRequest {

}

export interface PullRequestFile {
    sha: string;
    filename: string;
    status: string;
}

export function getPRInfo(req: PRInfoRequest): Promise<PRInfo> {
    "use strict";
    var github = new Client({
        version: "3.0.0"
        // debug: true
    });
    github.authenticate({
        type: "oauth",
        key: "6dfc3629feef934dadd0",
        secret: "7524eed1afd84b09f08f1439e7e08860add37c09"
    });

    return new Promise<PRInfo>((resolve, reject) => {
        github.pullRequests.get({
            user: req.user || "DefinitelyTyped",
            repo: req.repo || "DefinitelyTyped",
            number: req.number
        }, (err: any, res: any) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    pr: res,
                    files: null,
                    contents: {},
                    baseContents: {}
                });
            }
        });
    })
        .then(info => {
            return new Promise<PRInfo>((resolve, reject) => {
                github.pullRequests.getFiles({
                    user: req.user || "DefinitelyTyped",
                    repo: req.repo || "DefinitelyTyped",
                    number: req.number
                }, (err: any, res: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        info.files = res;
                        resolve(info);
                    }
                });
            });
        }).then(info => {
            var promises = info.files.filter(file => file.status === "modified").map(file => {
                return new Promise<PRInfo>((resolve, reject) => {
                    github.gitdata.getBlob({
                        user: req.user || "DefinitelyTyped",
                        repo: req.repo || "DefinitelyTyped",
                        sha: file.sha
                    }, (err: any, res: any) => {
                        if (err) {
                            reject(err);
                        } else if (res.encoding === "utf-8") {
                            info.contents[file.filename] = res.content;
                            resolve(info);
                        } else {
                            var b = new Buffer(res.content, "base64");
                            info.contents[file.filename] = b.toString();
                            resolve(info);
                        }
                    });
                });
            });
            return Promise.all(promises).then(() => info);
        }).then(info => {
            var promises = info.files.filter(file => file.status === "modified").map(file => {
                return new Promise<PRInfo>((resolve, reject) => {
                    github.repos.getContent({
                        user: "DefinitelyTyped",
                        repo: "DefinitelyTyped",
                        path: file.filename
                    }, (err: any, res: any) => {
                        if (err) {
                            reject(err);
                        } else if (res.encoding === "utf-8") {
                            info.baseContents[file.filename] = res.content;
                            resolve(info);
                        } else {
                            var b = new Buffer(res.content, "base64");
                            info.baseContents[file.filename] = b.toString();
                            resolve(info);
                        }
                    });
                });
            });
            return Promise.all(promises).then(() => info);
        });
}
