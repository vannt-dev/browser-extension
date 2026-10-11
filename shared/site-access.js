/**
 * Auto-convert reads images from whatever site a download comes from, so it needs the optional
 * access to all sites. The popup and the dashboard switch it on and off through here.
 */

const ALL_SITES = { origins: ['<all_urls>'] };

export const hasAllSites = () => chrome.permissions.contains(ALL_SITES);

/**
 * Asks for the access to all sites without switching auto-convert on; call it from a click.
 * Resolves to whether it was given.
 */
export async function askForAllSites() {
  await chrome.storage.local.set({ autoConvertPending: 0 });
  return chrome.permissions.request(ALL_SITES).catch(() => false);
}

/**
 * Whether auto-convert is on. A setting left on while the access it needs has been taken away
 * (in the browser's own extension settings) is switched off here rather than shown as working.
 */
export async function readAutoConvert() {
  const { autoConvertWebp = false } = await chrome.storage.local.get('autoConvertWebp');
  if (!autoConvertWebp) return false;
  if (await hasAllSites()) return true;
  await chrome.storage.local.set({ autoConvertWebp: false });
  return false;
}

/**
 * Switches auto-convert on, asking for the access when it is missing; call it from a click.
 * Resolves to whether it is on. In the popup the browser's prompt closes the popup before the
 * answer arrives, so the wish is written down first, with its time: the service worker switches
 * the setting on when the access is granted shortly after.
 */
export async function turnOnAutoConvert() {
  if (!(await hasAllSites())) {
    await chrome.storage.local.set({ autoConvertPending: Date.now() });
    const granted = await chrome.permissions.request(ALL_SITES).catch(() => false);
    if (!granted) {
      await chrome.storage.local.set({ autoConvertWebp: false, autoConvertPending: 0 });
      return false;
    }
  }
  await chrome.storage.local.set({ autoConvertWebp: true, autoConvertPending: 0 });
  return true;
}

export const turnOffAutoConvert = () => chrome.storage.local.set({ autoConvertWebp: false, autoConvertPending: 0 });
