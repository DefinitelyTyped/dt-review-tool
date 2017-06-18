/* tslint:disable:no-require-imports */
import Client = require("github");
/* tslint:enable:no-require-imports */

export interface PRInfo {
    pr: GithubAPIv3.PullRequest;
    files: GithubAPIv3.PullRequest.File[] | null;
    contents: { [path: string]: string; };
    baseContents: { [path: string]: string; };
}

export interface PRInfoRequest {
    owner?: string;
    repo?: string;
    number: number;
}

export function getPRInfo(req: PRInfoRequest): Promise<PRInfo> {
    let github = new Client({
        // debug: true
    });
    github.authenticate({
        type: "oauth",
        key: "6dfc3629feef934dadd0",
        secret: "7524eed1afd84b09f08f1439e7e08860add37c09",
    });

    return new Promise<PRInfo>((resolve, reject) => {
        github.pullRequests.get({
            owner: req.owner || "DefinitelyTyped",
            repo: req.repo || "DefinitelyTyped",
            number: req.number,
        }, (err: any, res: GithubAPIv3.Response<GithubAPIv3.PullRequest>) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    pr: res.data,
                    files: null,
                    contents: {},
                    baseContents: {},
                });
            }
        });
    })
        .then(info => {
            return new Promise<PRInfo>((resolve, reject) => {
                github.pullRequests.getFiles({
                    owner: req.owner || "DefinitelyTyped",
                    repo: req.repo || "DefinitelyTyped",
                    number: req.number,
                }, (err: any, res: GithubAPIv3.Response<GithubAPIv3.PullRequest.File[]>) => {
                    if (err) {
                        reject(err);
                    } else {
                        info.files = res.data;
                        resolve(info);
                    }
                });
            });
        }).then(info => {
            let promises = info.files!.map(file => {
                return new Promise<PRInfo>((resolve, reject) => {
                    github.gitdata.getBlob({
                        owner: req.owner || "DefinitelyTyped",
                        repo: req.repo || "DefinitelyTyped",
                        sha: file.sha,
                    }, (err: any, res: GithubAPIv3.Response<GithubAPIv3.GitData.Blob>) => {
                        if (err) {
                            reject(err);
                        } else if (res.data.encoding === "utf-8") {
                            info.contents[file.filename] = res.data.content;
                            resolve(info);
                        } else {
                            let b = new Buffer(res.data.content, "base64");
                            info.contents[file.filename] = b.toString();
                            resolve(info);
                        }
                    });
                });
            });
            return Promise.all(promises).then(() => info);
        }).then(info => {
            let promises = info.files!.filter(file => file.status === "modified").map(file => {
                return new Promise<PRInfo>((resolve, reject) => {
                    github.repos.getContent({
                        owner: "DefinitelyTyped",
                        repo: "DefinitelyTyped",
                        path: file.filename,
                        ref: info.pr.base.ref,
                    }, (err: any, res: GithubAPIv3.Response<GithubAPIv3.Repository.FileContents>) => {
                        if (err) {
                            reject(err);
                        } else if (res.data.encoding === "utf-8") {
                            info.baseContents[file.filename] = res.data.content;
                            resolve(info);
                        } else {
                            let b = new Buffer(res.data.content, "base64");
                            info.baseContents[file.filename] = b.toString();
                            resolve(info);
                        }
                    });
                });
            });
            return Promise.all(promises).then(() => info);
        });
}
