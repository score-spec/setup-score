# setup-paws

This action sets up PAWS environment for use in GitHub actions.

It downloads and caches a version of PAWS CLI tools and adds them to PATH.

# Usage

See [action.yml](action.yml)

## Basic

```yaml
steps:
  - uses: actions/setup-paws@v1
    with:
      paws-version: '1.0'
  - run: paws-humanitec version
```
