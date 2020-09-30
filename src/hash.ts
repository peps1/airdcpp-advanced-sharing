
import bytes from 'bytes';
import type { APISocket } from 'airdcpp-apisocket';
import { printEvent } from './log';

export const checkHashQueue = async (socket: APISocket, settings: any, queuedRefresh: any, data: any) => {
  const globalQueueLimitEnabled = settings.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit = settings.getValue('global_refresh_queue_limit');

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
          printEvent(socket, `Running task: ${JSON.stringify(task)}`, 'info');
          abortRefreshTask(socket, task.id)
        }
      }
      // remove listener here
      // eslint-disable-next-line no-console
      console.log(socket.hasListeners());
    }
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
export const listRefreshTasks = async (socket: APISocket) => {
  let res;
  try {
    res = await socket.get('share/refresh/tasks');
  } catch (e) {
    printEvent(socket, `Couldn't list refresh taks: ${e}`, 'error');
  }

  return res;
};

export const abortRefreshTask = async (socket: APISocket, taskId: number) => {
  try {
    socket.delete(`share/refresh/tasks/${taskId}`);
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/get-stats
export const getHashStats = async (socket: APISocket) => {
  let res;
  try {
    res = await socket.get('hash/stats');
  } catch (e) {
    printEvent(socket, `Couldn't get hash stats: ${e}`, 'error');
  }

  return res;
};

// https://airdcpp.docs.apiary.io/#reference/share/generic-methods/abort-refresh
export const abortRefresh = async (socket: APISocket) => {
  try {
    socket.delete('share/refresh');
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

export const stopHashing = async (socket: APISocket) => {
  try {
    socket.post('hash/stop');
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
  }
};

export const onShareRefreshQueued = async (socket: APISocket, settings: any, refreshQueuedData: any) => {
  printEvent(socket, `Received share_refresh_queued event: ${JSON.stringify(refreshQueuedData)}`, 'info');
  const listener = await socket.addListener('hash', 'hash_statistics', checkHashQueue.bind(null, socket, settings, refreshQueuedData));

  // eslint-disable-next-line no-console
  console.log(`Listener: ${JSON.stringify(listener)}`);
};

export const onShareRefreshCompleted = async (socket: APISocket, data: any) => {
  //
  printEvent(socket, `Received share_refresh_completed event: ${JSON.stringify(data)}`, 'info');
};