import type { APISocket } from 'airdcpp-apisocket';


// https://airdcpp.docs.apiary.io/#reference/private-chat-sessions/methods/send-status-message
// https://airdcpp.docs.apiary.io/#reference/hub-sessions/messages/send-status-message
export const printStatusMessage = async (socket: APISocket, statusMessage: string, type: string, entityId: string|number) => {
  try {
    socket.post(`${type}/${entityId}/status_message`, {
      text: statusMessage,
      severity: 'info',
    });
  } catch (e) {
    printEvent(socket, `Failed to send: ${e}`, 'error');
  }
};

// Events are used for displaying and logging informative messages and errors to the application user.
// Note that events are not bind to any specific context; some entities, such as hubs, provide similar
// methods for showing information locally to the application user.
// Messages will appear as popups and in the Events Log
// https://airdcpp.docs.apiary.io/#reference/events
export const printEvent = async (socket: APISocket, eventMessage: string, severity: string) => {
  socket.post('events', {
    text: `${eventMessage}`,
    severity,
  });
};
