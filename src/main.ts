'use strict';

import * as utils from './utils';
import { onChatCommand } from './chat';
import { checkHashQueue, onShareRefreshCompleted, onShareRefreshStarted } from './hash';
// import searchItem from './search';
import type {APISocket} from 'airdcpp-apisocket';

const CONFIG_VERSION = 1;


// Settings manager docs: https://github.com/airdcpp-web/airdcpp-extension-settings-js
import SettingsManager from 'airdcpp-extension-settings';

export default (socket: APISocket, extension: any) => {

  global.SOCKET = socket;

  // INITIALIZATION
  global.SETTINGS = SettingsManager(global.SOCKET, {
    extensionName: extension.name,
    configFile: extension.configPath + 'config.json',
    configVersion: CONFIG_VERSION,
    definitions: utils.SettingDefinitions,
  });

  extension.onStart = async (sessionInfo: any) => {

    await global.SETTINGS.load();

    // initially check the hash queue once
    checkHashQueue();

    // make sure to run when the settings are updated
    global.SETTINGS.onValuesUpdated = checkHashQueue;


    // Chat listeners
    global.SOCKET.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, 'hubs'));
    global.SOCKET.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, 'private_chat'));

    // Refresh listeners
    global.SOCKET.addListener('share', 'share_refresh_started', onShareRefreshStarted);
    global.SOCKET.addListener('share', 'share_refresh_completed', onShareRefreshCompleted);

  };

  extension.onStop = () => {
    // currently nothing
  };

};
