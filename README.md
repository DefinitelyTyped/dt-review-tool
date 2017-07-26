# DefinitelyTyped pull request review bot

## Functions

1. Present a self-check list.
2. Mention authors.

## How to use

```
$ git clone git@github.com:DefinitelyTyped/dt-review-tool.git
$ cd dt-review-bot
$ npm install
$ grunt
$ npm start -- --help

  Usage: dtreview [options] [--] <prNumber>

  Options:

    --owner <owner>  target owner (repository owner)
    --repo <repo>    target repository
    
$ ./bin/dtreview 18409

*types/saml20/index.d.ts*

Checklist

* [X] is correct [naming convention](http://definitelytyped.org/guides/contributing.html#naming-the-file)?
  * https://www.npmjs.com/package/saml20 - https://github.com/leandrob/saml20#readme
* [X] has a [test file](http://definitelytyped.org/guides/contributing.html#tests)? (saml20-tests.ts or saml20-tests.tsx)
* [ ] pass the Travis CI test?

# copy & paste to pull request!
```
