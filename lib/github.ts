/// <reference path="../github.d.ts" />
/// <reference path="../node_modules/definition-header/dist/index.d.ts" />

import Client = require("github");

export interface PRInfo {
    pr: PullRequest;
    files: PullRequestFile[];
    contents: { [path: string]: string };
}

export interface PRInfoRequest {
    user?: string;
    repo?: string;
    number: number;
}

export interface PullRequest {

}

export interface PullRequestFile {
    filename: string;
    status: string;
}

export function getPRInfo(req: PRInfoRequest): Promise<PRInfo> {
    var github = new Client({
        version: "3.0.0",
        // debug: true
    });

    return new Promise<PRInfo>((resolve, reject) => {
        github.pullRequests.get({
            user: req.user || "borisyankov",
            repo: req.repo || "DefinitelyTyped",
            number: req.number
        }, function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        pr: res,
                        files: null,
                        contents: {}
                    });
                }
            });
    })
        .then(info => {
        return new Promise<PRInfo>((resolve, reject) => {
            github.pullRequests.getFiles({
                user: req.user || "borisyankov",
                repo: req.repo || "DefinitelyTyped",
                number: req.number
            }, function(err, res) {
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
                github.repos.getContent({
                    user: req.user || "borisyankov",
                    repo: req.repo || "DefinitelyTyped",
                    path: file.filename
                }, function(err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            var b = new Buffer(res.content, "base64");
                            info.contents[file.filename] = b.toString();
                            resolve(info);
                        }
                    });
            });
        });
        return Promise.all(promises).then(() => info);
    });
}
