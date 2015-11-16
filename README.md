# DefinitelyTyped pull request review bot

## Functions

1. present a self-check list.
2. mention to authors.

## How to use

```
$ git clone git@github.com:DefinitelyTyped/dt-review-bot.git
$ cd dt-review-bot
$ npm install
$ grunt setup default
$ ./bin/dtreview --help
  Usage: dtreview [--] <prNumber>
$ ./bin/dtreview 1982
*pegjs/pegjs.d.ts*

check list

* [ ] is collect [naming convention](http://definitelytyped.org/guides/contributing.html#naming-the-file)?
  * https://www.npmjs.com/package/pegjs
  * http://bower.io/search/?q=pegjs
  * others?
* [X] has a [test file](http://definitelytyped.org/guides/contributing.html#tests)? (pegjs/pegjs-tests.ts or others)
* [ ] pass the Travis CI test?

# copy & paste to pull request!
```
