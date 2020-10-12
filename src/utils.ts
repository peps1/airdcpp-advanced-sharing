'use strict';

const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

// Format bytes to MiB, GiB, TiB
export const formatSize = (fileSizeInBytes: number): string => {
  const thresh = 1024;
  if (Math.abs(fileSizeInBytes) < thresh) {
    return fileSizeInBytes + ' B';
  }

  let u = -1;
  do {
    fileSizeInBytes /= thresh;
    ++u;
  } while (Math.abs(fileSizeInBytes) >= thresh && u < byteUnits.length - 1);

  const result = fileSizeInBytes.toFixed(2) + ' ' + byteUnits[u];
  return result;
};


// Works only for directories
export const getLastDirectory = (fullPath: string) => {
  const result = fullPath.match(/([^/]+)[/]?$/);
  return result ? result[1] : fullPath;
};


export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


// Default settings
export const SettingDefinitions = [
  {
    key: 'global_refresh_queue_limit',
    title: 'Global refresh queue limit (GiB)',
    help: 'Option needs to be enabled below',
    default_value: 0,
    type: 'number',
  },
  {
    key: 'enable_global_refresh_queue_limit',
    title: 'Enable Global refresh queue limit',
    default_value: false,
    type: 'boolean',
  },
  {
    key: 'auto_resume_refresh',
    title: 'Auto-resume refresh once current queue is hashed (EXPERIMENTAL)',
    default_value: false,
    type: 'boolean',
  },
];