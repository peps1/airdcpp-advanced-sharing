
import bytes from 'bytes';
import { printEvent } from './log';

/**
 * Check the hash queue (non-callback)
 *
 */
export const checkHashQueue = async () => {

  const globalQueueLimitEnabled = globalThis.SETTINGS.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit        = globalThis.SETTINGS.getValue('global_refresh_queue_limit');

  // When changing the settings, we need to get the current stats to see
  // if we need to abort any refresh tasks
  const data = await getHashStats();
  const queuedRefresh = undefined;

  if ( globalQueueLimitEnabled && globalQueueLimit !== 0 ) {
    autoAbortRefresh(queuedRefresh, data);
  }
}
/**
 * Callback to check the hash queue
 *
 * @function cbCheckHashQueue
 * @param    queuedRefresh     Refresh that triggered this action
 * @param    cbData            Data object from the callback, with the hash stats
 */
export const cbCheckHashQueue = async (queuedRefresh: any, cbData: any) => {

  const globalQueueLimitEnabled = globalThis.SETTINGS.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit        = globalThis.SETTINGS.getValue('global_refresh_queue_limit');

  if ( globalQueueLimitEnabled && globalQueueLimit !== 0 ) {
    autoAbortRefresh(queuedRefresh, cbData);
  }



};

/**
 * Callback when a hasher process finishes
 *
 * @function cbHasherFinished
 * @param    queuedRefresh     Refresh that triggered this action
 * @param    cbData            Data object from the callback, with the hasher process stats
 *
 * https://airdcpp.docs.apiary.io/#reference/hashing/event-listeners/hasher-finished
 */
const cbHasherFinished = async (queuedRefresh: any, cbData: any) => {

  // get stats, see if any files left
  const hashStats = await getHashStats();

  // 0 bytes left and 0 bytes got refreshed should mean the folder/share has been completely hashed
  if (hashStats.hash_bytes_left === 0 && cbData.size === 0) {
    // Stop auto-resume by removing the listener
    globalThis.HASHER_FINISHED();
  } else if (hashStats.hash_bytes_left === 0) {
    // Trigger auto resume and remove listener
    autoResumeRefresh(queuedRefresh);
    globalThis.HASHER_FINISHED();
  }

}

/**
 * Abort refresh if queue is over limit
 *
 * @function autoAbortRefresh
 * @param    queuedRefresh      Refresh that triggered this action
 * @param    data               passed through data object from the callback, with the hash stats
 */
const autoAbortRefresh = async (queuedRefresh: any, data: any) => {

  const globalQueueLimit = globalThis.SETTINGS.getValue('global_refresh_queue_limit');


  if (data.hash_bytes_added >= bytes(`${globalQueueLimit}GB`)) {

    const refreshTasks = await listRunningRefreshTasks();

    for (const task of refreshTasks) {
      let res = false;

      while (!res) {
        if (task.id === queuedRefresh.task.id) {
          printEvent(`Aborting running task: ${task.id} - ${task.real_paths.toString()}`, 'info');
          res = await abortRefreshTask(task.id)
        } else if (!queuedRefresh) {
          // Here we abort the refresh task that was running while the settings were changed
          // and the refresh queue is already over the limit
          printEvent(`Aborting running task: ${task.id} - ${task.real_paths.toString()}`, 'info');
          res = await abortRefreshTask(task.id)
        } else {
          // Seems there is no running tasks
          break;
        }
      }

    }

  }
}

// resume refresh, if no refresh tasks are running
const autoResumeRefresh = async (queuedRefresh: any) => {

  const refreshTasks = await listRunningRefreshTasks();

  // only start refresh if no refresh is running
  if (refreshTasks.length === 0) {
    refreshRealPaths(queuedRefresh.real_paths);
  }

};

