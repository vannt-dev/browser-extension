# Privacy Policy — Universal File Converter

Universal File Converter processes every file on your own device, inside the browser.

- It does not collect, store, transmit or sell any personal data, file content or usage data.
- It has no account, no analytics and no advertising.
- The text recogniser (OCR) and every library it uses are packaged with the extension. No code is loaded from
  anywhere else.

## What stays on your device

The extension keeps two settings in the browser's local storage: the colour theme, and whether the optional
auto-convert of downloaded images is on. They never leave your device.

## When the extension makes a request

When you ask it to convert an image from a web page (the right-click menu, or the optional auto-convert of
downloads), the extension requests that image from the address it is already served from, in order to convert it.
Nothing else is sent anywhere.

## Permissions

| Permission | Why |
| --- | --- |
| `downloads` | Saves converted files. With the optional auto-convert setting on, watches new downloads to convert `.webp` and `.jfif` images. |
| `contextMenus` | Adds the "convert" entries to the right-click menu of images. |
| `storage` | Keeps the two settings above. |
| `activeTab` | Lets the extension fetch the image you right-clicked on the current page. |

## Contact

Questions and reports: <https://github.com/vannt-dev/browser-extension/issues>
