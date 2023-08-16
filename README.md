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
  - run: score-humanitec --version
```
