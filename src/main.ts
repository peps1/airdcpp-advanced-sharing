'use strict';

import * as utils from './utils';
import { onChatCommand, onOutgoingHubMessage, onOutgoingPrivateMessage } from './chat';
// import searchItem from './search';
import type { APISocket } from 'airdcpp-apisocket';

const CONFIG_VERSION = 1;

// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';


export default (socket: APISocket, extension: any) => {

  // INITIALIZATION
  const settings = SettingsManager(socket, {
    extensionName: extension.name,
    configFile: extension.configPath + 'config.json',
    configVersion: CONFIG_VERSION,
    definitions: utils.SettingDefinitions,
  });

  extension.onStart = async (sessionInfo: any) => {

    await settings.load();

    const subscriberInfo = {
      id: 'advanced_sharing',
      name: 'Advanced Sharing',
    };
    if (sessionInfo.system_info.api_feature_level >= 4) {
      socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, socket, 'hubs'));
      socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, socket, 'private_chat'));
    } else {
      socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage.bind(null, socket), subscriberInfo);
      socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage.bind(null, socket), subscriberInfo);
    }


  };

	extension.onStop = () => {
		// currently nothing
	};

};
