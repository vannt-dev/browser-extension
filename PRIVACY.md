# Privacy Policy — Universal File Converter

Universal File Converter processes every file on your own device, inside the browser.

- It does not collect, store, transmit or sell any personal data, file content or usage data.
- It has no account, no analytics and no advertising.
- The text recogniser (OCR) and every library it uses are packaged with the extension. No code is loaded from
  anywhere else.

## What stays on your device

The extension keeps a few things in the browser's local storage: the colour theme, the language you chose,
whether the optional auto-convert of downloaded images is on and which format it saves, the watermark text if
you set one, and, when a right-click or auto-convert could not be done, the name of the site the image was on,
until you dismiss the notice. They never leave your device.

## When the extension makes a request

When you ask it to convert an image from a web page (the right-click menu, or the optional auto-convert of
downloads), the extension requests that image from the address it is already served from, in order to convert it.
Nothing else is sent anywhere.

## Permissions

| Permission | Why |
| --- | --- |
| `downloads` | Saves converted files. With the optional auto-convert setting on, watches new downloads to convert `.webp` and `.jfif` images. |
| `contextMenus` | Adds the "convert" entries to the right-click menu of images. |
| `storage` | Keeps the settings above. |
| `activeTab` | Lets the extension fetch the image you right-clicked on the current page. |

## Access to sites, asked only when you use it

The extension has no access to any site when it is installed. Many sites only let their own pages read their
images, so the browser asks you for access at the moment it is needed:

- When you right-click an image that is served from another site than the page you are on, the browser asks
  for access to that one site. If you decline, the image is still tried, and you are told if it could not be read.
- When you switch auto-convert on, the browser asks for access to all sites, because a download can come from
  anywhere. Without it the setting stays off.

The access is used for one thing: fetching the image you asked to convert. You can take it back at any time in the
browser's extension settings; auto-convert then switches itself off.

## Contact

Questions and reports: <https://github.com/vannt-dev/browser-extension/issues>
