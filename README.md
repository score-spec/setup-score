# setup-score

This action sets up Score environment for use in GitHub actions.

It downloads and caches a version of Score CLI tools and adds them to PATH.

# Usage

See [action.yaml](action.yaml)

## Basic

```yaml
steps:
  - uses: score-spec/setup-score@v2
    with:
      file: score-humanitec
      version: latest
      token: ${{ secrets.GITHUB_TOKEN }}
  - run: score-humanitec --version
```

> **Note:** `token` should be set when the `latest` version is used. It is required by the action to pull the latest release details via GitHub API, and the token provided should [have contents: read](https://docs.github.com/en/rest/overview/permissions-required-for-github-apps?apiVersion=2022-11-28#contents) permission to fetch data from the `GitHub.com`.
