
  // https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-chat-message

import { APISocket } from 'airdcpp-apisocket';
import { stopHashing } from './hash';
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
export const checkChatCommand = async (socket: APISocket, type: string, data: any, entityId: string|number) => {
  const { command, args } = data;

  switch (command) {
    case 'help': {
      const helpText = `
        Advanced sharing commands

        /stophash\tStop all running hashers and clear refresh queue
      `
      printStatusMessage(socket, helpText, type, entityId)
      break;
    }
    case 'stophash': {
      stopHashing(socket);
    }
  }

  return null;
};

export const onChatCommand = async (socket: APISocket, type: string, data: any, entityId: string|number) => {
  const statusMessage = await checkChatCommand(socket, type, data, entityId);
  if (statusMessage) {
    printStatusMessage(socket, statusMessage, type, entityId);
  }
};

