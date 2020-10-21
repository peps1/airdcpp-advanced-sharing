
export const printVirtualPaths = async (): Promise<Set<string>> => {
  const results = await globalThis.SOCKET.get('share_roots');

  const virt: Set<string> = new Set();

  for (const result of results) {
    virt.add(result.virtual_name);
  }

  return virt;
};