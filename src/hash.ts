
import bytes from 'bytes';
import type { APISocket } from 'airdcpp-apisocket';
import { printEvent } from './log';


export const onHashStats = async (socket: APISocket, settings: any, data: any) => {
  const globalQueueLimitEnabled = settings.getValue('enable_global_refresh_queue_limit');
  const globalQueueLimit = settings.getValue('global_refresh_queue_limit');

  if ( globalQueueLimitEnabled && globalQueueLimit !== 0 ) {
    if (data.hash_bytes_left >= bytes(`${globalQueueLimit}GB`)) {
      abortRefresh(socket);
    }
  }
};

// https://airdcpp.docs.apiary.io/#reference/hashing/methods/get-stats
export const getHashStats = async (socket: APISocket) => {
  let res;
  try {
    res = await socket.get('hash/stats');
  } catch (e) {
    printEvent(socket, `Couldn't abort refresh: ${e}`, 'error');
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

export const onShareRefreshQueued = async (socket: APISocket, data: any) => {
  //
  printEvent(socket, `Received share_refresh_queued event: ${data}`, 'info');
};

export const onShareRefreshCompleted = async (socket: APISocket, data: any) => {
  //
  printEvent(socket, `Received share_refresh_completed event: ${data}`, 'info');
};