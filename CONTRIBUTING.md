# Contributing to LOCKON Workspace

First off, thank you for considering contributing to LOCKON Workspace! It's people like you that make this project great.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if it has already been reported. When you are creating a bug report, please include as many details as possible:

*   Use a clear and descriptive title.
*   Describe the exact steps which reproduce the problem.
*   Provide specific examples to demonstrate the steps.
*   Describe the behavior you observed after following the steps and point out what exactly is the problem with that behavior.
*   Explain which behavior you expected to see instead and why.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please provide:

*   A clear and descriptive title.
*   A step-by-step description of the suggested enhancement.
*   Specific examples to demonstrate the steps.
*   A description of the current behavior and how your suggestion differs from it.
*   An explanation of why this enhancement would be useful.

### Pull Requests

1.  Fork the repo and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes.
4.  Make sure your code follows the existing style guidelines.
5.  Issue that pull request!

## Local Development

Please refer to the `README.md` for instructions on how to set up your local development environment using Docker Compose.

The project consists of:
*   Mattermost WebApp customizations (`source/mattermost/webapp/channels/src/`)
*   Channel Tabs Plugin (`source/lockon-channel-tabs/`)
*   Home Sidebar Plugin (`source/lockon-home-tab/`)

When making changes to the Mattermost source, you will need to rebuild the Docker image or run the local development server.

## Licensing

By contributing your code, you agree to license your contribution under the terms outlined in the `LICENSE` file.
