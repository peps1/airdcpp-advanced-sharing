import { refreshVirtualPath, refreshWholeShare } from '../hash';
import { addLeadingSlash, addTrailingSlash } from '../utils';

/**
 * Trigger either refresh of a specific virtual path, or the whole share
 *
 * @function triggerRefresh
 * @param {string} [args] - The path as string
 */
export const triggerRefresh = async (args: string[]|void) => {

  // full refresh or virtual?
  if (args) {
    let path;
    path = args.join(' ');
    path = addLeadingSlash(path);
    path = addTrailingSlash(path);

    refreshVirtualPath(path);
  } else {
    refreshWholeShare();
  }

};