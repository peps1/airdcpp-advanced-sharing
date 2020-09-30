
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
// TODO: (legacy, remove at some point)
export const checkLegacyChatCommand = async (socket: APISocket, message: any, type: string) => {
  const text = message.text;
  if (text.length === 0 || text[0] !== '/') {
    return null;
  }

  const command = message.text.split(' ');
  const args = command.slice(1);

  if (text === '/help') {
    printEvent(socket, 'Received legacy help command..', 'info');
    return null;
  }
  return null;
};

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

export const onOutgoingHubMessage = (socket: APISocket, message: any, accept: any) => {
  checkLegacyChatCommand(socket, message, 'hubs');

  accept();
};

export const onOutgoingPrivateMessage = (socket: APISocket, message: any, accept: any) => {
  checkLegacyChatCommand(socket, message, 'private');

  accept();
};
