declare namespace GithubAPIv3 {
    interface Response<T> {
        data: T;
        meta: Response.Meta;
    }

    namespace Response {
        interface Meta {
            etag: string;
            "last-modified": string;
            status: string;
            "x-github-media-type": string;
            "x-github-request-id": string;
            "x-ratelimit-limit": string;
            "x-ratelimit-remaining": string;
            "x-ratelimit-reset": string;
        }
    }

    interface User {
        avatar_url: string;
        events_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        gravatar_id: string;
        html_url: string;
        id: number;
        login: string;
        organizations_url: string;
        received_events_url: string;
        repos_url: string;
        site_admin: boolean;
        starred_url: string;
        subscriptions_url: string;
        type: string;
        url: string;
    }

    interface Commit {
        label: string;
        ref: string;
        repo: Repository;
        sha: string;
        user: User;
    }

    interface Link {
        href: string;
    }

    interface Installation {
        id: number;
    }

    interface Milestone {
        closed_at: string;
        closed_issues: number;
        created_at: string;
        creator: User;
        description: string;
        due_on: string;
        html_url: string;
        id: number;
        labels_url: string;
        number: number;
        open_issues: number;
        state: string;
        title: string;
        updated_at: string;
        url: string;
    }

    interface PullRequestEvent {
        action: "assigned" | "unassigned" | "review_requested" | "review_request_removed" | "labeled" | "unlabeled" | "opened" | "edited" | "closed" | "reopened";
        changes?: any;
        installation: Installation;
        number: number;
        pull_request: PullRequest;
        repository: Repository;
        sender: User;
    }

    interface PullRequest {
        _links: PullRequest.Links;
        additions: number;
        assignee?: User;
        base: Commit;
        body: string;
        changed_files: number;
        closed_at?: string;
        comments: number;
        comments_url: string;
        commits: number;
        commits_url: string;
        created_at: string;
        deletions: number;
        diff_url: string;
        head: Commit;
        html_url: string;
        id: number;
        issue_url: string;
        locked: boolean;
        maintainer_can_modify?: boolean;
        merge_commit_sha?: string;
        mergeable: boolean | null;
        mergeable_state?: string;
        merged: boolean;
        merged_at?: string;
        merged_by?: User;
        milestone?: Milestone;
        number: number;
        patch_url: string;
        review_comment_url: string;
        review_comments?: number;
        review_comments_url: string;
        state: string;
        statuses_url: string;
        title: string;
        updated_at: string;
        url: string;
        user: User;
    }

    namespace PullRequest {
        interface File {
            sha: string;
            filename: string;
            status: string;
            additions: number;
            deletions: number;
            changes: number;
            blob_url: string;
            raw_url: string;
            contents_url: string;
            patch: string;
        }

        interface Links {
            comments: Link;
            commits: Link;
            html: Link;
            issue: Link;
            review_comment: Link;
            review_comments: Link;
            self: Link;
            statuses: Link;
        }
    }

    namespace GitData {
        interface Blob {
            content: string;
            encoding: string;
            sha: string;
            size: number;
            url: string;
        }
    }

    interface Repository {
        archive_url: string;
        assignees_url: string;
        blobs_url: string;
        branches_url: string;
        clone_url: string;
        collaborators_url: string;
        comments_url: string;
        commits_url: string;
        compare_url: string;
        contents_url: string;
        contributors_url: string;
        created_at: string;
        default_branch: string;
        description: string;
        downloads_url: string;
        events_url: string;
        fork: boolean;
        forks: number;
        forks_count: number;
        forks_url: string;
        full_name: string;
        git_commits_url: string;
        git_refs_url: string;
        git_tags_url: string;
        git_url: string;
        has_downloads: boolean;
        has_issues: boolean;
        has_pages: boolean;
        has_wiki: boolean;
        homepage?: any;
        hooks_url: string;
        html_url: string;
        id: number;
        issue_comment_url: string;
        issue_events_url: string;
        issues_url: string;
        keys_url: string;
        labels_url: string;
        language?: any;
        languages_url: string;
        merges_url: string;
        milestones_url: string;
        mirror_url?: any;
        name: string;
        notifications_url: string;
        open_issues: number;
        open_issues_count: number;
        owner: User;
        private: boolean;
        pulls_url: string;
        pushed_at: string;
        releases_url: string;
        size: number;
        ssh_url: string;
        stargazers_count: number;
        stargazers_url: string;
        statuses_url: string;
        subscribers_url: string;
        subscription_url: string;
        svn_url: string;
        tags_url: string;
        teams_url: string;
        trees_url: string;
        updated_at: string;
        url: string;
        watchers: number;
        watchers_count: number;
    }

    namespace Repository {
        type Contents = FileContents | DirectoryContents | SymlinkContents | SubmoduleContents;

        interface FileContents {
            _links: FileContents.Links;
            content: string;
            download_url: string;
            encoding: string;
            git_url: string;
            html_url: string;
            name: string;
            path: string;
            sha: string;
            size: number;
            type: "file";
            url: string;
        }

        namespace FileContents {
            interface Links {
                git: string;
                html: string;
                self: string;
            }
        }

        type DirectoryContents = Array<FileContents | DirectoryContents.DirContents | SymlinkContents | DirectoryContents.SubmoduleContents>;

        namespace DirectoryContents {
            interface DirContents {
                _links: DirContents.Links;
                download_url: null;
                git_url: string;
                html_url: string;
                name: string;
                path: string;
                sha: string;
                size: number;
                type: "dir";
                url: string;
            }

            namespace DirContents {
                interface Links {
                    git: string;
                    html: string;
                    self: string;
                }
            }

            interface SubmoduleContents extends SubmoduleContents.Base {
                type: "file";
            }
        }

        interface SymlinkContents {
            _links: SymlinkContents.Links;
            download_url: string;
            git_url: string;
            html_url: string;
            name: string;
            path: string;
            sha: string;
            size: number;
            target: string;
            type: "symlink";
            url: string;
        }

        namespace SymlinkContents {
            interface Links {
                git: string;
                html: string;
                self: string;
            }
        }

        interface SubmoduleContents extends SubmoduleContents.Base {
            type: "submodule";
        }

        namespace SubmoduleContents {
            interface Base {
                _links: Links;
                download_url: null;
                git_url: string | null;
                html_url: string | null;
                name: string;
                path: string;
                sha: string;
                size: number;
                submodule_git_url: string;
                url: string;
            }

            interface Links {
                git: string | null;
                html: string | null;
                self: string;
            }
        }
    }
}
