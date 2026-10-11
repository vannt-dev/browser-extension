/**
 * The interface's two languages. The strings live in _locales/, where the browser also reads the
 * extension's description for its own pages; they are bundled here as well because the user may
 * choose a language other than the browser's, which chrome.i18n cannot serve.
 */
import en from '../_locales/en/messages.json';
import vi from '../_locales/vi/messages.json';

const CATALOGS = { en, vi };
const FALLBACK = 'en';

export const LANGUAGES = Object.keys(CATALOGS);

let active = FALLBACK;

/** The language the browser's own interface is in, when it is one of ours. */
export function browserLanguage() {
  const ui = globalThis.chrome?.i18n?.getUILanguage?.() || globalThis.navigator?.language || FALLBACK;
  const short = ui.toLowerCase().split(/[-_]/)[0];
  return LANGUAGES.includes(short) ? short : FALLBACK;
}

/** Sets the language from the user's choice: a language code, or anything else for "as the browser". */
export function setLanguage(choice) {
  active = LANGUAGES.includes(choice) ? choice : browserLanguage();
  return active;
}

/** What the language lists offer: a language code, or "auto" for the browser's language. */
const asChoice = (stored) => (LANGUAGES.includes(stored) ? stored : 'auto');

/** The user's stored choice. */
export async function languageChoice() {
  const { uiLanguage } = await chrome.storage.local.get('uiLanguage');
  return asChoice(uiLanguage);
}

/** Sets the language from the stored choice. Resolves to the language in use. */
export async function loadLanguage() {
  return setLanguage(await languageChoice());
}

/**
 * Makes a <select> of "auto" and the language codes the place where the language is chosen.
 * A choice is only stored; every open page of the extension (and the service worker, for the
 * right-click menu) follows the stored choice, so the popup and the dashboard stay in step.
 * `rerender` redraws what the page has written itself, outside the data-i18n attributes.
 */
export function bindLanguageSelect(select, rerender = () => {}) {
  languageChoice().then((choice) => {
    select.value = choice;
  });
  select.addEventListener('change', () => {
    chrome.storage.local.set({ uiLanguage: select.value });
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes.uiLanguage) return;
    const choice = asChoice(changes.uiLanguage.newValue);
    select.value = choice;
    setLanguage(choice);
    applyI18n();
    rerender();
  });
}

export const currentLanguage = () => active;

/**
 * The message for a key, with $NAME$ placeholders filled from the arguments the way chrome.i18n
 * fills them: each placeholder names the argument it takes ("$1", "$2", ...).
 */
export function t(key, ...substitutions) {
  const entry = CATALOGS[active][key] ?? CATALOGS[FALLBACK][key];
  if (!entry) return key;
  return entry.message.replace(/\$([A-Za-z0-9_]+)\$/g, (whole, name) => {
    const placeholder = entry.placeholders?.[name.toLowerCase()];
    if (!placeholder) return whole;
    return placeholder.content.replace(/\$(\d)/g, (_, position) => substitutions[position - 1] ?? '');
  });
}

/** Whether a text is the message of a key in any language: a default the user has not changed. */
const isDefaultOf = (key, text) => LANGUAGES.some((language) => CATALOGS[language][key]?.message === text);

/**
 * Writes the messages into a page: data-i18n names the key of an element's text, and
 * data-i18n-title / -placeholder / -value the key of that attribute.
 */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  // A field that comes filled in: only replaced while it still holds a default.
  root.querySelectorAll('[data-i18n-value]').forEach((element) => {
    const key = element.dataset.i18nValue;
    if (element.value === '' || isDefaultOf(key, element.value)) element.value = t(key);
  });
  const page = root.documentElement ?? root.ownerDocument?.documentElement;
  if (page) {
    page.lang = active;
    page.classList.remove('i18n-pending');
  }
}
