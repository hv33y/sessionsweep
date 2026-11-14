// ==UserScript==
// @name         Google Devices - Top-Level Sequential Sign Out
// @namespace    local.google.devices
// @version      1.0
// @description  Sign out Google Account device sessions sequentially without changing your password.
// @author       Harry Kauhaad
// @homepageURL  https://github.com/hv33y/sessionsweep
// @supportURL   https://github.com/hv33y/sessionsweep/issues
// @match        https://myaccount.google.com/device-activity*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
 * SessionSweep — One queue. Fewer open sessions.
 *
 * Created and maintained by Harry Kauhaad.
 * Developed with assistance from Perplexity.
 *
 * Independent community project.
 * Not affiliated with or endorsed by Google or Tampermonkey.
 */


(() => {
  'use strict';
  if (window.top !== window.self) return;

  const KEY = 'google-device-signout-v3';
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const norm = value => (value || '').replace(/\s+/g, ' ').trim();
  const isDetail = () => location.pathname.includes('/device-activity/id/');

  function load() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null');
    } catch {
      return null;
    }
  }

  function save(state) {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  }

  function visible(el) {
    const style = getComputedStyle(el);
    return el.getClientRects().length > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden';
  }

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'fixed', right: '16px', bottom: '16px',
    width: '350px', maxWidth: '90vw', padding: '14px',
    background: '#fff', color: '#202124',
    border: '2px solid #1a73e8', borderRadius: '10px',
    zIndex: '2147483647', font: '13px/1.5 Arial,sans-serif'
  });

  const status = document.createElement('div');
  status.style.whiteSpace = 'pre-wrap';

  const start = document.createElement('button');
  start.textContent = 'Start sequential sign-out';

  const stop = document.createElement('button');
  stop.textContent = 'Stop / clear queue';

  for (const button of [start, stop]) {
    button.style.cssText = 'margin:10px 8px 0 0;padding:8px;cursor:pointer';
  }

  panel.append(status, start, stop);
  document.body.append(panel);

  function show(message) {
    status.textContent = message;
  }

  function buttons(root = document) {
    return [...root.querySelectorAll('button,[role="button"],a')]
      .filter(el => !panel.contains(el) && visible(el) &&
        !el.disabled && el.getAttribute('aria-disabled') !== 'true' &&
        /^sign out$/i.test(norm(el.innerText || el.textContent)));
  }

  function pageText() {
    const root = document.querySelector('main,[role="main"]') ||
      document.body;
    return norm(root.innerText.replace(panel.innerText, ''));
  }

  function halt(message) {
    const state = load();
    if (state) {
      state.running = false;
      save(state);
    }
    show('Stopped.\n' + message +
      '\nInspect this page before starting a new queue.');
  }

  stop.onclick = () => {
    sessionStorage.removeItem(KEY);
    show('Stopped. Queue cleared. No further clicks will be made.');
  };

  function advance(kind) {
    const state = load();
    if (!state?.running) return;

    if (kind === 'confirmed') state.confirmed++;
    else state.skipped++;

    state.queue.shift();

    if (!state.queue.length) {
      state.running = false;
      save(state);
      show(`Finished.\nConfirmed: ${state.confirmed}\n` +
        `Skipped: ${state.skipped}\nRefresh the device list to review.`);
      return;
    }

    save(state);
    location.assign(state.queue[0]);
  }

  start.onclick = () => {
    if (load()?.running) return;

    if (isDetail()) {
      show('Open the main device list first, then start.');
      return;
    }

    const entries = new Map();

    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin ||
          !/^\/device-activity\/id\/[^/]+\/?$/.test(url.pathname)) {
        continue;
      }

      const old = entries.get(url.pathname);
      entries.set(url.pathname, {
        url: url.href,
        text: norm((old?.text || '') + ' ' + link.innerText)
      });
    }

    const queue = [...entries.values()]
      .filter(entry =>
        !/\byour current session\b|\bsigned out\b/i.test(entry.text))
      .map(entry => entry.url);

    if (!queue.length) {
      show('No eligible device links found. Scroll the device list first.');
      return;
    }

    if (!confirm(
      `Attempt to sign out ${queue.length} sessions on your account?\n\n` +
      'This tab will navigate through each device.\n' +
      'Do not use this tab for anything else while it runs.\n' +
      'You may need to sign back in on your other devices.'
    )) return;

    save({
      running: true,
      queue,
      confirmed: 0,
      skipped: 0
    });

    location.assign(queue[0]);
  };

  async function run() {
    const state = load();

    if (!state?.running) {
      show('Ready. Open the main device list, scroll down, then start.');
      return;
    }

    start.disabled = true;

    const expected = new URL(state.queue[0]).pathname;
    if (location.pathname !== expected) {
      halt('Navigation did not reach the expected device page.');
      return;
    }

    show(`Remaining: ${state.queue.length}\n` +
      `Confirmed: ${state.confirmed}\nWaiting for device controls…`);

    const deadline = Date.now() + 20000;
    let signOut = null;

    while (Date.now() < deadline && load()?.running) {
      const text = pageText();

      if (/\byour current session\b/i.test(text)) {
        advance('skipped');
        return;
      }

      const found = buttons();

      if (!found.length && /\bsigned out\b/i.test(text)) {
        advance('skipped');
        return;
      }

      if (found.length === 1) {
        signOut = found[0];
        break;
      }

      await sleep(400);
    }

    if (!load()?.running) return;

    if (!signOut) {
      halt('Could not identify exactly one Sign out control.');
      return;
    }

    signOut.click();
    show('Sign out clicked. Waiting for confirmation or success…');

    let confirmedDialog = false;
    const finishDeadline = Date.now() + 20000;

    while (Date.now() < finishDeadline && load()?.running) {
      await sleep(400);

      const dialogs = [...document.querySelectorAll(
        '[role="dialog"],[role="alertdialog"],dialog[open]'
      )].filter(visible);

      if (dialogs.length) {
        const found = dialogs.flatMap(dialog => buttons(dialog));

        if (!confirmedDialog && found.length === 1) {
          confirmedDialog = true;
          found[0].click();
          show('Confirmation clicked. Waiting for verified result…');
        }
        continue;
      }

      const successShown = [...document.querySelectorAll(
        '[role="status"], [role="alert"], [aria-live], div, span'
      )].some(el =>
        !panel.contains(el) &&
        visible(el) &&
        /^successfully signed out[.!]?$/i.test(
          norm(el.innerText || el.textContent)
        )
      );

      if (successShown) {
        show('Google confirmed sign-out. Moving to next entry…');
        await sleep(1200);
        advance('confirmed');
        return;
      }

      if (
        isDetail() &&
        /\bsigned out\b/i.test(pageText()) &&
        buttons().length === 0
      ) {
        show('Signed-out device state verified. Moving to next entry…');
        await sleep(1200);
        advance('confirmed');
        return;
      }
    }

    if (load()?.running) {
      halt('The click was made, but success was not verified. ' +
        'This session may have signed out; check the page.');
    }
  }

  run().catch(error => halt(error.message));
})();
