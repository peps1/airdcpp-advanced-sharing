# Changelog

## [v1.0.0-beta.3](https://github.com/peps1/airdcpp-advanced-sharing/tree/v1.0.0-beta.3) (2020-10-20)
[Full git log](https://github.com/peps1/airdcpp-advanced-sharing/compare/v1.0.0-beta.2...v1.0.0-beta.3)

### Changed / fixed
* Auto-resume was rewritten, it was actually not working in beta.2

## [v1.0.0-beta.2](https://github.com/peps1/airdcpp-advanced-sharing/tree/v1.0.0-beta.2) (2020-10-18)
[Full git log](https://github.com/peps1/airdcpp-advanced-sharing/compare/v1.0.0-beta.1...v1.0.0-beta.2)

### Added
* new command `/listv` - List all available virtual paths

### Changed
* removed command `/fullrefresh` - the `/refresh` command without arguments can be used
* hopefully better handling of the hash_stats listener

## [v1.0.0-beta.1](https://github.com/peps1/airdcpp-advanced-sharing/tree/v1.0.0-beta.1) (2020-10-11)
[Full git log](https://github.com/peps1/airdcpp-advanced-sharing/compare/5918334e8dec8cfcb9c639583a2f24bc9b6a5aa0...v1.0.0-beta.1)

### Initial release

* Set refresh queue limit and auto stop refresh when that limit is reached
* Auto resume when hash queue finished (Experimental)

### Commands
* `/stophash` - Command to stop all current hashers and clear the refresh queue
* `/tasks` - List all running refresh tasks
* `/aborttask TASK_ID` - Abort task with the provided task id
* `/refresh VIRTUAL_PATH` - Refresh the provided path
* `/fullrefresh` - Refresh all shares
* `/pausehash` - Pause hashing
* `/resumehash` - Resume hashing
