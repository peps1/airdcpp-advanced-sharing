'use strict';

import * as utils from './utils';
import { onChatCommand } from './chat';
import { getHashStats, checkHashQueue, onShareRefreshCompleted, onShareRefreshQueued } from './hash';
// import searchItem from './search';
import type { APISocket } from 'airdcpp-apisocket';

const CONFIG_VERSION = 1;

// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';
import { printEvent } from './log';


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

    // make sure to run when the settings are updated
    settings.onValuesUpdated = checkHashQueue.bind(null, socket, settings);


    if (sessionInfo.system_info.api_feature_level >= 5) {
      // Chat listeners
      socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, socket, 'hubs'));
      socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, socket, 'private_chat'));

      // Refresh listeners
      socket.addListener('share', 'share_refresh_queued', onShareRefreshQueued.bind(null, socket, settings));
      socket.addListener('share', 'share_refresh_completed', onShareRefreshCompleted.bind(null, socket));
      // socket.addListener('hash', 'hash_statistics', onHashStats.bind(null, socket, settings));
    } else {
      await printEvent(socket, `This extension needs at least AirDC++ API feature level 5, you are currently using ${sessionInfo.system_info.api_feature_level} introduced in AirDC++w 2.9.0. Please consider upgrading.`, 'error');
      await utils.sleep(2000);
      process.exit(1);
      // socket.addHook('hubs', 'hub_outgoing_message_hook', onOutgoingHubMessage.bind(null, socket), subscriberInfo);
      // socket.addHook('private_chat', 'private_chat_outgoing_message_hook', onOutgoingPrivateMessage.bind(null, socket), subscriberInfo);
    }


  };

	extension.onStop = () => {
		// currently nothing
	};

};
