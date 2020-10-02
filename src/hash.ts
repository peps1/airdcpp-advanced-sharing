
import bytes from 'bytes';
import type { APISocket } from 'airdcpp-apisocket';
import { printEvent } from './log';

export const checkHashQueue = async (socket: APISocket, settings: any, queuedRefresh: any, data: any) => {

  const globalQueueLimitEnabled = settings.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit        = settings.getValue('global_refresh_queue_limit');
  const autoResume              = settings.getValue('auto_resume_refresh')
  let   callback                = true;

  // When changing the settings, we need to get the current stats to see
  // if we need to abort any refresh tasks
  if (!data) {
    data = await getHashStats(socket);
    callback = false;
  }

  if ( globalQueueLimitEnabled && globalQueueLimit !== 0 ) {
    autoAbortRefresh(socket, settings, queuedRefresh, data);
  }

  if (callback && autoResume && data.hash_bytes_left === 0) {
    autoResumeRefresh(socket, queuedRefresh);
  }

};

/**
 * Abort refresh if queue is over limit
 *
 * @param socket          APISocket
 * @param settings        Extension Settings
 * @param queuedRefresh   Refresh that triggered this action
 * @param data            Data object from the callback
 */
const autoAbortRefresh = async (socket: APISocket, settings: any, queuedRefresh: any, data: any) => {

  const globalQueueLimit = settings.getValue('global_refresh_queue_limit');

  if (data.hash_bytes_left >= bytes(`${globalQueueLimit}GB`) && globalThis.REFRESH_RUNNING) {

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
      globalThis.REFRESH_RUNNING = false;
    }

    if (!settings.getValue('auto_resume_refresh')) {

      // remove listener here
      // TODO: does this make sense here? - why didn't it work properly with the onShareRefreshCompleted callback?
      globalThis.HASH_STATS_LISTENER();
    }
  }
}

// resume refresh, if no refresh tasks are running
const autoResumeRefresh = async (socket: APISocket, queuedRefresh: any) => {

  const refreshTasks = await listRunningRefreshTasks(socket);

  // only start refresh if no refresh is running
  if (refreshTasks.length === 0) {
    refreshRealPaths(socket, queuedRefresh.real_paths);
  }

};


export const listRunningRefreshTasks = async (socket: APISocket) => {
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
export const abortRefreshTask = async (socket: APISocket, taskId: number) => {
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

// Event Callbacks

export const onShareRefreshQueued = async (socket: APISocket, settings: any, refreshQueuedData: any) => {
  printEvent(socket, `Received share_refresh_queued event: ${JSON.stringify(refreshQueuedData)}`, 'info');
  globalThis.HASH_STATS_LISTENER = await socket.addListener('hash', 'hash_statistics', checkHashQueue.bind(null, socket, settings, refreshQueuedData));
  globalThis.REFRESH_RUNNING = true;

};

export const onShareRefreshCompleted = async (socket: APISocket, data: any) => {
  printEvent(socket, `Received share_refresh_completed event: ${JSON.stringify(data)}`, 'info');
  // globalThis.HASH_STATS_LISTENER();
};