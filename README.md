# setup-score

This action sets up Score environment for use in GitHub actions.

It downloads and caches a version of Score CLI tools and adds them to PATH.

# Usage

See [action.yml](action.yml)

## Basic

```yaml
steps:
  - uses: actions/setup-score@v2
    with:
      file: score-humanitec
      version: '0.1.0'
  - run: score-humanitec --version
```
