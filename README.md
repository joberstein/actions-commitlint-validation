# Commitlint Validation (Github Actions)

This Github action uses commitlint to validate commits on different events for a repository. A caller can extend the base validation configuration by providing custom commitlint config.

## Continuous Integration

The Github Workflow for this repo automatically commits up-to-date dist based on the committed source code (src and package-lock.json).

The deploy script (./deploy.sh) will deploy to the 'release' breanch, which is orphaned so that it's history and contents is distinct from the 'master' branch, which contains all of the original source code.

Callers wishing to use this action simply need to reference this repo per the standard convention (i.e. joberstein/actions-commitlint-validation@v1.0.1).

# Scenarios

Validate commits for events like:

 - Push - validates all commits on the branch that was pushed to (tag pushes are not supported)
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
# The source of pull request that triggered this workflow (required for pull requests).
# Example: main
# Default: ${{ github.base_ref }}
base_ref: string

# The destination of the pull request that triggered this workflow (required for pull requests).
# Example: feature
# Default: ${{ github.head_ref }}
head_ref: string

# The Github SHA of the event that triggered this workflow.
# Example: 42402264176cf7d82c9811c97707133c176b2f63
# Default: ${{ github.sha }}
target_ref: string

# The name of the ref (branch or tag) of the event that triggered this workflow (required for pushes).
# Example: main
# Default: ${{ github.ref_name }}
ref_name: string

# The ref type of the event that triggered this workflow (required for pushes). Only branch refs are validated.
# Example: branch
# Default: ${{ github.ref_type }}
ref_type: string

# An optional newline-separated list of commitlint-config npm packages to install.
# Example: |
#   conventional-changelog
#   @joberstein12/commitlint-config
# Default: ''
extra_config: string
```

# License

This project is released under the [MIT License](LICENSE).