# Sorted PR Checks

This GitHub Actions reusable workflow and action address [the limitation of the GitHub UI](https://github.com/orgs/community/discussions/7885), which does not sort or group Pull Request check results. The solution proposed here is to post a sticky comment to the Pull Request with a sorted and, optionally, grouped list of checks. This makes it easier to find failed GitHub Actions jobs at a glance.

If you're interested in this solution, you might also want to check out [Refined GitHub Extension](https://github.com/refined-github/refined-github). The extension updates the GitHub UI with many long-awaited improvements. In particular, it does sort Pull Request check results by their status.

## What does it do?

1. Retrieve the checks from the pull request
2. Render the comment with PR checks nicely formatted
3. Create or update (if it already exists) the comment on a pull request

Note that the templates we provide are configured to comment with _Some checks have not completed yet_ until all the checks are complete. We found this to be a more reliable solution since we cannot easily listen to when individual checks are created/updated.

## How can I add it to my repository?

Just add the following workflow to your repository. The workflow uses the reusable workflow defined in this repository. It is triggered whenever a workflow that produces PR checks starts and finishes.

```yaml
name: Comment with sorted PR checks

on:
  workflow_run:
    workflows:
      # List the workflows triggered on pull_request in your repository here
      - TODO
    types:
      - requested
      - completed

permissions:
  pull-requests: write

concurrency:
  group: ${{ github.workflow }}-${{ github.event.workflow_run.id }}
  cancel-in-progress: true

jobs:
  comment:
    if: github.event.workflow_run.event == 'pull_request' || github.event.workflow_run.event == 'pull_request_target'
    uses: ipdxco/sorted-pr-checks/.github/workflows/comment.yml@v1
```

If you use externally created PR checks in your repository, you might also consider triggering the workflow on events like _workflow_run_ or _workflow_suite_. Note that those events are not triggered when created with the default GitHub token. That's why we suggest using _workflow_run_ event trigger instead.

If you want to perform other actions alongside posting the comment, the solution is also available as an action. You can use it as follows.

```yaml
steps:
  - uses: ipdxco/sorted-pr-checks@v1
```

## What templates are available?

The [templates](./templates) directory contains all the available templates. They follow the _lodash.template_ syntax. You can choose one of the ready-made templates or implement one yourself!

### sorted_by_result (default)

<img width="905" alt="Screenshot 2024-04-08 at 12 58 28" src="https://github.com/ipdxco/sorted-pr-checks/assets/6688074/bf1e256f-4c2d-430e-879f-28ff9b6b5f80">

### grouped_by_result

<img width="902" alt="Screenshot 2024-04-08 at 12 58 42" src="https://github.com/ipdxco/sorted-pr-checks/assets/6688074/92ae49b6-fdcc-4e74-87db-ba101a28dcdf">

### unsuccessful_only

<img width="903" alt="Screenshot 2024-04-11 at 13 14 17" src="https://github.com/ipdxco/sorted-pr-checks/assets/6688074/4a416720-d93b-4fd5-a983-48d1515a9504">


## How do I switch between the templates?

Here are all the configuration options. The action and the reusable workflow share the exact same inputs.

```yaml
with:
  # The repository to comment on
  repository: '${{ github.repository }}'
  # The pull request number
  pull_number: ''
  # The template name or a lodash style template to use for the comment
  template: 'sorted_by_result'
  # The identifier to use for the sticky comment
  identifier: '${{ github.workflow }}-${{ github.job }}'
  # The GitHub token
  token: '${{ github.token }}'
```

---
