
  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-chat-message

import { listRunningRefreshTasks, abortRefreshTask, refreshWholeShare, hashingAction } from './hash';
import { printEvent, printStatusMessage } from './log';
import { triggerRefresh } from './commands/refresh'
import { printVirtualPaths } from './commands/listv'


const helpText = `
        #######################
        Advanced sharing commands
        #######################

        /stophash\t\tStop all running hashers and clear refresh queue
        /pausehash\tPause hashing
        /resumehash\tResume hashing
        /tasks\t\t\tList all running refresh tasks
        /aborttask TASK_ID\tAbort task with the provided task id
        /listv\t\t\tList all available virtual paths
        /refresh [share/path]\tRefresh the whole share, or the provided path (e.g. /virtual name/sub folder/)`

// https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
export const sendChatMessage = (chatMessage: string, type: string, entityId: string|number) => {
  try {
    globalThis.SOCKET.post(`${type}/${entityId}/chat_message`, {
      text: chatMessage,
    });
  } catch (e) {
    printEvent(`Failed to send: ${e}`, 'error');
  }

};

// Basic chat command handling, returns possible status message to post

// entityId is the session_id used to reference the current chat session
// example https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-chat-message
export const checkChatCommand = async (type: string, data: { command: string, args: string[], permissions: string[] }, entityId: string|number) => {
  const { command, args } = data;
  let output;

  switch (command) {
    case 'help': {
      printStatusMessage(helpText, type, entityId)
      break;
    }
    case 'stophash': {
      hashingAction('stop');
      break;
    }
    case 'pausehash': {
      hashingAction('pause');
      break;
    }
    case 'resumehash': {
      hashingAction('resume');
      break;
    }
    case 'tasks': {
      const runningTasks = await listRunningRefreshTasks();
      if (runningTasks.length === 0) {
        output = 'No running tasks found...';
      } else {
        output = JSON.stringify(runningTasks);
      }
      printStatusMessage(output, type, entityId);
      break;
    }
    case 'aborttask': {
      await abortRefreshTask(parseInt(args.toString(), 10));
      const runningTasks = await listRunningRefreshTasks();
      if (runningTasks.length === 0) {
        output = 'No running tasks found...';
      } else {
        output = JSON.stringify(runningTasks);
      }
      printStatusMessage(output, type, entityId);
      break;
    }
    case 'refresh': {
      triggerRefresh(args)
      break;
    }
    case 'listv': {
      output = await printVirtualPaths();
      printStatusMessage('Virtual Names:\n\t- ' + [...output].sort().join('\n\t- '), type, entityId);
      break;
    }

  }

  return null;
};

export const onChatCommand = async (type: string, data: { command: string, args: string[], permissions: string[] }, entityId: string|number) => {
  const statusMessage = await checkChatCommand(type, data, entityId);
  if (statusMessage) {
    printStatusMessage(statusMessage, type, entityId);
  }
};

