# Contributing to suspendable

If you want to contribute to `suspendable`, that's really great! To make the process of contributing smooth, here are the guidelines that you should follow:

- [Code of Conduct](#code-of-conduct)
- [Bugs](#bugs)
- [Feature requests](#feature-requests)
- [Creating an issue](#creating-an-issue)
- [Creating a pull request](#creating-a-pull-request)
- [Code expectations](#code-expectations)
- [Commit message guidelines](#commit-message-guidelines)

## Code of Conduct

To keep `suspendable` open and inclusive, please read and follow our [Code of Conduct](https://github.com/kyarik/suspendable/blob/main/CODE_OF_CONDUCT.md).

## Bugs

If you happen to find a bug in `suspendable`, you can report it by [creating an issue](#creating-an-issue).

When reporting a bug, you should explain in detail how it can be reproduced and show any relevant code. You should also specify the version of `suspendable` in which the bug occurs.

If you also know how to fix the bug, it would be great if you [create a pull request](#creating-a-pull-request) with the fix.

## Feature requests

If there's a feature that `suspendable` is missing and you think that it would be useful to have, you can [create an issue](#creating-an-issue) with the feature request.

If you want to implement a new feature, here's what you should do:

- If it's a _BIG_ feature, you should first [open an issue](#creating-an-issue) that describes the new feature so that we can have a discussion around it. Once we found an agreement, you can begin the implementation. When you're done, you should [open a pull request](#creating-a-pull-request) with your changes.
- If it's a _small_ feature, you can directly [open a pull request](#creating-a-pull-request) with your changes.

## Creating an issue

If you want to create an issue, you should first search the [existing open/close issues](https://github.com/kyarik/suspendable/issues) to see if there's already an issue for the problem you have or the feature you want to request. In that case, you can read the discussion and contribute to it.

Once you checked that there is no existing issue for your problem or feature request, you can create an issue by [filling this form](https://github.com/kyarik/suspendable/issues/new/choose).

## Creating a pull request

Here are the steps you should follow to create a pull request:

1. Search the [existing open/close pull requests](https://github.com/kyarik/suspendable/pulls) to see if there's already been an effort related to the changes you want to make. If there is, and it is still open or it was closed without merging, it probably makes little sense to create a duplicate PR.
1. Fork the `kyarik/suspendable` repository.
1. Clone the forked repository locally.
1. Go to the repo directory and run `npm install`.
1. Keep your `main` branch pointing at the `main` branch in the `kyarik/suspendable` repository:
   ```bash
   git remote add upstream https://github.com/kyarik/suspendable
   git fetch upstream
   git branch --set-upstream-to=upstream/main main
   ```
   This adds the original repository as a `remote` called `upstream`, fetches git info from `upstream`, and sets your local `main` branch to use the `upstream/main` branch whenever you run `git pull`.
1. Create a branch from `main` in which you will make your changes:

   ```bash
   git checkout -b your-branch-name main
   ```

1. Make your changes along with tests.
1. Make sure to follow the [code expectations](#code-expectations).
1. Run all checks:
   ```bash
   npm run checks
   ```
1. Commit your changes following the [commit message guidelines](#commit-message-guidelines).
1. Push your branch to GitHub:
   ```bash
   git push origin your-branch-name
   ```
1. Using the GitHub UI, create a pull request towards the `suspendable:main` branch. If we request changes in the PR, then:
   1. Make the requested changes.
   1. Re-run the checks.
   1. Push your changes.

Thank you for contributing to `suspendable`!

## Code expectations

There are some expectation that we have over the code in this repository, so please follow them:

- Write tests for every new feature or bug fix.
- Every change to the public API should be documented in the [README](https://github.com/kyarik/suspendable/blob/main/README.md) as well as in the source code by using [TSDoc](https://tsdoc.org/).

## Commit message guidelines

Commit messages should follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#summary).

The allowed commit types are based on [the Angular convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines):

- **build**: Changes that affect the build system or dependencies
- **chore**: Changes that do not belong to any of the other types, like changing GitHub issue/PR templates
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- **test**: Adding missing tests or correcting existing tests

Here's an example commit message:

```
fix: make max buffer size refer to byte length not string length
```

If a commit reverts a previous commit, it should start with `revert: `, followed by the header of the reverted commit. The body of the commit should say `This reverts commit <HASH>`, where `<HASH>` is the SHA of the commit being reverted. Example:

```
revert: build: update dev dependencies

This reverts commit 4259fb7cdae915ac529f5b89a92f059391aff43b
```
