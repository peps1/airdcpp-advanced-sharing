# airdcpp-advanced-sharing [![GitHub Actions][build-badge]][build] [![npm package][npm-badge]][npm] [![npm downloads][npm-dl-badge]][npm] [![codecov][coverage-badge]][coverage]

Extension advanced sharing options, batch hashing with stop or resume option. Filessytem watcher to refresh on change is planned.

- [Bug tracker](https://github.com/peps1/airdcpp-advanced-sharing/issues)
- [Changelog](https://github.com/peps1/airdcpp-advanced-sharing/blob/master/CHANGELOG.md)

## Notes

* Depending on the storage performance the refresh process can overshoot the queue limit a bit before the the extension receives the information about the current hash queue and can send a stop to the refresh process.

## Available Commands

| Command | Description | Visibility |
| :---    | :---        | :---       |
| /stophash | Stop all running hashers and clear refresh queue | |
| /tasks | List all running refresh tasks | |
| /aborttask TASK_ID | Abort task with the provided task id | |


## Resources

- [AirDC++ Web API reference](https://airdcpp.docs.apiary.io/)

[build-badge]: https://github.com/peps1/airdcpp-advanced-sharing/workflows/build/badge.svg
[build]: https://github.com/peps1/airdcpp-advanced-sharing/actions

[npm-badge]: https://img.shields.io/npm/v/airdcpp-advanced-sharing.svg?style=flat-square
[npm]: https://www.npmjs.org/package/airdcpp-advanced-sharing
[npm-dl-badge]: https://img.shields.io/npm/dt/airdcpp-advanced-sharing?label=npm%20downloads&style=flat-square

[coverage-badge]: https://codecov.io/gh/peps1/airdcpp-advanced-sharing/branch/master/graph/badge.svg
[coverage]: https://codecov.io/gh/peps1/airdcpp-advanced-sharing