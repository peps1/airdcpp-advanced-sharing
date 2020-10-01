
import bytes from 'bytes';
import type { APISocket } from 'airdcpp-apisocket';
import { printEvent } from './log';

export const checkHashQueue = async (socket: APISocket, settings: any, queuedRefresh: any, data: any) => {
  const globalQueueLimitEnabled = settings.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit = settings.getValue('global_refresh_queue_limit');

  // When changing the settings, we need to get the current stats to see
  // if we need to abort any refresh tasks
  if (!data) {
    data = await getHashStats(socket);
  }

  if ( globalQueueLimitEnabled && globalQueueLimit !== 0 ) {
    if (data.hash_bytes_left >= bytes(`${globalQueueLimit}GB`)) {

      const refreshTasks = await listRunningRefreshTasks(socket);

      for (const task of refreshTasks) {
        if (task.id === queuedRefresh.id) {
          abortRefreshTask(socket, task.id)
        } else if (!queuedRefresh) {
          // Here we abort the refresh task that was running while the settings were changed
          // and the refresh queue is already over the limit
          printEvent(socket, `Aborting running task: ${JSON.stringify(task)}`, 'info');
          abortRefreshTask(socket, task.id)
        }
      }
      // remove listener here
      // TODO: does this make sense here? - why didn't it work properly with the onShareRefreshCompleted callback?
      globalThis.HASH_STATS_LISTENER();
    }
  }
};

const listRunningRefreshTasks = async (socket: APISocket) => {
  const refreshTasks: any = await listRefreshTasks(socket);
  const runningTasks = [];

  for (const task of refreshTasks) {
    if (task.running && !task.canceled) {
      runningTasks.push(task);
    }
  }

  return runningTasks;
};

// List refresh tasks
// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/list-refresh-tasks
const listRefreshTasks = async (socket: APISocket) => {
  let res;
  try {
    res = await socket.get('share/refresh/tasks');
  } catch (e) {
    printEvent(socket, `Couldn't list refresh taks: ${e}`, 'error');
  }

  return res;
};

// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/abort-refresh-task
const abortRefreshTask = async (socket: APISocket, taskId: number) => {
  try {
    socket.delete(`share/refresh/tasks/${taskId}`);
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/get-stats
const getHashStats = async (socket: APISocket) => {
  let res;
  try {
    res = await socket.get('hash/stats');
  } catch (e) {
    printEvent(socket, `Couldn't get hash stats: ${e}`, 'error');
  }

  return res;
};

// https://airdcpp.docs.apiary.io/#reference/share/generic-methods/abort-refresh
const abortRefresh = async (socket: APISocket) => {
  try {
    socket.delete('share/refresh');
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/stop-hashing
export const stopHashing = async (socket: APISocket) => {
  try {
    socket.post('hash/stop');
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

// https://airdcpp.docs.apiary.io/#reference/share/generic-methods/refresh-real-paths
const refreshRealPaths = async (socket: APISocket, paths: any) => {
  try {
    socket.post('share/refresh/paths', {
      paths
    });
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

export const onHasherDirectoryFinished = async (socket: APISocket, data: any) => {
  // get the real paths from data
  // trigger refresh for paths
  printEvent(socket, `Received hasher_directory_finished: ${JSON.stringify(data)}`, 'info' );
};

// Event Callbacks
export const onShareRefreshQueued = async (socket: APISocket, settings: any, refreshQueuedData: any) => {
  printEvent(socket, `Received share_refresh_queued event: ${JSON.stringify(refreshQueuedData)}`, 'info');
  globalThis.HASH_STATS_LISTENER = await socket.addListener('hash', 'hash_statistics', checkHashQueue.bind(null, socket, settings, refreshQueuedData));

};

export const onShareRefreshCompleted = async (socket: APISocket, data: any) => {
  printEvent(socket, `Received share_refresh_completed event: ${JSON.stringify(data)}`, 'info');
  await globalThis.HASH_STATS_LISTENER();
};