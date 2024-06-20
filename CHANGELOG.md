# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [2.0.0] - 2024-06-20
### Added
- Added `pull_number` inference from the `workflow_run` event context

### Changed
- Removed the default value for the `pull_number` input

## [1.0.2] - 2024-04-09
### Added
- Added the `unsuccessful_only` template

## [1.0.1] - 2024-04-09
### Fixed
- Templates can now be rendered even if a check is not related to a workflow run

## [1.0.0] - 2024-04-08
### Added
- Created the v1 of the Sorted PR Checks action and reusable workflow
