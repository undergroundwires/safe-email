/* eslint-disable no-param-reassign */

(() => {
  const dataAttrNames = {
    email: 'email_b64',
    body: 'body',
    subject: 'subject',
  };
  const defaults = {
    body: 'Hi!',
    subject: getEmailSubject(),
  };
  function getEmailSubject() {
    const currentLocation = window.location.hostname + window.location.pathname;
    return currentLocation.endsWith('/') ? currentLocation.slice(0, -1) : currentLocation;
  }
  function obfuscateInnerHtml(text) {
    const chars = text.split('');
    const reversed = chars.reverse();
    let result = '';
    reversed.forEach((char) => {
      const randomText = Math.random().toString(36).substring(7);
      result += `<em style="display:none;">${randomText}</em>`;
      result += `<span>${char}</span>`;
    });
    return result;
  }
  function styleElement(element) {
    element.style.direction = 'rtl';
    element.style['unicode-bidi'] = 'bidi-override';
  }
  function initializeElement(element) {
    const readAttr = (name) => element.dataset[name];
    styleElement(element);
    if (!element.innerHTML.trim()) {
      element.innerHTML = obfuscateInnerHtml(atob(readAttr(dataAttrNames.email)));
    }
    element.addEventListener('click', (ev) => {
      const href = atob('bWFpbHRvOg==') /* mailto: */ + atob(readAttr(dataAttrNames.email))
                + atob('P3N1YmplY3Q9') /* ?subject= */ + (readAttr(dataAttrNames.subject) || defaults.subject)
                + atob('JmJvZHk9') /* &body= */ + (readAttr(dataAttrNames.body) || defaults.body);
      ev.preventDefault();
      window.location.href = href;
    });
  }
  function initializeAll() {
    const elements = document.querySelectorAll(`[data-${dataAttrNames.email}]`);
    elements.forEach((element) => initializeElement(element));
  }
  if (!window.areEmailsInitialized) {
    window.areEmailsInitialized = true;
    document.addEventListener('DOMContentLoaded', () => initializeAll());
  }
})();
