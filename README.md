# Commitlint Validation (Github Actions)

This Github action uses commitlint to validate commits on different events for a repository. A caller can extend the base validation configuration by providing custom commitlint config.

## Continuous Integration

The Github Workflow for this repo automatically commits up-to-date dist and node_modules based on the committed source code (src and package-lock.json).

# Scenarios

Validate commits for events like:

 - Push - validates the commit that was pushed (e.g. to a branch)
 - Pull Request - validates all of the commits in a given pull request

# Usage

## Simple Example

```yaml
- name: Validate Commits
  uses: joberstein/actions-commitlint-validation@v1.0.0
  with:
    extra_config: @joberstein12/commitlint-config
```

## Available Arguments

```yaml
# The source of pull request that triggered this workflow (populated by default for pull requests).
# Example: main
# Default: ${{ github.base_ref }}
base_ref: string

# The destination of the pull request that triggered this workflow (populated by default for pull requests).
# Example: feature
# Default: ${{ github.head_ref }}
head_ref: string

# The Github SHA of the event that triggered this workflow.
# Example: 42402264176cf7d82c9811c97707133c176b2f63
# Default: ${{ github.sha }}
target_ref: string

# An optional newline-separated list of commitlint-config npm packages to install.
# Example: |
#   conventional-changelog
#   @joberstein12/commitlint-config
# Default: ''
extra_config: string
```

# License

This project is released under the [MIT License](LICENSE).