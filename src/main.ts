'use strict';

import * as utils from './utils';
import {onChatCommand} from './chat';
import {checkHashQueue, onShareRefreshCompleted, onShareRefreshQueued, onShareRefreshStarted} from './hash';
// import searchItem from './search';
import type {APISocket} from 'airdcpp-apisocket';

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

    // initially check the hash queue once
    checkHashQueue(socket, settings);

    // make sure to run when the settings are updated
    settings.onValuesUpdated = checkHashQueue.bind(null, socket, settings);


    // Chat listeners
    socket.addListener('hubs', 'hub_text_command', onChatCommand.bind(null, socket, 'hubs'));
    socket.addListener('private_chat', 'private_chat_text_command', onChatCommand.bind(null, socket, 'private_chat'));

    // Refresh listeners
    socket.addListener('share', 'share_refresh_started', onShareRefreshStarted.bind(null, socket, settings));
    socket.addListener('share', 'share_refresh_queued', onShareRefreshQueued.bind(null, socket, settings));
    socket.addListener('share', 'share_refresh_completed', onShareRefreshCompleted.bind(null, socket));

  };

  extension.onStop = () => {
    // currently nothing
  };

};
