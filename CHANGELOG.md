# Changelog

## [v1.0.0](https://github.com/peps1/airdcpp-advanced-sharing/tree/v1.0.0) (2020-X-XX)
[Full git log](https://github.com/peps1/airdcpp-advanced-sharing/compare/5918334e8dec8cfcb9c639583a2f24bc9b6a5aa0...v1.0.0)

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
