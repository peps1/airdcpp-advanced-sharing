
  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-chat-message

import { APISocket } from 'airdcpp-apisocket';
import { listRunningRefreshTasks, abortRefreshTask, refreshVirtualPath, refreshWholeShare, hashingAction } from './hash';
import { printEvent, printStatusMessage } from './log';


// https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
export const sendChatMessage = (socket: APISocket, chatMessage: string, type: string, entityId: string|number) => {
  try {
    socket.post(`${type}/${entityId}/chat_message`, {
      text: chatMessage,
    });
  } catch (e) {
    printEvent(socket, `Failed to send: ${e}`, 'error');
  }

};

// Basic chat command handling, returns possible status message to post

// entityId is the session_id used to reference the current chat session
// example https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
export const checkChatCommand = async (socket: APISocket, type: string, data: { command: string, args: string[], permissions: string[] }, entityId: string|number) => {
  const { command, args } = data;
  let output;

  switch (command) {
    case 'help': {
      const helpText = `        Advanced sharing commands

        /stophash\t\tStop all running hashers and clear refresh queue
        /tasks\t\t\tList all running refresh tasks
        /aborttask TASK_ID\tAbort task with the provided task id
        /refresh /PATH\tRefresh the provided path
        /fullrefresh\tRefresh all shares
        /pausehash\tPause hashing
        /resumehash\tResume hashing`
      printStatusMessage(socket, helpText, type, entityId)
      break;
    }
    case 'stophash': {
      hashingAction(socket, 'stop');
      break;
    }
    case 'pausehash': {
      hashingAction(socket, 'pause');
      break;
    }
    case 'resumehash': {
      hashingAction(socket, 'resume');
      break;
    }
    case 'tasks': {
      const runningTasks = await listRunningRefreshTasks(socket);
      if (runningTasks.length === 0) {
        output = 'No running tasks found...';
      } else {
        output = JSON.stringify(runningTasks);
      }
      printStatusMessage(socket, output, type, entityId);
      break;
    }
    case 'aborttask': {
      await abortRefreshTask(socket, parseInt(args.toString(), 10));
      const runningTasks = await listRunningRefreshTasks(socket);
      if (runningTasks.length === 0) {
        output = 'No running tasks found...';
      } else {
        output = JSON.stringify(runningTasks);
      }
      printStatusMessage(socket, output, type, entityId);
      break;
    }
    case 'refresh': {
      const res = await refreshVirtualPath(socket, args.toString());
      output = JSON.stringify(res);
      printStatusMessage(socket, output, output, entityId)
      break;
    }
    case 'fullrefresh': {
      const res = await refreshWholeShare(socket);
      output = JSON.stringify(res);
      printStatusMessage(socket, output, output, entityId)
      break;
    }

  }

  return null;
};

export const onChatCommand = async (socket: APISocket, type: string, data: { command: string, args: string[], permissions: string[] }, entityId: string|number) => {
  const statusMessage = await checkChatCommand(socket, type, data, entityId);
  if (statusMessage) {
    printStatusMessage(socket, statusMessage, type, entityId);
  }
};