// List refresh tasks
// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/list-refresh-tasks
const listRefreshTasks = async () => {
  let res;
  try {
    res = await globalThis.SOCKET.get('share/refresh/tasks');
  } catch (e) {
    printEvent(`Couldn't list refresh task. Error: ${e.code} - ${e.message}`, 'error');
  }

  return res;
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/get-stats
const getHashStats = async () => {
  let res;
  try {
    res = await globalThis.SOCKET.get('hash/stats');
  } catch (e) {
    printEvent(`Couldn't get hash stats. Error: ${e.code} - ${e.message}`, 'error');
  }

  return res;
};

export const listRunningRefreshTasks = async () => {
  const refreshTasks: any = await listRefreshTasks();
  const runningTasks = [];

  for (const task of refreshTasks) {
    if (task.running && !task.canceled) {
      runningTasks.push(task);
    }
  }

  return runningTasks;
};

// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/abort-refresh-task
export const abortRefreshTask = async (taskId: number) => {
  try {
    await globalThis.SOCKET.delete(`share/refresh/tasks/${taskId}`);
    return true;
  } catch (e) {
    printEvent(`Couldn't abort refresh. Error: ${e.code} - ${e.message}`, 'error');
    return false;
  }
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/pause-hashing
// https://airdcpp.docs.apiary.io/#reference/hashing/methods/resume-hashing
// https://airdcpp.docs.apiary.io/#reference/hashing/methods/stop-hashing
export const hashingAction = async (type: string) => {
  try {
    globalThis.SOCKET.post(`hash/${type}`);
  } catch (e) {
    printEvent(`Couldn't ${type} hashing. Error: ${e.code} - ${e.message}`, 'error');
  }
};

// https://airdcpp.docs.apiary.io/#reference/share/generic-methods/refresh-real-paths
export const refreshRealPaths = async (paths: string) => {
  let res;
  try {
    res = await globalThis.SOCKET.post('share/refresh/paths', {
      paths
    });
  } catch (e) {
    printEvent(`Couldn't refresh "${paths}". Error: ${e.code} - ${e.message}`, 'error');
  }
  return res;
};

// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/refresh-virtual-path
export const refreshVirtualPath = async (path: string) => {
  // TODO: add priority
  let res;
  try {
    res = await globalThis.SOCKET.post('share/refresh/virtual', {
      path
    });
  } catch (e) {
    printEvent(`Couldn't refresh "${path}". Error: ${e.code} - ${e.message}`, 'error');
  }
  return res;
};

// https://airdcpp.docs.apiary.io/#reference/share/refresh-methods/refresh-whole-share
export const refreshWholeShare = async () => {
  let res;
  try {
    res = await globalThis.SOCKET.post('share/refresh');
  } catch (e) {
    printEvent(`Couldn't abort refresh. Error: ${e.code} - ${e.message}`, 'error');
  }
  return res;
};

// Event Callbacks

export const onShareRefreshStarted = async (refreshQueuedData: any)=> {
  // DEBUG output
  // printEvent(`Received share_refresh_started event: ${JSON.stringify(refreshQueuedData)}`, 'info');

  // add stats listener
  globalThis.HASH_STATS_LISTENER = await globalThis.SOCKET.addListener('hash', 'hash_statistics', cbCheckHashQueue.bind(null, refreshQueuedData));
  globalThis.HASH_STATS_LISTENER_ADDED = true;

  if (globalThis.SETTINGS.getValue('auto_resume_refresh')) {
    globalThis.HASHER_FINISHED = globalThis.SOCKET.addListener('hash', 'hasher_finished', cbHasherFinished.bind(null, refreshQueuedData))
  }

}

export const onShareRefreshCompleted = async (data: any) => {
  // DEBUG output
  // printEvent(`Received share_refresh_completed event: ${JSON.stringify(data)}`, 'info');

  // remove listener
  globalThis.HASH_STATS_LISTENER();
  globalThis.HASH_STATS_LISTENER_ADDED = false;
};
